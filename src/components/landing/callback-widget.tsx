"use client";

import { FormEvent, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Loader2, Phone, Send, X } from "lucide-react";
import { CALLBACK_CONSENT_TEXT } from "@/lib/callback-consent";
import { checkPhone } from "@/lib/phone";

// The intake widget on the main site.
//
// It replaced a chat assistant, and the trade is deliberate: a conversation is
// pleasant but ends with nothing actionable unless the visitor volunteers a way
// to reach them. Name and number is the whole job, and the same form doubles as
// the documented SMS opt-in an A2P 10DLC reviewer asks to see — which is why
// the consent wording is visible next to the button rather than tucked behind a
// link.

type Status = "idle" | "sending" | "sent" | "error";

const FIELD_CLASS =
  "w-full border border-[rgba(236,233,227,0.16)] bg-transparent px-4 py-3.5 text-[15px] text-[#ece9e3] outline-none transition placeholder:text-[rgba(236,233,227,0.28)] focus:border-[#6c5cf7]";

export function CallbackWidget({ suppressed = false }: { suppressed?: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();

  const check = checkPhone(phone);
  const ready = name.trim().length > 0 && check.textable && consent;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready || status === "sending") return;

    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/callback", {
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
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Something went wrong. Try again in a moment.");
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setError("Couldn't reach us just now. Try again in a moment.");
      setStatus("error");
    }
  }

  function close() {
    setOpen(false);
    window.setTimeout(() => launcherRef.current?.focus(), 0);
  }

  return (
    <AnimatePresence>
      {!suppressed && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: reduceMotion ? 0 : 0.22 }}
          className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-[80] flex justify-end sm:bottom-5 sm:left-auto sm:right-5"
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.section
                key="callback-panel"
                id="arkitech-callback-panel"
                role="dialog"
                aria-label="Request a callback from ArkiTech"
                initial={{ opacity: 0, y: 20, scale: reduceMotion ? 1 : 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: reduceMotion ? 1 : 0.97 }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="flex max-h-[calc(100dvh-1.5rem-env(safe-area-inset-bottom))] w-full flex-col overflow-hidden border border-[rgba(236,233,227,0.16)] bg-[#0a0a0e] sm:w-[398px]"
              >
                <header className="flex shrink-0 items-center gap-3.5 border-b border-[rgba(236,233,227,0.16)] px-4 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#6c5cf7]">
                    <Phone className="h-4 w-4 text-white" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[0.95rem] text-[#ece9e3]" style={{ fontStretch: "86%", fontWeight: 600 }}>
                      Get a callback
                    </h2>
                    <p className="mono mt-1" style={{ color: "rgba(236,233,227,0.56)", fontSize: "0.56rem" }}>
                      Usually same day
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    className="flex h-9 w-9 items-center justify-center border border-[rgba(236,233,227,0.16)] text-[rgba(236,233,227,0.5)] transition hover:text-[#ece9e3]"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                {status === "sent" ? (
                  <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-hidden="true" />
                    <p className="text-sm font-semibold text-white">Got it, {name.trim().split(/\s+/)[0]}.</p>
                    <p className="text-[13px] leading-5 text-white/45">
                      We&rsquo;ll reach you at{" "}
                      <span className="font-semibold text-white/75">{check.national || phone}</span>. Usually the same
                      day.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-5">
                    <div className="space-y-1.5">
                      <label htmlFor="callback-name" className="block text-[11px] font-semibold text-white/45">
                        Your name
                      </label>
                      <input
                        id="callback-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Jane Doe"
                        autoComplete="name"
                        className={FIELD_CLASS}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="callback-phone" className="block text-[11px] font-semibold text-white/45">
                        Phone number
                      </label>
                      <div className="flex items-stretch gap-2">
                        <span className="flex shrink-0 items-center gap-1.5 border border-[rgba(236,233,227,0.16)] px-3 text-[15px] text-[rgba(236,233,227,0.55)]">
                          <span aria-hidden="true">🇺🇸</span> +1
                        </span>
                        <input
                          id="callback-phone"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="(802) 555-0123"
                          inputMode="tel"
                          autoComplete="tel"
                          className={FIELD_CLASS}
                          required
                        />
                      </div>
                      {phone.trim() && !check.textable ? (
                        <p className="text-[11px] leading-4 text-amber-300/80">{check.reason}</p>
                      ) : null}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="callback-message" className="block text-[11px] font-semibold text-white/45">
                        What do you need? <span className="font-normal text-white/25">Optional</span>
                      </label>
                      <textarea
                        id="callback-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="I want to know more"
                        rows={3}
                        className={`${FIELD_CLASS} resize-y`}
                      />
                    </div>

                    <label className="flex gap-3 border border-[rgba(236,233,227,0.14)] p-3.5 text-left text-[11px] leading-4 text-[rgba(236,233,227,0.5)]">
                      <input
                        required
                        type="checkbox"
                        checked={consent}
                        onChange={(event) => setConsent(event.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 border-[rgba(236,233,227,0.24)] bg-transparent accent-[#6c5cf7]"
                      />
                      <span>
                        {CALLBACK_CONSENT_TEXT}{" "}
                        <a
                          href="/legal/sms"
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-semibold text-violet-200 underline underline-offset-2"
                        >
                          SMS Terms
                        </a>{" "}
                        and{" "}
                        <a
                          href="/legal/privacy"
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-semibold text-violet-200 underline underline-offset-2"
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
                      aria-hidden="true"
                      value={company}
                      onChange={(event) => setCompany(event.target.value)}
                      className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
                    />

                    {error ? (
                      <p className="text-[11px] leading-4 text-red-300" role="alert">
                        {error}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={!ready || status === "sending"}
                      className="btn btn-violet min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {status === "sending" ? "Sending…" : "Request a callback"}
                    </button>
                  </form>
                )}
              </motion.section>
            ) : (
              <motion.button
                key="callback-launcher"
                ref={launcherRef}
                type="button"
                initial={{ opacity: 0, y: 8, scale: reduceMotion ? 1 : 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: reduceMotion ? 1 : 0.96 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                onClick={() => setOpen(true)}
                aria-expanded="false"
                aria-controls="arkitech-callback-panel"
                className="group flex min-h-[3.4rem] items-center gap-3.5 border border-[rgba(236,233,227,0.2)] bg-[#0a0a0e] py-2 pl-2 pr-5 text-left transition-colors duration-200 hover:border-[rgba(236,233,227,0.42)]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#6c5cf7]">
                  <Phone className="h-4 w-4 text-white" aria-hidden="true" />
                </span>
                <span>
                  <span className="mono block text-[#ece9e3]" style={{ fontSize: "0.62rem" }}>Get a callback</span>
                  <span className="mono mt-1 block" style={{ color: "rgba(236,233,227,0.56)", fontSize: "0.54rem", letterSpacing: "0.1em" }}>
                    Name and number, that&rsquo;s it
                  </span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
