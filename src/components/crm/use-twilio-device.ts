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

export function useTwilioDevice({
  enabled,
  onCallCompleted,
}: {
  enabled: boolean;
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
      return;
    }

    let cancelled = false;

    async function boot() {
      setStatus("loading");
      setError(null);
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

    return () => {
      cancelled = true;
      callRef.current?.disconnect();
      callRef.current = null;
      deviceRef.current?.destroy();
      deviceRef.current = null;
    };
  }, [enabled, fetchToken]);

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

        call.on("ringing", () => setStatus("ringing"));
        call.on("accept", () => {
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

  const busy = status === "connecting" || status === "ringing" || status === "on-call";

  return { status, error, callerId, seconds, muted, busy, dial, hangUp, toggleMute };
}
