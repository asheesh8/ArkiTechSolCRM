"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, CheckCircle2, Loader2, Phone } from "lucide-react";
import type { CampaignAttribution } from "@/lib/campaign";

// Set this once there's a real scheduler to point at and a "pick a time"
// button appears above the form. Until then the form is the booking path —
// it lands the lead in the CRM either way.
const SCHEDULER_URL = process.env.NEXT_PUBLIC_BOOKING_URL?.trim() ?? "";

const BEST_TIMES = ["Morning (8am–12pm)", "Afternoon (12pm–5pm)", "Evening (5pm–8pm)", "Anytime"];
// This checkbox is the opt-in an A2P 10DLC reviewer asks to see, so it names
// text messages explicitly and links the terms that govern them. Consent to be
// texted cannot be buried in consent to be called — a reviewer reading only
// this sentence has to be able to tell what was agreed to.
const CALL_CONSENT_TEXT =
  "I agree that ArkiTech Solutions can contact me at this phone number about my CleaningBook inquiry, including by automated or AI-generated voice and by text message. Message frequency varies, message and data rates may apply, and I can reply STOP at any time.";

const FIELD_CLASS =
  "w-full rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-white/25 focus:border-indigo-400/60 focus:bg-white/[0.07]";

type Status = "idle" | "sending" | "sent" | "error";

export function BookingForm({
  attribution,
  onBooked,
}: {
  attribution: CampaignAttribution;
  onBooked: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    bestTime: BEST_TIMES[0],
    callConsent: false,
    company: "", // honeypot
  });
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/campaign/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, callConsentText: CALL_CONSENT_TEXT, attribution }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try calling us instead.");
        setStatus("error");
        return;
      }

      setStatus("sent");
      onBooked();
    } catch {
      setError("Network error. Try calling (802) 310-3749 instead.");
      setStatus("error");
    }
  }

  return (
    <section id="book" className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300/70">Next step</p>
          <h2 className="mt-4 text-[clamp(30px,5.5vw,48px)] font-black leading-[1.05] tracking-[-0.03em] text-white">
            Book a call
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-7 text-white/50">
            Twenty minutes. We&apos;ll go through the calls you&apos;re getting, what you&apos;d want
            the agent to say, and whether this is even worth it for your volume. No pitch deck.
          </p>
        </div>

        <div
          className="mt-9 rounded-3xl border p-6 sm:p-8"
          style={{
            borderColor: "rgba(255,255,255,0.1)",
            background: "linear-gradient(165deg, rgba(20,20,36,0.85), rgba(10,10,20,0.9))",
            boxShadow: "0 40px 120px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          {status === "sent" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-10 text-center"
            >
              <CheckCircle2 className="h-14 w-14 text-emerald-400" />
              <p className="text-xl font-bold text-white">You&apos;re on the list.</p>
              <p className="max-w-sm text-[15px] leading-6 text-white/50">
                We&apos;ll call you at <strong className="font-semibold text-white/75">{form.phone}</strong> during
                your {form.bestTime.split(" ")[0].toLowerCase()} window. If you&apos;d rather not wait, call us now.
              </p>
              <a
                href="tel:+18023103749"
                className="mt-2 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
              >
                <Phone className="h-4 w-4" /> (802) 310-3749
              </a>
            </motion.div>
          ) : (
            <>
              {SCHEDULER_URL && (
                <a
                  href={SCHEDULER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-6 flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-bold text-white transition hover:brightness-110"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 0 40px rgba(79,70,229,0.35)" }}
                >
                  <CalendarCheck className="h-4 w-4" /> Pick a time on the calendar
                </a>
              )}

              <form onSubmit={submit} className="space-y-3.5">
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    className={FIELD_CLASS}
                  />
                  <input
                    required
                    value={form.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    placeholder="Business name"
                    autoComplete="organization"
                    className={FIELD_CLASS}
                  />
                </div>

                <input
                  required
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="Phone number"
                  autoComplete="tel"
                  className={FIELD_CLASS}
                />

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="Email (optional)"
                  autoComplete="email"
                  className={FIELD_CLASS}
                />

                <select
                  value={form.bestTime}
                  onChange={(e) => update("bestTime", e.target.value)}
                  aria-label="Best time to call"
                  className={`${FIELD_CLASS} appearance-none`}
                >
                  {BEST_TIMES.map((time) => (
                    <option key={time} value={time} className="bg-[#14142a]">
                      Best time: {time}
                    </option>
                  ))}
                </select>

                <label className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left text-xs leading-5 text-white/48">
                  <input
                    required
                    type="checkbox"
                    checked={form.callConsent}
                    onChange={(e) => update("callConsent", e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/10 accent-indigo-400"
                  />
                  <span>
                    {CALL_CONSENT_TEXT}{" "}
                    <a
                      href="/legal/sms"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-semibold text-indigo-300 underline underline-offset-2"
                    >
                      SMS Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="/legal/privacy"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-semibold text-indigo-300 underline underline-offset-2"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>

                {/* Honeypot — off-screen rather than display:none, which some bots skip. */}
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                {error && (
                  <p className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-bold text-white transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60 motion-reduce:transition-none"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 0 46px rgba(79,70,229,0.4)" }}
                >
                  {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
                  {status === "sending" ? "Sending…" : "Have ArkiTech call me"}
                </button>

                <p className="pt-1 text-center text-xs text-white/30">
                  Or call us directly —{" "}
                  <a href="tel:+18023103749" className="font-semibold text-white/60 underline-offset-4 hover:underline">
                    (802) 310-3749
                  </a>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
