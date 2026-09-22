"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMotionValueEvent, useReducedMotion, useSpring } from "framer-motion";
import { Plate } from "@/components/marketing/art/plate";

const WEEKS_PER_MONTH = 4.345;
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** A figure that counts to its new value instead of jumping. */
function Money({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const spring = useSpring(value, { stiffness: 90, damping: 20, mass: 0.6 });
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (reduce) setShown(value);
    else spring.set(value);
  }, [value, spring, reduce]);
  useMotionValueEvent(spring, "change", (v) => {
    if (!reduce) setShown(v);
  });
  return <span className={className}>{usd.format(Math.round(shown))}</span>;
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <div className="border-b border-[var(--rule)] pb-6">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[var(--fg-2)]">{label}</label>
        <span className="price text-[1.8rem] leading-none">{format(value)}</span>
      </div>
      <input
        id={id}
        className="ak-range mt-4"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/**
 * The arithmetic from "What a missed call actually costs", made live.
 * Defaults are the article's cleaning-company example.
 */
export function MissedCallCalculator() {
  const [missed, setMissed] = useState(8);
  const [job, setJob] = useState(450);
  const [close, setClose] = useState(40);

  const weekly = missed * job * (close / 100);
  const monthly = weekly * WEEKS_PER_MONTH;
  const yearly = monthly * 12;

  return (
    <section className="band-night relative isolate overflow-hidden section">
      <Plate name="bell-circuits" className="absolute -right-16 top-10 -z-10 hidden w-[34rem] opacity-[0.12] lg:block" />
      <div className="shell">
        <div className="max-w-3xl">
          <h2 className="ak-display h-lg">What those calls are actually costing you.</h2>
          <p className="ak-lede mt-6 max-w-[50ch]">
            A caller who reaches voicemail almost never leaves a message. They dial the next company on the list.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="grid content-start gap-7">
            <Slider id="calc-missed" label="Calls you miss in a week" value={missed} min={1} max={40} step={1} onChange={setMissed} format={(v) => `${v}`} />
            <Slider id="calc-job" label="Average job value" value={job} min={300} max={4000} step={50} onChange={setJob} format={(v) => usd.format(v)} />
            <Slider id="calc-close" label="Share of those callers who'd book" value={close} min={5} max={90} step={5} onChange={setClose} format={(v) => `${v}%`} />
            <p className="max-w-[58ch] text-[0.95rem] leading-relaxed text-[var(--dim)]">
              The defaults are priced for a cleaning company, because that is the example we built it from. The arithmetic
              holds for landscaping, HVAC, plumbing, electrical, roofing, towing, pest control, or any trade where the work
              arrives by phone.
            </p>
          </div>

          <div>
            <div className="border border-[var(--rule)] bg-[var(--bg-2)] p-8 sm:p-10" aria-live="polite">
              <p className="text-[var(--dim)]">Walking out the door every week</p>
              <Money value={weekly} className="price mt-4 block text-[clamp(3.2rem,7vw,5.2rem)] leading-none text-[var(--lamp)]" />
              <dl className="mt-9 grid grid-cols-2 gap-6 border-t border-[var(--rule)] pt-6">
                <div>
                  <dt className="text-sm text-[var(--dim)]">A month</dt>
                  <dd className="mt-1"><Money value={monthly} className="price text-[1.7rem]" /></dd>
                </div>
                <div>
                  <dt className="text-sm text-[var(--dim)]">A year</dt>
                  <dd className="mt-1"><Money value={yearly} className="price text-[1.7rem]" /></dd>
                </div>
              </dl>
            </div>
            <ReportForm missed={missed} job={job} close={close} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportForm({ missed, job, close }: { missed: number; job: number; close: number }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/missed-call-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, business, company, missedPerWeek: missed, averageJob: job, closeRate: close }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "That didn't send.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "That didn't send.");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-4 border border-[var(--rule)] p-8">
        <p className="font-medium text-[var(--lamp)]">On its way</p>
        <p className="mt-3 leading-relaxed text-[var(--fg-2)]">
          Sent to <strong className="text-[var(--fg)]">{email}</strong>: your numbers, not a brochure. If it hasn&apos;t
          landed in a couple of minutes, check spam, then ring us.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 border border-[var(--rule)] p-7 sm:p-8">
      <p className="font-medium">Want these in writing?</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--dim)]">
        We&apos;ll email you this breakdown. No sequence, no newsletter: one message with your figures in it.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="r-name" className="field-label">Your name</label>
          <input id="r-name" className="field" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        </div>
        <div>
          <label htmlFor="r-email" className="field-label">Email</label>
          <input id="r-email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="r-biz" className="field-label">
            Business name <span className="font-normal text-[var(--dim)]">Optional</span>
          </label>
          <input id="r-biz" className="field" value={business} onChange={(e) => setBusiness(e.target.value)} autoComplete="organization" />
        </div>
        <input
          className="absolute left-[-9999px] h-px w-px"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      {message ? <p className="field-error" role="alert">{message}</p> : null}
      <button type="submit" className="ak-btn ak-btn-primary mt-6 w-full" disabled={status === "sending"}>
        {status === "sending" ? "Sending" : "Email me the breakdown"}
      </button>
    </form>
  );
}
