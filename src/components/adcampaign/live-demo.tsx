"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, ExternalLink, Loader2, Mic, PhoneOff, Play, RotateCcw } from "lucide-react";
import { useOpenAiRealtime } from "./use-openai-realtime";

// A scripted stand-in for the live call, shown to anyone whose browser won't
// hand over a microphone. Labelled as an example everywhere it appears — it is
// illustrative, not a recording of a real customer.
const SAMPLE_SCRIPT: Array<{ role: "agent" | "caller"; text: string; ms: number }> = [
  { role: "agent", text: "Thanks for calling Sparkle Clean, this is Joe. How can I help?", ms: 2600 },
  { role: "caller", text: "Hey — I'm looking for a quote on a deep clean for my house.", ms: 2400 },
  { role: "agent", text: "Happy to help with that. Is it a house or an apartment, and how many bedrooms and bathrooms?", ms: 3200 },
  { role: "caller", text: "House. Three bedrooms, two baths.", ms: 1900 },
  { role: "agent", text: "Got it. A three-bed, two-bath deep clean typically runs $280 to $340 depending on condition. Want me to get you on the schedule?", ms: 4200 },
  { role: "caller", text: "Yeah, what do you have this week?", ms: 1900 },
  { role: "agent", text: "I have Thursday at 9 AM, or Friday at 1 PM.", ms: 2400 },
  { role: "caller", text: "Thursday works.", ms: 1500 },
  { role: "agent", text: "You're booked for Thursday at 9 AM. I'll text you a confirmation and the crew's arrival window. Anything else I can do?", ms: 4000 },
  { role: "caller", text: "Nope, that's everything. Thanks!", ms: 1800 },
  { role: "agent", text: "You're all set — talk soon.", ms: 2000 },
];

type Turn = { role: "agent" | "caller"; text: string };

/** Facebook and Instagram open links in a webview where getUserMedia is unreliable. */
function detectInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /FBAN|FBAV|FB_IAB|Instagram|Messenger|LinkedInApp|TikTok/i.test(ua);
}

function micUnavailable() {
  return typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia;
}

function Waveform({ active, tone }: { active: boolean; tone: "agent" | "idle" }) {
  const reduceMotion = useReducedMotion();
  const bars = [0.4, 0.75, 1, 0.55, 0.9, 0.35, 0.8, 0.6, 0.95, 0.45, 0.7, 0.5];

  return (
    <div className="flex h-10 items-center justify-center gap-1" aria-hidden>
      {bars.map((peak, index) => (
        <motion.span
          key={index}
          className="w-[3px] rounded-full"
          style={{
            background: tone === "agent"
              ? "linear-gradient(180deg, #a78bfa, #38bdf8)"
              : "rgba(255,255,255,0.18)",
          }}
          initial={{ height: 5 }}
          animate={active && !reduceMotion ? { height: [5, 34 * peak, 10, 26 * peak, 5] } : { height: Math.max(5, 12 * peak) }}
          transition={{ duration: 1, repeat: active && !reduceMotion ? Infinity : 0, delay: index * 0.06, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function Transcript({ turns, agentName }: { turns: Turn[]; agentName: string }) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  if (!turns.length) return null;

  return (
    // pr-2 keeps the right-aligned caller bubbles clear of the scrollbar.
    <div ref={scroller} className="mt-6 max-h-72 w-full space-y-3 overflow-y-auto border-t border-white/10 pr-2 pt-5">
      {turns.map((turn, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={turn.role === "caller" ? "text-right" : "text-left"}
        >
          <span className="mb-1 block px-1 text-[10px] font-bold uppercase tracking-widest text-white/25">
            {turn.role === "caller" ? "Caller" : agentName}
          </span>
          <span
            className={`inline-block max-w-[86%] rounded-2xl px-4 py-2.5 text-sm leading-5 ${
              turn.role === "caller"
                ? "bg-white/[0.07] text-white/75"
                : "text-white"
            }`}
            style={turn.role === "agent" ? { background: "linear-gradient(135deg, rgba(99,102,241,0.32), rgba(56,189,248,0.22))" } : undefined}
          >
            {turn.text}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function SamplePlayer({ agentName }: { agentName: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  function play() {
    clearTimers();
    setTurns([]);
    setDone(false);
    setPlaying(true);

    let elapsed = 0;
    SAMPLE_SCRIPT.forEach((line) => {
      timers.current.push(window.setTimeout(() => {
        setTurns((prev) => [...prev, { role: line.role, text: line.text }]);
      }, elapsed));
      elapsed += line.ms;
    });

    timers.current.push(window.setTimeout(() => {
      setPlaying(false);
      setDone(true);
    }, elapsed));
  }

  return (
    <div className="flex flex-col items-center">
      <Waveform active={playing} tone={playing ? "agent" : "idle"} />

      <p className="mt-3 text-sm font-medium text-white/60" aria-live="polite">
        {playing ? "Playing an example call…" : done ? "That's the whole call — 47 seconds." : "A typical call, start to finish"}
      </p>

      <button
        type="button"
        onClick={play}
        className="mt-5 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.98] motion-reduce:transition-none"
        style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 0 40px rgba(79,70,229,0.35)" }}
      >
        {done || playing ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {playing ? "Restart" : done ? "Play again" : "Play the example call"}
      </button>

      <Transcript turns={turns} agentName={agentName} />

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex w-full items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] p-4"
        >
          <CalendarCheck className="h-5 w-5 shrink-0 text-emerald-400" />
          <p className="text-sm text-white/70">
            <strong className="font-semibold text-white">Job booked, no one picked up a phone.</strong>{" "}
            The quote, the schedule, and the confirmation text all happened without you.
          </p>
        </motion.div>
      )}
    </div>
  );
}

type CallState = {
  status: "idle" | "connecting" | "connected";
  isSpeaking: boolean;
  turns: Turn[];
  error: string;
  start: () => void;
  end: () => void;
};

/**
 * Everything a caller sees during a live call. Deliberately knows nothing about
 * which provider is behind it, so the two transports stay swappable while the
 * phone line finishes migrating.
 */
function CallShell({ agentName, call }: { agentName: string; call: CallState }) {
  const { status, isSpeaking, turns, error, start, end } = call;
  const connected = status === "connected";
  const connecting = status === "connecting";

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-28 items-center justify-center">
        {connected && [0, 1].map((ring) => (
          <motion.span
            key={ring}
            className="absolute rounded-full border border-indigo-400/40"
            initial={{ width: 96, height: 96, opacity: 0.6 }}
            animate={{ width: [96, 160], height: [96, 160], opacity: [0.55, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: ring * 0.65, ease: "easeOut" }}
          />
        ))}
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 ${
            connected && isSpeaking ? "scale-110" : ""
          }`}
          style={{
            background: connected
              ? isSpeaking
                ? "linear-gradient(135deg, rgba(124,58,237,0.5), rgba(56,189,248,0.35))"
                : "rgba(52,211,153,0.16)"
              : "rgba(255,255,255,0.06)",
            boxShadow: connected ? "0 0 46px rgba(99,102,241,0.4)" : "none",
            border: `1px solid ${connected ? (isSpeaking ? "rgba(167,139,250,0.7)" : "rgba(52,211,153,0.5)") : "rgba(255,255,255,0.14)"}`,
          }}
        >
          {connecting
            ? <Loader2 className="h-8 w-8 animate-spin text-indigo-300" />
            : <Mic className={`h-8 w-8 ${connected ? "text-white" : "text-white/40"}`} />}
        </div>
      </div>

      <Waveform active={connected && isSpeaking} tone={connected ? "agent" : "idle"} />

      <p className="mt-3 text-sm font-medium text-white/60" aria-live="polite">
        {connecting
          ? "Connecting…"
          : connected
            ? isSpeaking ? `${agentName} is speaking…` : "Listening — go ahead, ask about a quote"
            : "Tap to talk. Ask for a price, or try to book a job."}
      </p>

      {!connected ? (
        <button
          type="button"
          onClick={start}
          disabled={connecting}
          className="mt-5 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60 motion-reduce:transition-none"
          style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 0 46px rgba(79,70,229,0.4)" }}
        >
          <Mic className="h-4 w-4" /> Start the call
        </button>
      ) : (
        <button
          type="button"
          onClick={end}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-500/90 px-8 py-4 text-base font-bold text-white transition hover:bg-red-500 active:scale-[0.98] motion-reduce:transition-none"
        >
          <PhoneOff className="h-4 w-4" /> End call
        </button>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-center text-sm text-red-200">
          {error}
        </p>
      )}

      <Transcript turns={turns} agentName={agentName} />
    </div>
  );
}

/** ElevenLabs transport: the provider hosts the persona and returns a signed socket. */
export function ElevenLabsCall({ slug, agentName, onStart }: { slug: string; agentName: string; onStart: () => void }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const conversation = useConversation({
    onMessage: ({ message, source }) => {
      setTurns((prev) => [...prev, { role: source === "user" ? "caller" : "agent", text: message }]);
    },
    onError: (message) => setError(message || "The call dropped. Try again."),
  });

  const { status, isSpeaking, startSession, endSession } = conversation;

  const start = useCallback(async () => {
    setError("");
    setStarting(true);
    setTurns([]);

    try {
      // The browser must hold the mic permission before the socket opens,
      // otherwise the agent connects to silence.
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Your browser blocked the microphone. Allow it and try again — or play the example call instead.");
      setStarting(false);
      return;
    }

    try {
      const res = await fetch(`/api/demo/${slug}/session`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "The demo could not be started.");
        setStarting(false);
        return;
      }
      onStart();
      startSession({ signedUrl: data.signedUrl, connectionType: "websocket" });
    } catch {
      setError("Network error — the demo could not be started.");
    } finally {
      setStarting(false);
    }
  }, [slug, startSession, onStart]);

  return (
    <CallShell
      agentName={agentName}
      call={{
        status: status === "connected" ? "connected" : starting || status === "connecting" ? "connecting" : "idle",
        isSpeaking,
        turns,
        error,
        start,
        end: () => endSession(),
      }}
    />
  );
}

/** OpenAI Realtime transport: WebRTC, with the persona sent from our own server. */
export function OpenAiCall({ slug, agentName, onStart }: { slug: string; agentName: string; onStart: () => void }) {
  const call = useOpenAiRealtime({ slug, onStart });
  return <CallShell agentName={agentName} call={call} />;
}

export function LiveDemo({
  slug,
  agentName,
  available,
  provider,
  onDemoStart,
}: {
  slug: string;
  agentName: string;
  /** False when no demo agent is published — the sample is then the only option. */
  available: boolean;
  /** Which transport this agent runs on. Comes from the agent row, not a global flag. */
  provider: "elevenlabs" | "openai";
  onDemoStart: () => void;
}) {
  const [mode, setMode] = useState<"live" | "sample">("live");
  const [restricted, setRestricted] = useState(false);

  useEffect(() => {
    const blocked = detectInAppBrowser() || micUnavailable();
    setRestricted(blocked);
    if (blocked || !available) setMode("sample");
  }, [available]);

  return (
    <section id="demo" className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300/70">Try it yourself</p>
        <h2 className="mt-4 text-[clamp(30px,5.5vw,48px)] font-black leading-[1.05] tracking-[-0.03em] text-white">
          Don&apos;t take our word for it.<br />
          <span style={{ background: "linear-gradient(120deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Call the agent.
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-7 text-white/50">
          This is a real, working agent for a cleaning company — the same one your customers would reach.
          Ask what a deep clean costs. Try to book a Thursday. Try to trip it up.
        </p>
      </div>

      <div
        className="mx-auto mt-10 max-w-xl rounded-3xl border p-6 sm:p-8"
        style={{
          borderColor: "rgba(255,255,255,0.1)",
          background: "linear-gradient(165deg, rgba(20,20,36,0.85), rgba(10,10,20,0.9))",
          boxShadow: "0 40px 120px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
        }}
      >
        {available && (
          <div className="mb-6 flex rounded-full border border-white/10 bg-white/[0.04] p-1">
            {(["live", "sample"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                className={`flex-1 rounded-full px-4 py-2.5 text-[13px] font-bold transition ${
                  mode === option ? "text-white" : "text-white/40 hover:text-white/70"
                }`}
                style={mode === option ? { background: "linear-gradient(135deg, #6366f1, #4f46e5)" } : undefined}
              >
                {option === "live" ? "Talk to it live" : "Play an example"}
              </button>
            ))}
          </div>
        )}

        {/* The in-app webview is where most paid clicks land, so this has to be
            said plainly rather than letting the mic fail silently. */}
        {restricted && mode === "sample" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] p-4">
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-[13px] leading-5 text-white/60">
              <strong className="font-semibold text-amber-200">This browser blocks the microphone.</strong>{" "}
              To actually talk to the agent, tap the <strong>⋯</strong> menu and choose{" "}
              <strong>&ldquo;Open in browser&rdquo;</strong>. Or play the example call below.
            </p>
          </div>
        )}

        {mode === "live" && available
          ? provider === "openai"
            ? <OpenAiCall slug={slug} agentName={agentName} onStart={onDemoStart} />
            : <ElevenLabsCall slug={slug} agentName={agentName} onStart={onDemoStart} />
          : <SamplePlayer agentName={agentName} />}
      </div>

      <p className="mx-auto mt-5 max-w-xl text-center text-xs leading-5 text-white/25">
        {mode === "live" && available
          ? "A live AI voice demo. Your conversation is processed to run the demo and is not used for anything else."
          : "Example conversation, scripted to show a typical call. Not a recording of a real customer."}
      </p>
    </section>
  );
}

export function LiveDemoSection(props: Parameters<typeof LiveDemo>[0]) {
  // ElevenLabs' provider is only mounted for agents that actually use it, so an
  // OpenAI-only page carries none of its runtime.
  if (props.provider === "openai") return <LiveDemo {...props} />;

  return (
    <ConversationProvider>
      <LiveDemo {...props} />
    </ConversationProvider>
  );
}
