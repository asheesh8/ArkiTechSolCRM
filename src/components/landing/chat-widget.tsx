"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type ChatResponse = {
  reply?: string;
  error?: string;
};

type Props = {
  suppressed?: boolean;
  onStartProject: () => void;
};

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hi — I’m ArkiTech’s project assistant. I can answer questions and help scope your project. What are you looking to build?",
};

const SUGGESTIONS = [
  "What services do you offer?",
  "I have a project idea",
  "How does a project begin?",
] as const;

const SESSION_KEY = "arkitech-chat-session";
const MESSAGES_KEY = "arkitech-chat-messages";

function uniqueId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getSessionId() {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing && /^[a-zA-Z0-9_-]{10,80}$/.test(existing)) return existing;

    const sessionId = uniqueId();
    window.sessionStorage.setItem(SESSION_KEY, sessionId);
    return sessionId;
  } catch {
    return uniqueId();
  }
}

export function ChatWidget({ suppressed = false, onStartProject }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(MESSAGES_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter(
            (item): item is ChatMessage =>
              typeof item === "object" &&
              item !== null &&
              typeof item.id === "string" &&
              (item.role === "assistant" || item.role === "user") &&
              typeof item.content === "string",
          );
          if (valid.length > 0) setMessages(valid.slice(-30));
        }
      }
    } catch {
      // Ignore unavailable or malformed session storage.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(MESSAGES_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // Chat remains usable when storage is unavailable.
    }
  }, [hydrated, messages]);

  useEffect(() => {
    if (suppressed) setOpen(false);
  }, [suppressed]);

  useEffect(() => {
    if (!open) return;

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), reduceMotion ? 0 : 220);
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        window.setTimeout(() => launcherRef.current?.focus(), reduceMotion ? 0 : 280);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, reduceMotion]);

  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, reduceMotion, sending]);

  const sendMessage = useCallback(async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || sending) return;

    setMessages((current) => [...current, { id: uniqueId(), role: "user", content: message }]);
    setInput("");
    setError(null);
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId: getSessionId() }),
      });
      const result = (await response.json().catch(() => ({}))) as ChatResponse;

      if (!response.ok || !result.reply) {
        throw new Error(result.error || "The assistant could not respond.");
      }

      setMessages((current) => [...current, { id: uniqueId(), role: "assistant", content: result.reply! }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The assistant could not respond.");
    } finally {
      setSending(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [sending]);

  function submit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!sending) void sendMessage(input);
    }
  }

  function closeChat() {
    setOpen(false);
    window.setTimeout(() => launcherRef.current?.focus(), reduceMotion ? 0 : 280);
  }

  function startProject() {
    setOpen(false);
    onStartProject();
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
                key="chat-panel"
                id="arkitech-chat-panel"
                role="dialog"
                aria-label="ArkiTech project assistant"
                initial={{ opacity: 0, y: 20, scale: reduceMotion ? 1 : 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: reduceMotion ? 1 : 0.97 }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="flex h-[min(680px,calc(100dvh-1.5rem-env(safe-area-inset-bottom)))] w-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#11111d]/95 shadow-[0_28px_100px_rgba(0,0,0,0.62),0_0_60px_rgba(124,58,237,0.13)] backdrop-blur-2xl sm:h-[min(620px,calc(100dvh-2.5rem))] sm:w-[398px]"
              >
                <header className="relative flex shrink-0 items-center gap-3 overflow-hidden border-b border-white/[0.07] px-4 py-4">
                  <div className="pointer-events-none absolute -left-8 -top-12 h-28 w-40 rounded-full bg-violet-500/15 blur-3xl" />
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-500/25 to-sky-400/15">
                    <Sparkles className="h-5 w-5 text-violet-200" aria-hidden="true" />
                  </div>
                  <div className="relative min-w-0 flex-1">
                    <h2 className="truncate text-sm font-bold text-white">ArkiTech Project Assistant</h2>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/40">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]" />
                      FAQ + project intake
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeChat}
                    className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.035] text-white/45 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                    aria-label="Close project assistant"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                <div
                  ref={messageListRef}
                  role="log"
                  aria-live="polite"
                  aria-relevant="additions text"
                  className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5"
                >
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[86%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[13px] leading-5 ${
                          message.role === "user"
                            ? "rounded-br-md bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-950/25"
                            : "rounded-bl-md border border-white/[0.07] bg-white/[0.045] text-white/72"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}

                  {sending && (
                    <div className="flex justify-start" role="status" aria-label="ArkiTech assistant is thinking">
                      <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/[0.07] bg-white/[0.045] px-4 py-3 text-xs text-white/45">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-300" />
                        Thinking…
                      </div>
                    </div>
                  )}

                  {messages.length === 1 && !sending && (
                    <div className="flex flex-wrap gap-2 pt-1" aria-label="Suggested questions">
                      {SUGGESTIONS.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => void sendMessage(suggestion)}
                          className="rounded-full border border-violet-300/15 bg-violet-400/[0.07] px-3 py-2 text-left text-[11px] font-medium text-violet-100/70 transition hover:border-violet-300/30 hover:bg-violet-400/[0.12] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="shrink-0 border-t border-white/[0.07] bg-[#0d0d18]/80 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3">
                  {error && (
                    <div role="alert" className="mb-2 rounded-xl border border-red-300/15 bg-red-400/[0.07] px-3 py-2 text-[11px] leading-4 text-red-100/70">
                      {error} You can also call <a className="font-bold text-white underline underline-offset-2" href="tel:+18023103749">(802) 310-3749</a>.
                    </div>
                  )}

                  <form onSubmit={submit} className="flex items-end gap-2 rounded-2xl border border-white/[0.09] bg-white/[0.045] p-1.5 pl-3 focus-within:border-violet-300/30 focus-within:bg-white/[0.06]">
                    <label htmlFor="arkitech-chat-input" className="sr-only">Message ArkiTech’s project assistant</label>
                    <textarea
                      ref={inputRef}
                      id="arkitech-chat-input"
                      rows={1}
                      maxLength={1_500}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      placeholder="Ask a question or describe your project…"
                      disabled={sending}
                      className="max-h-24 min-h-9 flex-1 resize-none bg-transparent py-2 text-[13px] leading-5 text-white outline-none placeholder:text-white/25 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={sending || !input.trim()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
                      aria-label="Send message"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </form>

                  <div className="mt-2 flex items-center justify-between gap-3 px-1">
                    <p className="text-[9px] leading-3 text-white/25">AI assistant · Details go to ArkiTech</p>
                    <button type="button" onClick={startProject} className="group flex items-center gap-1 text-[10px] font-semibold text-violet-200/60 transition hover:text-violet-100">
                      Contact a person <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              </motion.section>
            ) : (
              <motion.button
                key="chat-launcher"
                ref={launcherRef}
                type="button"
                initial={{ opacity: 0, y: 8, scale: reduceMotion ? 1 : 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: reduceMotion ? 1 : 0.96 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                onClick={() => setOpen(true)}
                aria-expanded="false"
                aria-controls="arkitech-chat-panel"
                className="group relative flex min-h-14 items-center gap-3 overflow-hidden rounded-full border border-white/15 bg-[#151523]/92 py-2 pl-2 pr-5 text-left shadow-[0_18px_55px_rgba(0,0,0,.5),0_0_38px_rgba(124,58,237,.2)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-violet-300/30 hover:bg-[#1a1a2b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-sky-400/[0.06] opacity-0 transition group-hover:opacity-100" />
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-950/50">
                  <MessageCircle className="h-5 w-5 text-white" aria-hidden="true" />
                  <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-[#151523] bg-emerald-400" />
                </span>
                <span className="relative">
                  <span className="block text-xs font-bold text-white">Ask ArkiTech</span>
                  <span className="mt-0.5 block text-[10px] text-white/40">FAQ + project intake</span>
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
