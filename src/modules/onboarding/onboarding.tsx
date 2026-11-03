"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Upload } from "lucide-react";
import { ART } from "@/lib/art";
import { cn, money } from "@/lib/utils";
import { Button, Checkbox, Field, Input, Select, Textarea } from "@/components/ui";
import { Lockup, Mark } from "@/components/ui/brand";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { OnboardingState } from "./queries";
import { authorizeSms, completeOnboarding, saveBrand, saveBusiness, saveServices, saveSmsDraft } from "./actions";
import { ENTITY_TYPES, USE_CASES, consentText, defaultSampleMessage } from "./consent";

type StepKey = "welcome" | "business" | "brand" | "services" | "retainer" | "done";
const ORDER: StepKey[] = ["welcome", "business", "brand", "services", "retainer", "done"];
const IMAGE: Record<StepKey, string> = {
  welcome: ART.onboarding.welcome,
  business: ART.onboarding.details,
  brand: ART.onboarding.details,
  services: ART.onboarding.documents,
  retainer: ART.onboarding.documents,
  done: ART.onboarding.done,
};

const INDUSTRIES = ["Dental", "Healthcare", "Home services", "Landscaping", "Legal", "Real estate", "Restaurant", "Retail", "Fitness", "Beauty", "Auto", "Professional services", "Other"];

type Fields = Record<string, string>;

export function Onboarding({ slug, initial, userName }: { slug: string; initial: OnboardingState; userName: string }) {
  const router = useRouter();
  const startStep = (ORDER.includes(initial.step as StepKey) ? initial.step : "welcome") as StepKey;
  const [step, setStep] = React.useState<StepKey>(startStep);
  const [dir, setDir] = React.useState<1 | -1>(1);
  const [sub, setSub] = React.useState(0); // retainer sub-step: 0 business, 1 campaign, 2 authorize
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const [biz, setBiz] = React.useState<Fields>({
    name: initial.business.name,
    legalName: initial.business.legalName,
    website: initial.business.website,
    phone: initial.business.phone,
    industry: initial.business.industry,
    gbpUrl: initial.business.gbpUrl,
    line1: initial.business.address.line1 ?? "",
    city: initial.business.address.city ?? "",
    state: initial.business.address.state ?? "",
    zip: initial.business.address.zip ?? "",
  });
  const [accent, setAccent] = React.useState(initial.accent);
  const [logoUrl, setLogoUrl] = React.useState(initial.logoUrl);
  const [addons, setAddons] = React.useState<string[]>(initial.selectedAddons);
  const [autos, setAutos] = React.useState<string[]>(initial.automations.filter((a) => !a.included).map((a) => a.key).filter(() => false));
  const [wantsRetainer, setWantsRetainer] = React.useState(false);

  const sb = (initial.sms?.business ?? {}) as Record<string, string | boolean | Record<string, string>>;
  const sc = (initial.sms?.contact ?? {}) as Record<string, string>;
  const sk = (initial.sms?.campaign ?? {}) as Record<string, string | string[]>;
  const addr = (sb.address ?? {}) as Record<string, string>;
  const [sms, setSms] = React.useState<Fields>({
    hasEin: sb.hasEin === false ? "no" : "yes",
    legalName: (sb.legalName as string) || initial.business.legalName,
    ein: (sb.ein as string) ?? "",
    entityType: (sb.entityType as string) || "LLC",
    industry: (sb.industry as string) || initial.business.industry || "Other",
    website: (sb.website as string) || initial.business.website,
    line1: addr.line1 ?? initial.business.address.line1 ?? "",
    city: addr.city ?? initial.business.address.city ?? "",
    state: addr.state ?? initial.business.address.state ?? "",
    zip: addr.zip ?? initial.business.address.zip ?? "",
    contactName: sc.name ?? userName,
    contactTitle: sc.title ?? "",
    contactEmail: sc.email ?? "",
    contactPhone: sc.phone ?? initial.business.phone,
    useCase: (sk.useCase as string) || "CUSTOMER_CARE",
    description: (sk.description as string) || "Review requests sent to customers after we complete a job or visit, so happy customers can leave a Google review.",
    optInFlow: (sk.optInFlow as string) ?? "",
    sample1: ((sk.sampleMessages as string[]) ?? [])[0] ?? defaultSampleMessage(initial.business.name),
    sample2: ((sk.sampleMessages as string[]) ?? [])[1] ?? "",
    privacyUrl: (sk.privacyUrl as string) ?? "",
    termsUrl: (sk.termsUrl as string) ?? "",
  });
  const [agree, setAgree] = React.useState(false);
  const [signedName, setSignedName] = React.useState("");
  const [signedTitle, setSignedTitle] = React.useState(sc.title ?? "");

  const idx = ORDER.indexOf(step);
  const total = wantsRetainer || step === "retainer" ? 8 : 5;
  const position = step === "retainer" ? 4 + sub : step === "done" ? total : idx;
  const pct = Math.round((Math.max(1, position) / total) * 100);

  const go = (to: StepKey, d: 1 | -1 = 1) => {
    setDir(d);
    setError(undefined);
    setFieldErrors({});
    setStep(to);
  };
  const back = () => {
    if (step === "retainer" && sub > 0) return setSub(sub - 1);
    const prev = ORDER[Math.max(0, idx - 1)]!;
    go(prev === "retainer" ? "services" : prev, -1);
  };

  async function run<T>(p: Promise<{ ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string> }>) {
    setBusy(true);
    setError(undefined);
    setFieldErrors({});
    const r = await p;
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      setFieldErrors(r.fieldErrors ?? {});
      return null;
    }
    return r.data;
  }

  async function next() {
    if (step === "welcome") return go("business");
    if (step === "business") {
      const r = await run(saveBusiness(slug, biz));
      if (r !== null) go("brand");
      return;
    }
    if (step === "brand") {
      const r = await run(saveBrand(slug, { accent, logoUrl }));
      if (r !== null) go("services");
      return;
    }
    if (step === "services") {
      const r = await run(saveServices(slug, { addons: addons.filter((k) => !initial.selectedAddons.includes(k) || true), automations: autos }));
      if (r === null) return;
      setWantsRetainer(r.wantsRetainer);
      if (r.wantsRetainer) {
        setSub(0);
        return go("retainer");
      }
      return go("done");
    }
    if (step === "retainer") {
      if (sub === 0) {
        const need = ["legalName", "website", "line1", "city", "state", "zip"] as const;
        const errs: Record<string, string> = {};
        for (const k of need) if (!sms[k]?.trim()) errs[k] = "Required";
        if (sms.hasEin === "yes" && !/^\d{2}-?\d{7}$/.test(sms.ein.trim())) errs.ein = "EIN looks like 12-3456789";
        if (Object.keys(errs).length) return setFieldErrors(errs);
        await saveSmsDraft(slug, smsPayload(sms));
        return setSub(1);
      }
      if (sub === 1) {
        const errs: Record<string, string> = {};
        if (sms.description.trim().length < 40) errs.description = "A sentence or two, at least 40 characters";
        if (sms.optInFlow.trim().length < 40) errs.optInFlow = "Describe how customers say yes to texts, at least 40 characters";
        if (sms.sample1.trim().length < 20) errs.sample1 = "Write a real example message";
        if (!/^https?:\/\//.test(sms.privacyUrl)) errs.privacyUrl = "Enter the full link, starting with https://";
        if (!/^https?:\/\//.test(sms.termsUrl)) errs.termsUrl = "Enter the full link, starting with https://";
        for (const k of ["contactName", "contactTitle", "contactEmail", "contactPhone"] as const) if (!sms[k]?.trim()) errs[k] = "Required";
        if (Object.keys(errs).length) return setFieldErrors(errs);
        await saveSmsDraft(slug, smsPayload(sms));
        return setSub(2);
      }
      const r = await run(authorizeSms(slug, smsPayload(sms), { agree, signedName, signedTitle }));
      if (r !== null) go("done");
      return;
    }
    if (step === "done") {
      const r = await run(completeOnboarding(slug));
      if (r !== null) {
        router.replace(`/w/${slug}`);
        router.refresh();
      }
    }
  }

  // The retainer is optional: skip it and carry on.
  async function skipRetainer() {
    go("done");
  }

  async function uploadLogo(file: File) {
    if (file.size > 5 * 1024 * 1024) return setError("Logos must be under 5 MB.");
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${initial.workspaceId}/logo-${Date.now()}.${ext}`;
    const supabase = supabaseBrowser();
    const { error } = await supabase.storage.from("brand").upload(path, file, { upsert: true, contentType: file.type });
    setBusy(false);
    if (error) return setError("That upload didn't work. Try a PNG or SVG.");
    setLogoUrl(supabase.storage.from("brand").getPublicUrl(path).data.publicUrl);
    setError(undefined);
  }

  const primaryLabel: Record<StepKey, string> = {
    welcome: "Let's begin",
    business: "Continue",
    brand: "Continue",
    services: addons.length || autos.length ? "Save my choices" : "Continue without add-ons",
    retainer: sub === 2 ? "Authorize and submit" : "Continue",
    done: `Open ${biz.name || "my workspace"}`,
  };
  const disabled = step === "retainer" && sub === 2 && !(agree && signedName.trim().length >= 3 && signedTitle.trim().length >= 2);

  const addonTotal = addons.filter((k) => !initial.selectedAddons.includes(k) || true).reduce((n, k) => n + (initial.catalog.find((c) => c.key === k)?.monthlyCents ?? 0), 0);
  const autoTotal = autos.reduce((n, k) => n + (initial.automations.find((a) => a.key === k)?.monthlyCents ?? 0), 0);

  return (
    <div className="flex min-h-dvh flex-col md:h-dvh md:flex-row md:overflow-hidden">
      {/* Artwork: a band on phones, half the screen on desktop. It changes with the step. */}
      <aside className="relative h-[24vh] shrink-0 overflow-hidden art-fallback md:h-auto md:w-[48%]">
        {ORDER.map((k) => (
          <Image
            key={k}
            src={IMAGE[k]}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 768px) 48vw, 100vw"
            priority={k === startStep}
            className={cn("object-cover transition-opacity duration-500 ease-[var(--ease)]", step === k ? "opacity-100" : "opacity-0")}
          />
        ))}
        <div className="absolute left-5 top-5 text-text">
          <Lockup compact />
        </div>
      </aside>

      <section className="flex min-h-0 flex-1 flex-col bg-bg">
        <div className="flex h-14 shrink-0 items-center gap-3 px-4 sm:px-8">
          <button onClick={back} disabled={idx === 0 && sub === 0} className="rounded-md p-2 text-text-muted hover:bg-surface-hover disabled:invisible" aria-label="Back">
            <ArrowLeft className="size-4" />
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={Math.max(1, position)} aria-label={`Step ${Math.max(1, position)} of ${total}`}>
            <div className="h-full rounded-full bg-accent transition-[width] duration-300 ease-[var(--ease-out)]" style={{ width: `${pct}%` }} />
          </div>
          <span className="tnum w-12 text-right font-mono text-[11px] text-text-faint">
            {Math.max(1, position)}/{total}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-8">
          <div key={`${step}-${sub}`} className={cn("mx-auto w-full max-w-[30rem] pt-4 md:pt-8", dir === 1 ? "animate-[ob-in_320ms_var(--ease-out)_both]" : "animate-[ob-in-back_320ms_var(--ease-out)_both]")}>
            {step === "welcome" ? (
              <Block title={`Welcome, ${userName.split(" ")[0]}.`} body="A few quick questions and your portal is ready. It takes about three minutes, and you can leave and come back; we keep your answers.">
                <ul className="mt-2 flex flex-col gap-2 text-sm text-text-muted">
                  {["Your business details", "Your logo and colour", "Add-ons you want, if any", "Optional: text messages for review requests"].map((t) => (
                    <li key={t} className="flex items-center gap-2.5">
                      <Check className="size-4 text-accent-text" /> {t}
                    </li>
                  ))}
                </ul>
              </Block>
            ) : null}

            {step === "business" ? (
              <Block title="Your business" body="This fills your portal and your Google profile work.">
                <div className="grid gap-4">
                  <Field label="Business name" htmlFor="name" error={fieldErrors.name}>
                    <Input id="name" value={biz.name} onChange={(e) => setBiz({ ...biz, name: e.target.value })} autoComplete="organization" />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Website" htmlFor="website" optional>
                      <Input id="website" value={biz.website} onChange={(e) => setBiz({ ...biz, website: e.target.value })} placeholder="https://" inputMode="url" />
                    </Field>
                    <Field label="Phone" htmlFor="phone" optional>
                      <Input id="phone" value={biz.phone} onChange={(e) => setBiz({ ...biz, phone: e.target.value })} inputMode="tel" autoComplete="tel" />
                    </Field>
                  </div>
                  <Field label="Industry" htmlFor="industry">
                    <Select id="industry" value={biz.industry} onChange={(e) => setBiz({ ...biz, industry: e.target.value })}>
                      <option value="">Choose one</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i}>{i}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Google Business Profile link" htmlFor="gbp" optional hint="Search your business on Google Maps and copy the link.">
                    <Input id="gbp" value={biz.gbpUrl} onChange={(e) => setBiz({ ...biz, gbpUrl: e.target.value })} placeholder="https://maps.google.com/…" inputMode="url" />
                  </Field>
                  <Field label="Address" htmlFor="line1" optional>
                    <Input id="line1" value={biz.line1} onChange={(e) => setBiz({ ...biz, line1: e.target.value })} autoComplete="address-line1" />
                  </Field>
                  <div className="grid grid-cols-6 gap-3">
                    <Input className="col-span-3" aria-label="City" placeholder="City" value={biz.city} onChange={(e) => setBiz({ ...biz, city: e.target.value })} autoComplete="address-level2" />
                    <Input className="col-span-1" aria-label="State" placeholder="VT" value={biz.state} onChange={(e) => setBiz({ ...biz, state: e.target.value })} autoComplete="address-level1" />
                    <Input className="col-span-2" aria-label="ZIP" placeholder="ZIP" value={biz.zip} onChange={(e) => setBiz({ ...biz, zip: e.target.value })} autoComplete="postal-code" inputMode="numeric" />
                  </div>
                </div>
              </Block>
            ) : null}

            {step === "brand" ? (
              <Block title="Your logo and colour" body="Your portal wears your brand. You can change this any time in Settings.">
                <div className="grid gap-5">
                  <Field label="Logo" optional hint="PNG or SVG, square works best.">
                    <label className="flex cursor-pointer items-center gap-4 rounded-lg border border-dashed border-border-strong p-4 hover:bg-surface-hover">
                      {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt="Your logo" className="size-12 rounded-md border border-border object-contain" />
                      ) : (
                        <span className="flex size-12 items-center justify-center rounded-md border border-border bg-bg-subtle text-text-faint">
                          <Upload className="size-5" />
                        </span>
                      )}
                      <span className="text-sm">
                        <span className="font-medium">{logoUrl ? "Replace logo" : "Upload a logo"}</span>
                        <span className="block text-text-muted">Drop a file or tap to choose</span>
                      </span>
                      <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
                    </label>
                  </Field>
                  <Field label="Brand colour" htmlFor="accent" error={fieldErrors.accent} hint="Used for buttons and highlights. We keep the rest calm.">
                    <div className="flex items-center gap-3">
                      <input id="accent" type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="size-9 cursor-pointer rounded-md border border-input bg-surface p-0.5" />
                      <Input value={accent} onChange={(e) => setAccent(e.target.value)} className="max-w-32 font-mono" maxLength={7} />
                    </div>
                  </Field>
                  <div className="rounded-lg border border-border p-4" style={{ ["--accent-9" as string]: accent }}>
                    <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-text-faint">Preview</div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium" style={{ background: accent, color: readableOn(accent) }}>
                        Send request
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: accent }}>
                        <span className="size-1.5 rounded-full" style={{ background: accent }} /> Waiting on you
                      </span>
                    </div>
                  </div>
                </div>
              </Block>
            ) : null}

            {step === "services" ? (
              <Block title="Anything to add?" body="Your plan covers the core. These are optional, billed monthly, and you can switch any of them on or off later. New ones start with a 14-day trial.">
                <div className="grid gap-2.5">
                  {initial.catalog.map((c) => (
                    <Choice key={c.key} selected={addons.includes(c.key)} onClick={() => setAddons(toggle(addons, c.key))} title={c.name} hint={c.blurb} right={`${money(c.monthlyCents)}/mo`} sub={c.key === "chatbot" ? "Includes 2,000 messages a month. Then $25 per extra 1,000." : undefined} />
                  ))}
                </div>
                <h3 className="mb-2 mt-6 text-sm font-semibold">Automations</h3>
                <div className="grid gap-2.5">
                  {initial.automations.map((a) =>
                    a.included ? (
                      <div key={a.key} className="flex items-center gap-3 rounded-lg border border-border bg-bg-subtle px-4 py-3 text-sm">
                        <Check className="size-4 text-success" />
                        <div className="flex-1">
                          <div className="font-medium">{a.name}</div>
                          <div className="text-xs text-text-muted">{a.blurb}</div>
                        </div>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-text-faint">Included</span>
                      </div>
                    ) : (
                      <Choice key={a.key} selected={autos.includes(a.key)} onClick={() => setAutos(toggle(autos, a.key))} title={a.name} hint={a.blurb} right={`${money(a.monthlyCents)}/mo`} />
                    ),
                  )}
                </div>
                <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4 text-sm">
                  <span className="text-text-muted">Your plan, per month</span>
                  <span className="tnum font-serif text-xl">{money(30000 + addonTotal + autoTotal)}</span>
                </div>
                <p className="mt-1 text-xs text-text-faint">Growth Partnership {money(30000)} + add-ons {money(addonTotal + autoTotal)}. Trials aren't charged until they end.</p>
              </Block>
            ) : null}

            {step === "retainer" ? (
              <RetainerStep sub={sub} sms={sms} setSms={setSms} errors={fieldErrors} agree={agree} setAgree={setAgree} signedName={signedName} setSignedName={setSignedName} signedTitle={signedTitle} setSignedTitle={setSignedTitle} />
            ) : null}

            {step === "done" ? (
              <Block title="You're set." body={`${biz.name} is ready. Your team at ArkiTech has everything we need to start.`}>
                <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
                  <Row label="Business" value={biz.name} />
                  <Row label="Brand colour" value={<span className="inline-flex items-center gap-2"><span className="size-3 rounded-full border border-border" style={{ background: accent }} />{accent}</span>} />
                  <Row label="Add-ons" value={addons.length ? `${addons.length} on trial` : "None yet"} />
                  <Row label="Text messaging" value={wantsRetainer ? "Registration submitted" : "Not set up"} />
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs text-text-faint">
                  <Mark size={14} draw /> We'll message you the moment anything needs a decision.
                </div>
              </Block>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-bg px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] sm:px-8">
          <div className="mx-auto flex w-full max-w-[30rem] flex-col gap-2">
            {error ? (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}
            <Button variant="primary" size="lg" loading={busy} disabled={disabled} onClick={next} className="w-full">
              {primaryLabel[step]}
            </Button>
            {step === "retainer" ? (
              <button onClick={skipRetainer} className="py-1 text-sm text-text-muted underline-offset-4 hover:text-text hover:underline">
                Not now. I'll set this up later.
              </button>
            ) : null}
          </div>
        </div>
      </section>
      <style>{`@keyframes ob-in{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}@keyframes ob-in-back{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

function RetainerStep({
  sub,
  sms,
  setSms,
  errors,
  agree,
  setAgree,
  signedName,
  setSignedName,
  signedTitle,
  setSignedTitle,
}: {
  sub: number;
  sms: Fields;
  setSms: (f: Fields) => void;
  errors: Record<string, string>;
  agree: boolean;
  setAgree: (v: boolean) => void;
  signedName: string;
  setSignedName: (v: string) => void;
  signedTitle: string;
  setSignedTitle: (v: string) => void;
}) {
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setSms({ ...sms, [k]: e.target.value });
  if (sub === 0)
    return (
      <Block eyebrow="Review retainer · 1 of 3" title="Who is sending the texts?" body="Carriers check every business before it can text customers. These details must match your IRS paperwork exactly, or it gets rejected.">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Do you have an EIN?">
            <Choice selected={sms.hasEin === "yes"} onClick={() => setSms({ ...sms, hasEin: "yes" })} title="We have an EIN" hint="Most businesses do." />
            <Choice selected={sms.hasEin === "no"} onClick={() => setSms({ ...sms, hasEin: "no", ein: "", entityType: "Sole proprietor" })} title="No EIN" hint="Sole proprietors." />
          </div>
          <Field label="Legal business name" htmlFor="legalName" error={errors.legalName} hint="Exactly as on your IRS letter, not your DBA.">
            <Input id="legalName" value={sms.legalName} onChange={set("legalName")} />
          </Field>
          {sms.hasEin === "yes" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="EIN" htmlFor="ein" error={errors.ein}>
                <Input id="ein" value={sms.ein} onChange={set("ein")} placeholder="12-3456789" inputMode="numeric" />
              </Field>
              <Field label="Business type" htmlFor="entityType">
                <Select id="entityType" value={sms.entityType} onChange={set("entityType")}>
                  {ENTITY_TYPES.filter((t) => t !== "Sole proprietor").map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </Field>
            </div>
          ) : null}
          <Field label="Website" htmlFor="swebsite" error={errors.website} hint="Must be live and public, no login.">
            <Input id="swebsite" value={sms.website} onChange={set("website")} placeholder="https://" inputMode="url" />
          </Field>
          <Field label="Business address" htmlFor="sline1" error={errors.line1}>
            <Input id="sline1" value={sms.line1} onChange={set("line1")} />
          </Field>
          <div className="grid grid-cols-6 gap-3">
            <Field label="City" className="col-span-3" error={errors.city}>
              <Input value={sms.city} onChange={set("city")} />
            </Field>
            <Field label="State" className="col-span-1" error={errors.state}>
              <Input value={sms.state} onChange={set("state")} />
            </Field>
            <Field label="ZIP" className="col-span-2" error={errors.zip}>
              <Input value={sms.zip} onChange={set("zip")} inputMode="numeric" />
            </Field>
          </div>
        </div>
      </Block>
    );
  if (sub === 1)
    return (
      <Block eyebrow="Review retainer · 2 of 3" title="What will you text, and who said yes?" body="This is the part carriers reject most. Be specific. Only text people who agreed to hear from you.">
        <div className="grid gap-4">
          <div className="grid gap-2.5">
            {USE_CASES.map((u) => (
              <Choice key={u.value} selected={sms.useCase === u.value} onClick={() => setSms({ ...sms, useCase: u.value })} title={u.label} hint={u.hint} />
            ))}
          </div>
          <Field label="What the messages are for" htmlFor="description" error={errors.description}>
            <Textarea id="description" value={sms.description} onChange={set("description")} rows={3} />
          </Field>
          <Field label="How customers agree to receive texts" htmlFor="optin" error={errors.optInFlow} hint="For example: a checkbox on our intake form, or they give their number at the front desk and sign.">
            <Textarea id="optin" value={sms.optInFlow} onChange={set("optInFlow")} rows={3} />
          </Field>
          <Field label="Example message" htmlFor="sample1" error={errors.sample1} hint="Name your business and include “Reply STOP to opt out.”">
            <Textarea id="sample1" value={sms.sample1} onChange={set("sample1")} rows={3} />
          </Field>
          <Field label="Second example" htmlFor="sample2" optional>
            <Textarea id="sample2" value={sms.sample2} onChange={set("sample2")} rows={2} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Privacy policy link" htmlFor="privacy" error={errors.privacyUrl} hint="Must say you don't share mobile numbers.">
              <Input id="privacy" value={sms.privacyUrl} onChange={set("privacyUrl")} placeholder="https://" inputMode="url" />
            </Field>
            <Field label="SMS terms link" htmlFor="terms" error={errors.termsUrl}>
              <Input id="terms" value={sms.termsUrl} onChange={set("termsUrl")} placeholder="https://" inputMode="url" />
            </Field>
          </div>
          <p className="-mt-2 text-xs text-text-muted">No privacy or SMS terms page yet? Tell us in a request and we'll write and publish both for you.</p>
          <hr className="border-border" />
          <p className="text-sm font-medium">Who should carriers contact?</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.contactName}>
              <Input value={sms.contactName} onChange={set("contactName")} autoComplete="name" />
            </Field>
            <Field label="Title" error={errors.contactTitle}>
              <Input value={sms.contactTitle} onChange={set("contactTitle")} placeholder="Owner" />
            </Field>
            <Field label="Business email" error={errors.contactEmail} hint="Carriers send a confirmation here.">
              <Input value={sms.contactEmail} onChange={set("contactEmail")} type="email" autoComplete="email" />
            </Field>
            <Field label="Phone" error={errors.contactPhone}>
              <Input value={sms.contactPhone} onChange={set("contactPhone")} inputMode="tel" autoComplete="tel" />
            </Field>
          </div>
        </div>
      </Block>
    );
  return (
    <Block eyebrow="Review retainer · 3 of 3" title="Authorize us to register" body="Read this, then sign. Nothing is submitted to carriers until you do.">
      <div className="grid gap-4">
        <div className="rounded-lg border border-border bg-bg-subtle p-4 text-sm leading-relaxed">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">What happens</div>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 text-text-muted">
            <li>We register {sms.legalName || "your business"} and your messaging campaign with carriers.</li>
            <li>Carrier review takes about 1 to 4 weeks. You'll see the status in Automations.</li>
            <li>Then we send review requests from a number tied to your business, only to customers who opted in.</li>
            <li>Carriers charge small registration fees. We'll show them before anything is billed.</li>
          </ul>
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 text-sm leading-relaxed">
          <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
          <span>{consentText(sms.legalName)}</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type your full name" htmlFor="signedName" error={errors.signedName}>
            <Input id="signedName" value={signedName} onChange={(e) => setSignedName(e.target.value)} autoComplete="name" />
          </Field>
          <Field label="Title" htmlFor="signedTitle" error={errors.signedTitle}>
            <Input id="signedTitle" value={signedTitle} onChange={(e) => setSignedTitle(e.target.value)} placeholder="Owner" />
          </Field>
        </div>
        <p className="text-xs text-text-faint">We record your name, the time, your IP address and the exact wording above, so there's a clear record of what you agreed to.</p>
      </div>
    </Block>
  );
}

function Block({ eyebrow, title, body, children }: { eyebrow?: string; title: string; body?: string; children?: React.ReactNode }) {
  return (
    <div>
      {eyebrow ? <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted">{eyebrow}</div> : null}
      <h1 className="font-serif text-xl sm:text-2xl">{title}</h1>
      {body ? <p className="mb-6 mt-2 text-sm leading-relaxed text-text-muted">{body}</p> : <div className="mb-6" />}
      {children}
    </div>
  );
}

/** A selectable card with a thick bottom edge that presses down, as in the Bible Transfer first-run. */
function Choice({ selected, onClick, title, hint, right, sub }: { selected: boolean; onClick: () => void; title: string; hint?: string; right?: string; sub?: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border bg-surface px-4 py-3 text-left transition-[transform,border-color,background-color] duration-150 active:translate-y-px active:border-b",
        "border-b-[3px]",
        selected ? "border-accent border-b-accent bg-accent-subtle" : "border-border-strong hover:border-neutral-9",
      )}
    >
      <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border", selected ? "border-accent bg-accent text-on-accent" : "border-border-strong text-transparent")}>
        <Check className="size-3" strokeWidth={3} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        {hint ? <span className="block text-xs text-text-muted">{hint}</span> : null}
        {sub ? <span className="mt-0.5 block text-xs text-text-faint">{sub}</span> : null}
      </span>
      {right ? <span className="tnum shrink-0 font-mono text-xs text-text-muted">{right}</span> : null}
    </button>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function toggle(list: string[], key: string) {
  return list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
}

function smsPayload(s: Fields) {
  return { ...s, hasEin: s.hasEin === "yes" };
}

function readableOn(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  if (Number.isNaN(n)) return "#fff";
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#1a1a1a" : "#ffffff";
}
