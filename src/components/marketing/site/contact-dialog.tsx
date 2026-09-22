"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle, EnvelopeSimple, Phone, X } from "@phosphor-icons/react";
import { Mark } from "@/components/marketing/brand/mark";
import { useContact } from "@/components/marketing/site/contact-context";
import { SITE } from "@/lib/marketing/site";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * "Book a free call". Two honest routes: write to us, or ring. The form
 * posts to /api/contact in the CRM, which emails the studio.
 */
export function ContactDialog() {
  const { isOpen, close } = useContact();
  const reduce = useReducedMotion();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const firstField = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      returnFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      window.setTimeout(() => firstField.current?.focus(), 60);
    } else {
      document.body.style.overflow = "";
      returnFocus.current?.focus?.();
      const t = window.setTimeout(() => {
        setStatus("idle");
        setName("");
        setEmail("");
        setMessage("");
      }, 300);
      return () => window.clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Project enquiry from ${name.trim()}`, email: email.trim(), message: message.trim() }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

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
            className="relative max-h-[92dvh] w-full max-w-[40rem] overflow-y-auto border border-[var(--rule)] bg-[var(--bg)] text-[var(--fg)] shadow-[var(--shadow)]"
          >
            <div className="flex items-start justify-between gap-6 border-b border-[var(--rule)] px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3.5">
                <Mark className="h-8 w-8" />
                <div>
                  <h2 id="contact-title" className="ak-display text-[1.7rem] leading-none">
                    Book a free call
                  </h2>
                  <p className="mt-1.5 text-sm text-[var(--dim)]">Twenty minutes, no obligation.</p>
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

            {status === "sent" ? (
              <div className="flex flex-col items-center px-8 py-16 text-center">
                <CheckCircle size={40} weight="light" className="text-[var(--accent-text)]" />
                <p className="ak-display mt-5 text-3xl">Thanks, {name.trim().split(/\s+/)[0]}.</p>
                <p className="mt-3 max-w-[36ch] text-[var(--dim)]">
                  We&apos;ll reply to {email} within one business day. If it&apos;s urgent, ring{" "}
                  <a href={SITE.phoneHref} className="text-link text-[var(--fg)]">{SITE.phone}</a>.
                </p>
                <button type="button" onClick={close} className="ak-btn ak-btn-ghost mt-8">Close</button>
              </div>
            ) : (
              <div className="grid gap-0 sm:grid-cols-[1fr_13rem]">
                <form onSubmit={submit} className="grid gap-5 px-6 py-7 sm:px-8">
                  <div>
                    <label htmlFor="c-name" className="field-label">Your name</label>
                    <input
                      ref={firstField}
                      id="c-name"
                      className="field"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="c-email" className="field-label">Email</label>
                    <input
                      id="c-email"
                      type="email"
                      className="field"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="c-msg" className="field-label">What are you working on?</label>
                    <textarea
                      id="c-msg"
                      className="field min-h-32 resize-y"
                      required
                      placeholder="Your business, what's getting in the way, and roughly when you'd like it fixed."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  {status === "error" ? (
                    <p className="field-error" role="alert">
                      That didn&apos;t send. Email us at{" "}
                      <a className="underline" href={`mailto:${SITE.email}`}>{SITE.email}</a> or call {SITE.phone}.
                    </p>
                  ) : null}
                  <button type="submit" className="ak-btn ak-btn-primary w-full sm:w-fit" disabled={status === "sending"}>
                    <EnvelopeSimple size={17} aria-hidden="true" />
                    {status === "sending" ? "Sending" : "Send it over"}
                  </button>
                </form>

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
                    You&apos;ll speak with Ashish or Tei, the people who&apos;ll actually do the work. If
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
