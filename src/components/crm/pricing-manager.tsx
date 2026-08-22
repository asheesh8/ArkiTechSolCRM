"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { PRICING_GROUPS, type PricingPlan } from "@/lib/pricing";

/**
 * Edits the public pricing table from inside the CRM.
 *
 * Owners work in dollars; the API stores cents. The conversion happens at the
 * two edges here so nobody has to think about it — and so a typo in a dollar
 * field can't quietly become a hundredfold price change.
 */

type Draft = PricingPlan & {
  featuresText: string;
  /**
   * The dollar text exactly as typed, kept verbatim.
   *
   * These are the source of truth for the money fields; the cents alongside
   * them are derived. Deriving the other way is what broke: regenerating the
   * box from cents on every keystroke ate the decimal point, because
   * Number("12.") is 12, and every digit after it landed as whole dollars.
   */
  monthlyText: string;
  onceText: string;
};

const BLANK: Draft = {
  slug: "",
  group: "websites",
  name: "",
  blurb: "",
  monthlyCents: null,
  onceCents: null,
  priceNote: null,
  features: [],
  featured: false,
  active: true,
  sortOrder: 0,
  featuresText: "",
  monthlyText: "",
  onceText: "",
};

/** Cents -> a dollar string for the input. Empty when the price isn't set. */
function toDollars(cents: number | null) {
  if (cents == null) return "";
  return String(cents / 100);
}

/**
 * A dollar string -> cents, plus what is wrong with it if anything.
 *
 * Blank means "no price", which is a real answer. Anything that is not an
 * amount is reported instead of quietly becoming null, because silently
 * clearing a live price is the same class of accident as silently multiplying
 * one. A trailing "." is accepted so a half-typed "12." survives while the
 * owner is still typing "12.50".
 */
function parseDollars(value: string): { cents: number | null; error: string | null } {
  const trimmed = value.trim();
  if (!trimmed) return { cents: null, error: null };

  const cleaned = trimmed.replace(/[$,\s]/g, "");
  const shaped = /^\d*(\.\d{0,2})?$/.test(cleaned) && cleaned !== "" && cleaned !== ".";
  if (!shaped) return { cents: null, error: "Amounts look like 1500 or 12.50." };

  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return { cents: null, error: "Amounts look like 1500 or 12.50." };
  return { cents: Math.round(n * 100), error: null };
}

/**
 * Read a JSON body without letting a parse failure impersonate the error.
 *
 * A 500, a gateway timeout, or anything else the platform answers with comes
 * back as HTML, and calling res.json() on that throws — in Safari with the
 * message "The string did not match the expected pattern", which then lands in
 * the owner's error line as though it were something they typed. Check the
 * status first and treat an unreadable body as "no detail given" rather than as
 * the problem itself.
 */
async function readJson(res: Response): Promise<Record<string, unknown>> {
  return (await res.json().catch(() => ({}))) as Record<string, unknown>;
}

/** The server's own message when it sent one, otherwise something diagnosable. */
function errorFrom(res: Response, data: Record<string, unknown>, fallback: string) {
  if (typeof data.error === "string" && data.error) return data.error;
  return `${fallback} The server answered ${res.status} without saying why.`;
}

export function PricingManager() {
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/settings/pricing");
        const data = await readJson(res);
        if (!res.ok) throw new Error(errorFrom(res, data, "Couldn't load pricing."));
        if (cancelled) return;
        const { plans, seeded: isSeeded } = data as unknown as { plans: PricingPlan[]; seeded: boolean };
        setSeeded(isSeeded);
        setDrafts(
          plans.map((p) => ({
            ...p,
            featuresText: p.features.join("\n"),
            monthlyText: toDollars(p.monthlyCents),
            onceText: toDollars(p.onceCents),
          })),
        );
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(err instanceof Error ? err.message : "Couldn't load pricing.");
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function update(index: number, patch: Partial<Draft>) {
    setDrafts((current) => current && current.map((d, i) => (i === index ? { ...d, ...patch } : d)));
    setStatus("idle");
  }

  /** Keeps the typed text and the derived cents in step, text leading. */
  function updateMoney(index: number, field: "monthly" | "once", raw: string) {
    const { cents } = parseDollars(raw);
    update(
      index,
      field === "monthly" ? { monthlyText: raw, monthlyCents: cents } : { onceText: raw, onceCents: cents },
    );
  }

  async function save() {
    if (!drafts) return;
    setStatus("saving");
    setMessage(null);

    // Refuse rather than send a coerced number. These are the prices on the
    // public site, so a field we cannot read has to stop the save.
    const bad = drafts.findIndex(
      (d) => parseDollars(d.monthlyText).error || parseDollars(d.onceText).error,
    );
    if (bad !== -1) {
      setStatus("error");
      setMessage(`Check the price on "${drafts[bad].name || "the untitled plan"}" — amounts look like 1500 or 12.50.`);
      return;
    }

    const payload = {
      plans: drafts.map(({ featuresText, monthlyText, onceText, ...plan }) => ({
        ...plan,
        // Re-read from the text so what was typed is what gets stored.
        monthlyCents: parseDollars(monthlyText).cents,
        onceCents: parseDollars(onceText).cents,
        priceNote: plan.priceNote?.trim() ? plan.priceNote.trim() : null,
        features: featuresText.split("\n").map((f) => f.trim()).filter(Boolean),
      })),
    };

    try {
      const res = await fetch("/api/settings/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readJson(res);
      if (!res.ok) throw new Error(errorFrom(res, data, "Save failed."));
      setStatus("saved");
      setSeeded(true);
      setMessage(`Saved ${data.count} plans. The public pricing page is updating now.`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Save failed.");
    }
  }

  if (!drafts) {
    return <p className="text-sm text-zinc-500">{message ?? "Loading pricing…"}</p>;
  }

  return (
    <div className="space-y-5">
      {!seeded ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          These are the built-in starting prices. They are already live on the site — saving here takes
          over and nothing will change them again except you.
        </p>
      ) : null}

      <div className="space-y-4">
        {drafts.map((plan, i) => (
          <details
            key={plan.slug || `new-${i}`}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
              <span>{plan.name || "Untitled plan"}</span>
              <span className="font-mono text-xs font-normal text-zinc-500">
                {plan.monthlyCents != null ? `$${plan.monthlyCents / 100}/mo` : ""}
                {plan.onceCents != null ? ` $${plan.onceCents / 100} once` : ""}
              </span>
              {plan.featured ? <span className="rounded bg-[var(--accent)] px-1.5 py-0.5 text-[10px] text-white">Featured</span> : null}
              {!plan.active ? <span className="rounded bg-zinc-500 px-1.5 py-0.5 text-[10px] text-white">Hidden</span> : null}
            </summary>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`name-${i}`}>Name</Label>
                <Input id={`name-${i}`} className="mt-1.5" value={plan.name} onChange={(e) => update(i, { name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor={`group-${i}`}>Tab</Label>
                <Select id={`group-${i}`} className="mt-1.5" value={plan.group} onChange={(e) => update(i, { group: e.target.value })}>
                  {PRICING_GROUPS.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
                </Select>
              </div>

              <div>
                <Label htmlFor={`monthly-${i}`}>Per month ($)</Label>
                <Input
                  id={`monthly-${i}`}
                  className="mt-1.5"
                  inputMode="decimal"
                  placeholder="leave blank if none"
                  aria-invalid={parseDollars(plan.monthlyText).error ? true : undefined}
                  aria-describedby={parseDollars(plan.monthlyText).error ? `monthly-${i}-error` : undefined}
                  value={plan.monthlyText}
                  onChange={(e) => updateMoney(i, "monthly", e.target.value)}
                />
                {parseDollars(plan.monthlyText).error ? (
                  <p id={`monthly-${i}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {parseDollars(plan.monthlyText).error}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor={`once-${i}`}>One time ($)</Label>
                <Input
                  id={`once-${i}`}
                  className="mt-1.5"
                  inputMode="decimal"
                  placeholder="leave blank if none"
                  aria-invalid={parseDollars(plan.onceText).error ? true : undefined}
                  aria-describedby={parseDollars(plan.onceText).error ? `once-${i}-error` : undefined}
                  value={plan.onceText}
                  onChange={(e) => updateMoney(i, "once", e.target.value)}
                />
                {parseDollars(plan.onceText).error ? (
                  <p id={`once-${i}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {parseDollars(plan.onceText).error}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor={`note-${i}`}>Price prefix</Label>
                <Input
                  id={`note-${i}`}
                  className="mt-1.5"
                  placeholder='e.g. "From" — blank for an exact price'
                  value={plan.priceNote ?? ""}
                  onChange={(e) => update(i, { priceNote: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor={`order-${i}`}>Order in tab</Label>
                <Input
                  id={`order-${i}`}
                  className="mt-1.5"
                  inputMode="numeric"
                  value={String(plan.sortOrder)}
                  onChange={(e) => update(i, { sortOrder: Number(e.target.value) || 0 })}
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor={`blurb-${i}`}>One-line description</Label>
                <Textarea id={`blurb-${i}`} className="mt-1.5 min-h-16" value={plan.blurb} onChange={(e) => update(i, { blurb: e.target.value })} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor={`features-${i}`}>What&apos;s included — one per line</Label>
                <Textarea id={`features-${i}`} className="mt-1.5 min-h-40 font-mono text-xs" value={plan.featuresText} onChange={(e) => update(i, { featuresText: e.target.value })} />
              </div>

              <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={plan.featured} onChange={(e) => update(i, { featured: e.target.checked })} />
                  Highlight this one
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={plan.active} onChange={(e) => update(i, { active: e.target.checked })} />
                  Show on the site
                </label>
                <span className="font-mono text-xs text-zinc-500">{plan.slug}</span>
              </div>
            </div>
          </details>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={save} disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : "Save pricing"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setDrafts((c) => c && [...c, { ...BLANK, slug: `plan-${c.length + 1}`, sortOrder: (c.length + 1) * 10 }])}
        >
          Add a plan
        </Button>
        {message ? (
          <span className={`text-xs ${status === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {message}
          </span>
        ) : null}
      </div>
    </div>
  );
}
