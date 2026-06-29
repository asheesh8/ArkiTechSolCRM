"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Phone, Mail, Loader2, CheckCircle2 } from "lucide-react";

type View = "choose" | "email" | "call";
type Status = "idle" | "sending" | "sent" | "error";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ContactModal({ open, onClose }: Props) {
  const [view, setView] = useState<View>("choose");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => { setView("choose"); setStatus("idle"); setName(""); setEmail(""); setMessage(""); }, 300);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              {view === "choose" && (
                <motion.div
                  key="choose"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-sm overflow-hidden rounded-2xl"
                  style={{
                    background: "rgba(18,18,28,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
                    backdropFilter: "blur(24px)",
                  }}
                >
                  {/* macOS title bar */}
                  <div className="flex items-center gap-3 border-b px-4 py-3.5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-1.5">
                      <button onClick={onClose} className="group h-3 w-3 rounded-full" style={{ background: "#ff5f57" }}>
                        <X className="h-2 w-2 opacity-0 group-hover:opacity-100 text-black/50 m-auto" />
                      </button>
                      <div className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
                      <div className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
                    </div>
                    <span className="flex-1 text-center text-xs font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Get in touch
                    </span>
                  </div>

                  <div className="p-6 flex flex-col gap-3">
                    <p className="text-center text-sm mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>How would you like to reach us?</p>
                    <button
                      onClick={() => setView("email")}
                      className="flex items-center gap-4 rounded-xl p-4 text-left transition hover:opacity-90"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(139,92,246,0.2)" }}>
                        <Mail className="h-5 w-5 text-violet-300" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">Send an email</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>We reply within 24 hours</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setView("call")}
                      className="flex items-center gap-4 rounded-xl p-4 text-left transition hover:opacity-90"
                      style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(34,197,94,0.15)" }}>
                        <Phone className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">Give us a call</p>
                        <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Mon–Fri, 9am–6pm EST</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {view === "email" && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-lg overflow-hidden rounded-2xl"
                  style={{
                    background: "rgba(18,18,28,0.97)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
                    backdropFilter: "blur(24px)",
                  }}
                >
                  {/* macOS Mail title bar */}
                  <div className="flex items-center gap-3 border-b px-4 py-3.5" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-1.5">
                      <button onClick={onClose} className="group h-3 w-3 rounded-full" style={{ background: "#ff5f57" }}>
                        <X className="h-2 w-2 opacity-0 group-hover:opacity-100 text-black/50 m-auto" />
                      </button>
                      <button onClick={() => setView("choose")} className="group h-3 w-3 rounded-full" style={{ background: "#febc2e" }}>
                        <span className="block text-center text-[8px] leading-3 opacity-0 group-hover:opacity-70 text-black font-bold">−</span>
                      </button>
                      <div className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
                    </div>
                    <span className="flex-1 text-center text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                      New Message
                    </span>
                    <button
                      form="contact-form"
                      type="submit"
                      disabled={status === "sending" || status === "sent"}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50"
                      style={{ background: "rgba(139,92,246,0.7)" }}
                    >
                      {status === "sending" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      Send
                    </button>
                  </div>

                  {status === "sent" ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <CheckCircle2 className="h-12 w-12 text-green-400" />
                      <p className="font-semibold text-white">Message sent!</p>
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>We'll get back to you within 24 hours.</p>
                    </div>
                  ) : (
                    <form id="contact-form" onSubmit={handleSend}>
                      {/* Mail header fields */}
                      {[
                        { label: "To:", value: "ArkiTech Solutions <subediashish31@gmail.com>", readOnly: true, mono: true },
                      ].map((f) => (
                        <div key={f.label} className="flex items-center gap-3 border-b px-4 py-2.5" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          <span className="w-12 shrink-0 text-right text-xs font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>{f.label}</span>
                          <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)", fontFamily: f.mono ? "monospace" : undefined }}>{f.value}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-3 border-b px-4 py-2.5" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <span className="w-12 shrink-0 text-right text-xs font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>From:</span>
                        <input
                          required
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                          type="email"
                        />
                      </div>
                      <div className="flex items-center gap-3 border-b px-4 py-2.5" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <span className="w-12 shrink-0 text-right text-xs font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>Subject:</span>
                        <input
                          required
                          placeholder="I'd like to start a project"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                        />
                      </div>
                      <textarea
                        required
                        placeholder="Tell us about your business and what you're looking for…"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={7}
                        className="w-full resize-none bg-transparent px-6 py-4 text-sm text-white outline-none placeholder:text-white/20"
                      />
                      {status === "error" && (
                        <p className="px-6 pb-3 text-xs text-red-400">Something went wrong — try emailing us directly at subediashish31@gmail.com</p>
                      )}
                    </form>
                  )}
                </motion.div>
              )}

              {view === "call" && (
                <motion.div
                  key="call"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-sm overflow-hidden rounded-2xl"
                  style={{
                    background: "rgba(18,18,28,0.97)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 40px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
                    backdropFilter: "blur(24px)",
                  }}
                >
                  <div className="flex items-center gap-3 border-b px-4 py-3.5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-1.5">
                      <button onClick={onClose} className="group h-3 w-3 rounded-full" style={{ background: "#ff5f57" }}>
                        <X className="h-2 w-2 opacity-0 group-hover:opacity-100 text-black/50 m-auto" />
                      </button>
                      <button onClick={() => setView("choose")} className="group h-3 w-3 rounded-full" style={{ background: "#febc2e" }}>
                        <span className="block text-center text-[8px] leading-3 opacity-0 group-hover:opacity-70 text-black font-bold">−</span>
                      </button>
                      <div className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
                    </div>
                    <span className="flex-1 text-center text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Call us</span>
                  </div>

                  <div className="flex flex-col items-center gap-5 p-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" }}>
                      <Phone className="h-7 w-7 text-green-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">Ashish Subedi</p>
                      <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>ArkiTech Solutions</p>
                    </div>
                    <a
                      href="tel:+18023103749"
                      className="flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white transition hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 0 30px rgba(34,197,94,0.3)" }}
                    >
                      <Phone className="h-5 w-5" />
                      (802) 310-3749
                    </a>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Mon–Fri · 9am–6pm EST</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
