"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Call, Device } from "@twilio/voice-sdk";

// A softphone that lives in the cold-call tab. The SDK is loaded on demand
// rather than imported at module scope: it touches `window` and `navigator` as
// soon as it is evaluated, which would break the server render of any page that
// pulls this file in.

export type DialerStatus =
  | "unconfigured"
  | "loading"
  | "ready"
  | "connecting"
  | "ringing"
  | "on-call"
  | "error";

export type CompletedCall = {
  /** Seconds of connected conversation. Zero when nobody picked up. */
  durationSecs: number;
  /**
   * Twilio's id for the leg, best-effort: the SDK documents `parameters` for
   * incoming calls, so an outgoing leg may finish without one. Recording and
   * transcript work will take the authoritative SID from a status callback
   * rather than from the browser — this is only an early join key when present.
   */
  callSid: string | null;
  answered: boolean;
};

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  return fallback;
}

/**
 * Ringback for the rep's own ear.
 *
 * `answerOnBridge` keeps the caller's leg unanswered until the prospect picks
 * up, which is what makes a no-answer log as a no-answer instead of a
 * thirty-second call. The cost is silence: nothing is bridged yet, so unless
 * the carrier happens to send early media there is no audio at all and the
 * rep can't tell a ringing line from a dead one. Twilio reports which case it
 * is on the `ringing` event, and this fills the gap when it has to.
 *
 * Synthesised rather than shipped as an audio file so it needs no asset and no
 * network round trip: US ringback is 440Hz and 480Hz together, two seconds on,
 * four seconds off.
 */
function createRingback() {
  let context: AudioContext | null = null;
  let timer: number | null = null;
  let stopped = true;

  function burst() {
    if (!context || stopped) return;
    const gain = context.createGain();
    gain.connect(context.destination);
    // Eased on and off — a square-edged tone clicks.
    const now = context.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gain.gain.setValueAtTime(0.12, now + 1.96);
    gain.gain.linearRampToValueAtTime(0, now + 2);

    for (const frequency of [440, 480]) {
      const oscillator = context.createOscillator();
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start(now);
      oscillator.stop(now + 2);
    }
  }

  return {
    start() {
      if (!stopped) return;
      stopped = false;
      try {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        context = new Ctor();
        burst();
        timer = window.setInterval(burst, 6_000);
      } catch {
        // No audio context available. A silent ring is worse than a crash is
        // worth, so this stays best-effort.
      }
    },
    stop() {
      stopped = true;
      if (timer !== null) window.clearInterval(timer);
      timer = null;
      void context?.close().catch(() => {});
      context = null;
    },
  };
}

export function useTwilioDevice({
  enabled,
  configurationKey,
  onCallCompleted,
}: {
  enabled: boolean;
  /** Changes whenever the active Twilio account or caller ID changes. */
  configurationKey: string;
  onCallCompleted?: (call: CompletedCall) => void;
}) {
  const [status, setStatus] = useState<DialerStatus>(enabled ? "loading" : "unconfigured");
  const [error, setError] = useState<string | null>(null);
  const [callerId, setCallerId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);

  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);
  const answeredAtRef = useRef<number | null>(null);
  const ringbackRef = useRef(createRingback());

  // Held in a ref so a caller can pass an inline arrow without tearing down and
  // rebuilding the device on every render.
  const onCompletedRef = useRef(onCallCompleted);
  useEffect(() => {
    onCompletedRef.current = onCallCompleted;
  }, [onCallCompleted]);

  const fetchToken = useCallback(async () => {
    const response = await fetch("/api/calls/token", { method: "POST" });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error || "Couldn't start the dialler.");
    }
    return data as { token: string; callerId: string };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setStatus("unconfigured");
      setError(null);
      setCallerId(null);
      return;
    }

    let cancelled = false;

    async function boot() {
      setStatus("loading");
      setError(null);
      setCallerId(null);
      try {
        const { token, callerId: outboundNumber } = await fetchToken();
        const { Device } = await import("@twilio/voice-sdk");
        if (cancelled) return;

        const device = new Device(token, { logLevel: "error" });

        device.on("error", (deviceError: unknown) => {
          setError(errorMessage(deviceError, "The dialler hit an error."));
          setStatus("error");
        });

        // Tokens outlive any single call, but not a long shift at the desk.
        device.on("tokenWillExpire", () => {
          void fetchToken()
            .then(({ token: refreshed }) => device.updateToken(refreshed))
            .catch(() => {
              setError("The dialler session expired. Reload the page to keep calling.");
              setStatus("error");
            });
        });

        deviceRef.current = device;
        setCallerId(outboundNumber);
        setStatus("ready");
      } catch (bootError) {
        if (cancelled) return;
        setError(errorMessage(bootError, "Couldn't start the dialler."));
        setStatus("error");
      }
    }

    void boot();

    const ringback = ringbackRef.current;
    return () => {
      cancelled = true;
      // Leaving the tab mid-ring would otherwise leave the tone running with
      // no call behind it.
      ringback.stop();
      callRef.current?.disconnect();
      callRef.current = null;
      deviceRef.current?.destroy();
      deviceRef.current = null;
    };
  }, [configurationKey, enabled, fetchToken]);

  // Live duration. Only ticks while someone is actually on the line.
  useEffect(() => {
    if (status !== "on-call") return;
    const timer = window.setInterval(() => {
      const answeredAt = answeredAtRef.current;
      if (answeredAt) setSeconds(Math.floor((Date.now() - answeredAt) / 1_000));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [status]);

  const complete = useCallback(() => {
    const call = callRef.current;
    // Twilio can emit more than one terminal event for a single leg — a
    // cancelled call also disconnects — and the first one is the truthful one.
    if (!call) return;

    ringbackRef.current.stop();

    const answeredAt = answeredAtRef.current;
    const durationSecs = answeredAt ? Math.max(0, Math.round((Date.now() - answeredAt) / 1_000)) : 0;
    const callSid = call.parameters?.CallSid ?? null;

    callRef.current = null;
    answeredAtRef.current = null;
    setSeconds(0);
    setMuted(false);
    setStatus(deviceRef.current ? "ready" : "unconfigured");

    onCompletedRef.current?.({ durationSecs, callSid, answered: answeredAt !== null });
  }, []);

  const dial = useCallback(
    async (e164: string, extraParams: Record<string, string> = {}) => {
      const device = deviceRef.current;
      if (!device || callRef.current) return;

      setError(null);
      setMuted(false);
      setStatus("connecting");

      try {
        // Custom params reach the TwiML endpoint as ordinary POST fields, which
        // is how the server learns which lead this call belongs to.
        const call = await device.connect({ params: { To: e164, ...extraParams } });
        callRef.current = call;
        answeredAtRef.current = null;

        // `hasEarlyMedia` is true when the carrier is already sending real
        // ringing down the line; generating a second tone over it would just
        // beat against it.
        call.on("ringing", (hasEarlyMedia: boolean) => {
          setStatus("ringing");
          if (!hasEarlyMedia) ringbackRef.current.start();
        });
        call.on("accept", () => {
          ringbackRef.current.stop();
          answeredAtRef.current = Date.now();
          setSeconds(0);
          setStatus("on-call");
        });
        call.on("disconnect", complete);
        call.on("cancel", complete);
        call.on("reject", complete);
        call.on("error", (callError: unknown) => {
          setError(errorMessage(callError, "The call dropped."));
          complete();
        });
      } catch (dialError) {
        // The usual cause is a blocked microphone, and the browser's own wording
        // for that is better than anything invented here.
        setError(errorMessage(dialError, "Couldn't place the call."));
        setStatus("ready");
      }
    },
    [complete],
  );

  const hangUp = useCallback(() => {
    callRef.current?.disconnect();
  }, []);

  const toggleMute = useCallback(() => {
    const call = callRef.current;
    if (!call) return;
    setMuted((current) => {
      const next = !current;
      call.mute(next);
      return next;
    });
  }, []);

  /**
   * Send touch tones into a live call.
   *
   * This is what gets a rep past "press 2 for scheduling". Without it the
   * keypad is only useful before dialling, and every gatekeeper menu is a dead
   * end. Returns false when there is no call to send into, so the keypad can
   * fall back to composing a number instead.
   */
  const sendDigits = useCallback((digits: string) => {
    const call = callRef.current;
    if (!call) return false;
    call.sendDigits(digits);
    return true;
  }, []);

  const busy = status === "connecting" || status === "ringing" || status === "on-call";

  return { status, error, callerId, seconds, muted, busy, dial, hangUp, toggleMute, sendDigits };
}
