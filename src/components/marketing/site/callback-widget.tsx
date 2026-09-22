"use client";

import { FormEvent, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle, PhoneCall, X } from "@phosphor-icons/react";
import { useContact } from "@/components/marketing/site/contact-context";
import { CALLBACK_CONSENT_TEXT } from "@/lib/callback-consent";
import { checkPhone } from "@/lib/phone";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * "Get a callback": name and number, that's it. Posts to /api/callback in
 * the CRM with the exact consent sentence the visitor ticked, which the
 * route stores alongside the lead.
 */
export function CallbackWidget() {
  const { isOpen: contactOpen } = useContact();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const launcher = useRef<HTMLButtonElement>(null);

  const check = checkPhone(phone);
  const ready = name.trim().length > 0 && check.textable && consent;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!ready || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          message: message.trim() || undefined,
          smsConsent: true,
          consentText: CALLBACK_CONSENT_TEXT,
          company,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "That didn't go through. Try again in a moment.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("We couldn't reach the server just now. Try again in a moment.");
      setStatus("error");
    }
  }

  function close() {
    setOpen(false);
    window.setTimeout(() => launcher.current?.focus(), 0);
  }

  if (contactOpen) return null;

  return (
    <div className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-[80] flex justify-end sm:bottom-5 sm:left-auto sm:right-5">
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.section
            key="panel"
            id="callback-panel"
            role="dialog"
            aria-label="Request a callback"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden border border-[var(--rule)] bg-[var(--bg)] text-[var(--fg)] shadow-[var(--shadow)] sm:w-[25rem]"
          >
            <header className="flex items-center gap-3 border-b border-[var(--rule)] px-5 py-4">
              <PhoneCall size={22} weight="light" className="text-[var(--accent-text)]" aria-hidden="true" />
              <div className="flex-1">
                <h2 className="ak-display text-[1.35rem] leading-none">Get a callback</h2>
                <p className="mt-1 text-xs text-[var(--dim)]">Usually the same day</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center border border-[var(--rule-strong)] hover:border-[var(--fg)]"
              >
                <X size={15} />
              </button>
            </header>

            {status === "sent" ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <CheckCircle size={36} weight="light" className="text-[var(--accent-text)]" />
                <p className="mt-4 font-medium">Got it, {name.trim().split(/\s+/)[0]}.</p>
                <p className="mt-2 text-sm text-[var(--dim)]">
                  We&apos;ll call <span className="figure text-[var(--fg)]">{check.national || phone}</span>, usually the
                  same day.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-4 overflow-y-auto px-5 py-5">
                <div>
                  <label htmlFor="cb-name" className="field-label">Your name</label>
                  <input id="cb-name" className="field" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="cb-phone" className="field-label">Phone number</label>
                  <div className="flex">
                    <span className="figure flex items-center border border-r-0 border-[var(--rule-strong)] px-3 text-[var(--dim)]">+1</span>
                    <input
                      id="cb-phone"
                      className="field figure"
                      inputMode="tel"
                      autoComplete="tel-national"
                      required
                      placeholder="(802) 555-0147"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      aria-describedby="cb-phone-hint"
                    />
                  </div>
                  {phone.trim() && !check.textable ? (
                    <p id="cb-phone-hint" className="field-error">{check.reason}</p>
                  ) : (
                    <p id="cb-phone-hint" className="field-hint">US numbers only.</p>
                  )}
                </div>
                <div>
                  <label htmlFor="cb-msg" className="field-label">
                    What do you need? <span className="font-normal text-[var(--dim)]">Optional</span>
                  </label>
                  <textarea id="cb-msg" rows={2} className="field resize-y" value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
                <label className="flex gap-3 border border-[var(--rule)] p-3 text-[0.78rem] leading-relaxed text-[var(--fg-2)]">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--lamp)]"
                  />
                  <span>
                    {CALLBACK_CONSENT_TEXT}{" "}
                    <a href="/legal/sms" target="_blank" rel="noreferrer noopener" className="text-link text-[var(--fg)]">
                      SMS Terms
                    </a>{" "}
                    and{" "}
                    <a href="/legal/privacy" target="_blank" rel="noreferrer noopener" className="text-link text-[var(--fg)]">
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                {/* Honeypot, off-screen rather than display:none, which some bots skip. */}
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
                />
                {error ? (
                  <p className="field-error" role="alert">{error}</p>
                ) : null}
                <button type="submit" disabled={!ready || status === "sending"} className="ak-btn ak-btn-primary w-full">
                  {status === "sending" ? "Sending" : "Request a callback"}
                </button>
              </form>
            )}
          </motion.section>
        ) : (
          <motion.button
            key="launcher"
            ref={launcher}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            onClick={() => setOpen(true)}
            aria-expanded={false}
            aria-controls="callback-panel"
            className="group flex w-full items-center gap-3 border border-[var(--rule-strong)] bg-[var(--bg)] py-2 pl-2 pr-5 text-left text-[var(--fg)] shadow-[var(--shadow)] transition-colors hover:border-[var(--fg)] sm:w-auto"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--lamp)] text-[var(--ink)]">
              <PhoneCall size={18} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[0.95rem] font-medium leading-tight">Get a callback</span>
              <span className="block text-xs text-[var(--dim)]">Name and number, that&apos;s it</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
