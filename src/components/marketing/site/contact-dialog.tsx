"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowSquareOut, Check, CheckCircle, Phone, X } from "@phosphor-icons/react";
import { Mark } from "@/components/marketing/brand/mark";
import { useContact } from "@/components/marketing/site/contact-context";
import { trackGoogleEvent } from "@/lib/google-tag";
import {
  BOOKING_BUDGETS,
  BOOKING_CURRENT_SITE,
  BOOKING_SERVICES,
  BOOKING_TIMELINES,
  BOOKING_URL,
  bookingEmbedUrl,
  CONTACT_CONSENT_TEXT,
} from "@/lib/marketing/booking";
import { CTA_LABEL, SITE } from "@/lib/marketing/site";

type Step = "service" | "site" | "timeline" | "budget" | "details" | "calendar" | "sent";
type Status = "idle" | "sending" | "error";

const QUESTIONS: Step[] = ["service", "site", "timeline", "budget", "details"];
const NOT_SURE = "Not sure yet";

const EMPTY = {
  services: [] as string[],
  currentSite: "",
  timeline: "",
  budget: "",
  name: "",
  email: "",
  phone: "",
  business: "",
  message: "",
  consent: false,
  website: "", // honeypot
};

/**
 * The get-started form. Four quick questions (what, their site today, how
 * soon, what budget), then who they are and their consent to be contacted,
 * then the calendar. The answers post to /api/contact, which emails the
 * studio inbox and files the lead in the Command Center, before the calendar
 * opens, so a visitor who never picks a time still reaches us.
 */
export function ContactDialog() {
  const { isOpen, close } = useContact();
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("service");
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const heading = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const advance = useRef<number | undefined>(undefined);

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (isOpen) {
      returnFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      returnFocus.current?.focus?.();
      window.clearTimeout(advance.current);
      const t = window.setTimeout(() => {
        setStep("service");
        setForm(EMPTY);
        setStatus("idle");
      }, 300);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  // Each step announces itself: focus lands on its question, not on the page.
  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => heading.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [isOpen, step]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  function go(next: Step) {
    window.clearTimeout(advance.current);
    setStep(next);
  }

  // Single-answer questions move on by themselves, after a beat to see the tick.
  function choose(key: "currentSite" | "timeline" | "budget", value: string, next: Step) {
    set(key, value);
    window.clearTimeout(advance.current);
    advance.current = window.setTimeout(() => setStep(next), reduce ? 0 : 240);
  }

  function toggleService(value: string) {
    setForm((f) => {
      if (f.services.includes(value)) return { ...f, services: f.services.filter((s) => s !== value) };
      // "Not sure yet" and a specific service don't belong together.
      const rest = value === NOT_SURE ? [] : f.services.filter((s) => s !== NOT_SURE);
      return { ...f, services: [...rest, value] };
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: form.services,
          currentSite: form.currentSite,
          timeline: form.timeline,
          budget: form.budget,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          business: form.business.trim() || undefined,
          message: form.message.trim() || undefined,
          consent: form.consent,
          consentText: CONTACT_CONSENT_TEXT,
          website: form.website,
        }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      trackGoogleEvent("generate_lead", {
        lead_source: "site-contact-form",
        service: form.services.join(", "),
        timeline: form.timeline,
        budget: form.budget,
      });
      setStatus("idle");
      go(BOOKING_URL ? "calendar" : "sent");
    } catch {
      setStatus("error");
    }
  }

  const index = QUESTIONS.indexOf(step);
  const asking = index !== -1;
  const firstName = form.name.trim().split(/\s+/)[0];

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 cursor-default bg-[rgba(8,12,17,0.72)]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            initial={{ y: reduce ? 0 : 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduce ? 0 : 16, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`relative max-h-[92dvh] w-full overflow-y-auto border border-[var(--rule)] bg-[var(--bg)] text-[var(--fg)] shadow-[var(--shadow)] ${
              step === "calendar" ? "max-w-[60rem]" : "max-w-[40rem]"
            }`}
          >
            <div className="border-b border-[var(--rule)]">
              <div className="flex items-start justify-between gap-6 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-3.5">
                  <Mark className="h-8 w-8" />
                  <div>
                    <h2 id="contact-title" className="ak-display text-[1.7rem] leading-none">
                      {CTA_LABEL}
                    </h2>
                    <p className="mt-1.5 text-sm text-[var(--dim)]">A few quick questions, then pick a time to talk.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--rule-strong)] hover:border-[var(--fg)]"
                >
                  <X size={16} />
                </button>
              </div>
              {asking ? (
                <div className="flex gap-1 px-6 pb-4 sm:px-8" aria-hidden="true">
                  {QUESTIONS.map((q, i) => (
                    <span
                      key={q}
                      className={`h-[3px] flex-1 transition-colors duration-300 ${i <= index ? "bg-[var(--accent)]" : "bg-[var(--rule)]"}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {step === "sent" ? (
              <div className="flex flex-col items-center px-8 py-16 text-center">
                <CheckCircle size={40} weight="light" className="text-[var(--accent-text)]" />
                <p ref={heading} tabIndex={-1} className="ak-display mt-5 text-3xl outline-none">
                  Thanks, {firstName}.
                </p>
                <p className="mt-3 max-w-[36ch] text-[var(--dim)]">
                  We&apos;ll reply to {form.email} within one business day to set a time. If it&apos;s urgent, ring{" "}
                  <a href={SITE.phoneHref} className="text-link text-[var(--fg)]">{SITE.phone}</a>.
                </p>
                <button type="button" onClick={close} className="ak-btn ak-btn-ghost mt-8">Close</button>
              </div>
            ) : step === "calendar" ? (
              <div className="px-4 pb-6 pt-6 sm:px-8">
                <h3 ref={heading} tabIndex={-1} className="ak-display text-[1.55rem] leading-tight outline-none">
                  Thanks, {firstName}. Now pick a time to talk.
                </h3>
                <p className="mt-1.5 text-sm text-[var(--dim)]">
                  Your answers are already with us. Choose any open slot and the confirmation lands in your inbox.
                </p>
                <iframe
                  src={bookingEmbedUrl(BOOKING_URL)}
                  title="Pick a time to talk"
                  className="mt-5 h-[min(640px,62dvh)] w-full border border-[var(--rule)] bg-white"
                />
                <p className="mt-4 text-sm text-[var(--dim)]">
                  Calendar not loading?{" "}
                  <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1 text-[var(--fg)]">
                    Open it in a new tab <ArrowSquareOut size={13} aria-hidden="true" />
                  </a>
                  . Nothing that suits? We&apos;ll email {form.email} within one business day.
                </p>
              </div>
            ) : (
              <div className="grid gap-0 sm:grid-cols-[1fr_13rem]">
                <div className="px-6 py-7 sm:px-8">
                  <p className="meta">Step {index + 1} of {QUESTIONS.length}</p>

                  {step === "service" ? (
                    <>
                      <Question heading={heading} title="What can we help with?" hint="Pick any that apply." />
                      <div role="group" aria-label="Services" className="mt-5 grid gap-2">
                        {BOOKING_SERVICES.map((s) => (
                          <Option key={s} label={s} multi selected={form.services.includes(s)} onClick={() => toggleService(s)} />
                        ))}
                      </div>
                      <Nav next={() => go("site")} nextDisabled={!form.services.length} />
                    </>
                  ) : step === "site" ? (
                    <>
                      <Question heading={heading} title="Do you have a website today?" />
                      <div role="group" aria-label="Current website" className="mt-5 grid gap-2">
                        {BOOKING_CURRENT_SITE.map((c) => (
                          <Option
                            key={c.value}
                            label={c.value}
                            hint={c.hint}
                            selected={form.currentSite === c.value}
                            onClick={() => choose("currentSite", c.value, "timeline")}
                          />
                        ))}
                      </div>
                      <Nav back={() => go("service")} next={() => go("timeline")} nextDisabled={!form.currentSite} />
                    </>
                  ) : step === "timeline" ? (
                    <>
                      <Question heading={heading} title="How soon do you need it?" />
                      <div role="group" aria-label="Timeline" className="mt-5 grid gap-2">
                        {BOOKING_TIMELINES.map((t) => (
                          <Option
                            key={t.value}
                            label={t.value}
                            hint={t.hint}
                            selected={form.timeline === t.value}
                            onClick={() => choose("timeline", t.value, "budget")}
                          />
                        ))}
                      </div>
                      <Nav back={() => go("site")} next={() => go("budget")} nextDisabled={!form.timeline} />
                    </>
                  ) : step === "budget" ? (
                    <>
                      <Question heading={heading} title="What budget are you working with?" hint="A rough range is fine. It shapes what we suggest." />
                      <div role="group" aria-label="Budget" className="mt-5 grid gap-2">
                        {BOOKING_BUDGETS.map((b) => (
                          <Option
                            key={b.value}
                            label={b.value}
                            hint={b.hint}
                            selected={form.budget === b.value}
                            onClick={() => choose("budget", b.value, "details")}
                          />
                        ))}
                      </div>
                      <Nav back={() => go("timeline")} next={() => go("details")} nextDisabled={!form.budget} />
                    </>
                  ) : (
                    <form onSubmit={submit}>
                      <Question heading={heading} title="Who should we talk to?" />
                      <p className="meta mt-2">
                        {form.services.join(", ")} · {form.currentSite} · {form.timeline} · {form.budget}
                      </p>
                      <div className="mt-5 grid gap-5">
                        <div>
                          <label htmlFor="c-name" className="field-label">Your name</label>
                          <input id="c-name" className="field" autoComplete="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="c-email" className="field-label">Email</label>
                          <input
                            id="c-email"
                            type="email"
                            className="field"
                            autoComplete="email"
                            required
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                          />
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <label htmlFor="c-phone" className="field-label">Phone</label>
                            <input
                              id="c-phone"
                              type="tel"
                              className="field"
                              autoComplete="tel"
                              required
                              minLength={7}
                              value={form.phone}
                              onChange={(e) => set("phone", e.target.value)}
                            />
                          </div>
                          <div>
                            <label htmlFor="c-business" className="field-label">
                              Business <span className="font-normal text-[var(--dim)]">(optional)</span>
                            </label>
                            <input
                              id="c-business"
                              className="field"
                              autoComplete="organization"
                              value={form.business}
                              onChange={(e) => set("business", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="c-msg" className="field-label">
                            Anything we should know? <span className="font-normal text-[var(--dim)]">(optional)</span>
                          </label>
                          <textarea
                            id="c-msg"
                            className="field min-h-24 resize-y"
                            placeholder="What's getting in the way, a site you like, a deadline."
                            value={form.message}
                            onChange={(e) => set("message", e.target.value)}
                          />
                        </div>
                        <label className="flex items-start gap-3 text-sm leading-relaxed text-[var(--fg-2)]">
                          <input
                            type="checkbox"
                            required
                            checked={form.consent}
                            onChange={(e) => set("consent", e.target.checked)}
                            className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
                          />
                          <span>
                            {CONTACT_CONSENT_TEXT} See our{" "}
                            <a href="/legal/privacy" target="_blank" className="text-link text-[var(--fg)]">Privacy Policy</a> and{" "}
                            <a href="/legal/sms" target="_blank" className="text-link text-[var(--fg)]">SMS terms</a>.
                          </span>
                        </label>
                        <input
                          type="text"
                          name="website"
                          tabIndex={-1}
                          autoComplete="off"
                          aria-hidden="true"
                          className="absolute left-[-9999px] h-px w-px opacity-0"
                          value={form.website}
                          onChange={(e) => set("website", e.target.value)}
                        />
                      </div>
                      {status === "error" ? (
                        <p className="field-error" role="alert">
                          That didn&apos;t send. Email us at{" "}
                          <a className="underline" href={`mailto:${SITE.email}`}>{SITE.email}</a> or call {SITE.phone}.
                        </p>
                      ) : null}
                      <Nav
                        back={() => go("budget")}
                        submit
                        nextDisabled={status === "sending" || !form.consent}
                        nextLabel={status === "sending" ? "Sending" : BOOKING_URL ? "Pick a time" : "Send it over"}
                      />
                    </form>
                  )}
                </div>

                <aside className="border-t border-[var(--rule)] bg-[var(--bg-2)] px-6 py-7 sm:border-l sm:border-t-0 sm:px-6">
                  <p className="text-sm text-[var(--dim)]">Rather talk now?</p>
                  <a
                    href={SITE.phoneHref}
                    className="figure mt-2 flex items-center gap-2 whitespace-nowrap text-[1.05rem] text-[var(--fg)] hover:text-[var(--accent-text)]"
                  >
                    <Phone size={17} aria-hidden="true" />
                    {SITE.phone}
                  </a>
                  <p className="mt-1 text-sm text-[var(--dim)]">{SITE.hours}</p>
                  <p className="mt-6 text-sm leading-relaxed text-[var(--dim)]">
                    You&apos;ll speak with Ashish or Terri, the people who&apos;ll actually do the work. If
                    we&apos;re not the right fit we&apos;ll say so on the call.
                  </p>
                </aside>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Question({ heading, title, hint }: { heading: React.RefObject<HTMLHeadingElement | null>; title: string; hint?: string }) {
  return (
    <>
      <h3 ref={heading} tabIndex={-1} className="ak-display mt-2 text-[1.55rem] leading-tight outline-none">
        {title}
      </h3>
      {hint ? <p className="mt-1.5 text-sm text-[var(--dim)]">{hint}</p> : null}
    </>
  );
}

function Option({
  label,
  hint,
  selected,
  multi = false,
  onClick,
}: {
  label: string;
  hint?: string | null;
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-4 border px-4 py-3 text-left transition-colors duration-200 ${
        selected ? "border-[var(--fg)] bg-[var(--bg-2)]" : "border-[var(--rule-strong)] hover:border-[var(--fg-2)]"
      }`}
    >
      <span>
        <span className="block text-[0.98rem] text-[var(--fg)]">{label}</span>
        {hint ? <span className="mt-0.5 block text-sm text-[var(--dim)]">{hint}</span> : null}
      </span>
      <span
        aria-hidden="true"
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-200 ${multi ? "" : "rounded-full"} ${
          selected ? "border-[var(--fg)] bg-[var(--fg)] text-[var(--bg)]" : "border-[var(--rule-strong)]"
        }`}
      >
        {selected ? <Check size={12} weight="bold" /> : null}
      </span>
    </button>
  );
}

function Nav({
  back,
  next,
  submit = false,
  nextDisabled = false,
  nextLabel = "Next",
}: {
  back?: () => void;
  next?: () => void;
  submit?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="mt-7 flex items-center justify-between gap-3">
      {back ? (
        <button type="button" onClick={back} className="ak-btn ak-btn-ghost">
          <ArrowLeft size={15} aria-hidden="true" />
          Back
        </button>
      ) : (
        <span />
      )}
      <button type={submit ? "submit" : "button"} onClick={submit ? undefined : next} disabled={nextDisabled} className="ak-btn ak-btn-primary">
        {nextLabel}
        <ArrowRight size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
