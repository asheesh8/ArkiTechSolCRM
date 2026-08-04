"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { Loader2, Mic, PhoneOff, Sparkles } from "lucide-react";

type PublicAgent = {
  slug: string;
  name: string;
  headline: string;
  subheadline: string;
  business: string | null;
};

type Turn = { role: "user" | "agent"; text: string };

function DemoConversation({ agent }: { agent: PublicAgent }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onMessage: ({ message, source }) => {
      setTurns((prev) => [...prev, { role: source === "user" ? "user" : "agent", text: message }]);
    },
    onError: (message) => setError(message || "The call dropped. Try again."),
  });

  const { status, isSpeaking, startSession, endSession } = conversation;
  const connected = status === "connected";

  // Keep the newest turn in view as the conversation streams in.
  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const start = useCallback(async () => {
    setError(""); setStarting(true); setTurns([]);
    try {
      // The browser must hold the mic permission before the socket opens,
      // otherwise the agent connects to silence.
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access is needed for the demo. Allow it in your browser and try again.");
      setStarting(false);
      return;
    }

    try {
      const res = await fetch(`/api/demo/${agent.slug}/session`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "The demo could not be started."); setStarting(false); return; }
      startSession({ signedUrl: data.signedUrl, connectionType: "websocket" });
    } catch {
      setError("Network error — the demo could not be started.");
    } finally {
      setStarting(false);
    }
  }, [agent.slug, startSession]);

  return (
    <div className="w-full max-w-xl">
      <div className="text-center">
        {agent.business && (
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">{agent.business}</p>
        )}
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{agent.headline}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">{agent.subheadline}</p>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        {/* Call orb — pulses while the agent is talking so it's clear who has the floor. */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={`flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 ${
              connected
                ? isSpeaking
                  ? "scale-110 bg-indigo-500/30 ring-4 ring-indigo-400"
                  : "bg-emerald-500/20 ring-4 ring-emerald-400/60"
                : "bg-white/10 ring-1 ring-white/20"
            }`}
          >
            {starting || status === "connecting" ? (
              <Loader2 className="h-8 w-8 animate-spin text-indigo-300" />
            ) : (
              <Mic className={`h-8 w-8 ${connected ? "text-white" : "text-zinc-400"}`} />
            )}
          </div>

          <p className="text-sm font-medium text-zinc-300" aria-live="polite">
            {status === "connecting" || starting
              ? "Connecting…"
              : connected
                ? isSpeaking ? `${agent.name} is speaking…` : "Listening — go ahead"
                : "Ready when you are"}
          </p>

          {!connected ? (
            <button
              type="button"
              onClick={start}
              disabled={starting || status === "connecting"}
              className="flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" /> Start the call
            </button>
          ) : (
            <button
              type="button"
              onClick={() => endSession()}
              className="flex items-center gap-2 rounded-full bg-red-500/90 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              <PhoneOff className="h-4 w-4" /> End call
            </button>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {error}
          </p>
        )}

        {turns.length > 0 && (
          <div ref={transcriptRef} className="mt-6 max-h-72 space-y-3 overflow-y-auto border-t border-white/10 pt-5">
            {turns.map((turn, i) => (
              <div key={i} className={turn.role === "user" ? "text-right" : "text-left"}>
                <span
                  className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-5 ${
                    turn.role === "user"
                      ? "bg-indigo-500/20 text-indigo-100"
                      : "bg-white/10 text-zinc-200"
                  }`}
                >
                  {turn.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-zinc-500">
        A live AI receptionist demo by ArkiTech Solutions. Your conversation is processed to run the demo.
      </p>
    </div>
  );
}

export function DemoClient({ agent }: { agent: PublicAgent }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-16">
      <ConversationProvider>
        <DemoConversation agent={agent} />
      </ConversationProvider>
    </main>
  );
}
