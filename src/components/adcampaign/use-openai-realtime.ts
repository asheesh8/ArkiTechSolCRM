"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// WebRTC client for an OpenAI Realtime session. ElevenLabs ships a React hook
// for this; OpenAI does not, so the peer connection is wired by hand.
//
// The exchange is: ask our server for an ephemeral key, offer SDP to OpenAI
// with it, play the returned audio track, and read conversation events off a
// data channel named "oai-events".

const CALLS_URL = "https://api.openai.com/v1/realtime/calls";

export type CallStatus = "idle" | "connecting" | "connected";
export type Turn = { role: "agent" | "caller"; text: string };

type RealtimeEvent = { type?: string; delta?: string; transcript?: string };

export function useOpenAiRealtime({ slug, onStart }: { slug: string; onStart?: () => void }) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [error, setError] = useState("");

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Deltas stream in fragment by fragment; these accumulate the turn that is
  // currently being spoken so the transcript doesn't render one word per line.
  const agentBuffer = useRef("");
  const callerBuffer = useRef("");

  const cleanup = useCallback(() => {
    pcRef.current?.getSenders().forEach((sender) => sender.track?.stop());
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    audioRef.current?.remove();
    audioRef.current = null;
    agentBuffer.current = "";
    callerBuffer.current = "";
    setIsSpeaking(false);
    setStatus("idle");
  }, []);

  // A page navigation must not leave the microphone open or the session billing.
  useEffect(() => cleanup, [cleanup]);

  const commit = useCallback((role: Turn["role"], text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTurns((prev) => [...prev, { role, text: trimmed }]);
  }, []);

  const handleEvent = useCallback((event: RealtimeEvent) => {
    switch (event.type) {
      case "response.output_audio_transcript.delta":
        agentBuffer.current += event.delta ?? "";
        break;
      case "response.output_audio_transcript.done":
        commit("agent", event.transcript ?? agentBuffer.current);
        agentBuffer.current = "";
        break;

      case "conversation.item.input_audio_transcription.delta":
        callerBuffer.current += event.delta ?? "";
        break;
      case "conversation.item.input_audio_transcription.completed":
        commit("caller", event.transcript ?? callerBuffer.current);
        callerBuffer.current = "";
        break;

      // Drives the "speaking" state for the orb and waveform.
      case "output_audio_buffer.started":
        setIsSpeaking(true);
        break;
      case "output_audio_buffer.stopped":
      case "output_audio_buffer.cleared":
      case "response.done":
        setIsSpeaking(false);
        break;

      case "error":
        setError("The agent hit an error. Try starting the call again.");
        break;
    }
  }, [commit]);

  const start = useCallback(async () => {
    setError("");
    setTurns([]);
    setStatus("connecting");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch {
      setError("Your browser blocked the microphone. Allow it and try again — or play the example call instead.");
      setStatus("idle");
      return;
    }

    let clientSecret: string;
    try {
      const res = await fetch(`/api/demo/${slug}/session`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "The demo could not be started.");
        cleanup();
        return;
      }
      clientSecret = data.clientSecret;
    } catch {
      setError("Network error — the demo could not be started.");
      cleanup();
      return;
    }

    try {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      // The model's voice arrives as a remote track; it needs a real element to
      // play through, and autoplay is allowed because start() is user-gestured.
      const audio = document.createElement("audio");
      audio.autoplay = true;
      audioRef.current = audio;
      pc.ontrack = (event) => { audio.srcObject = event.streams[0]; };

      pc.addTrack(stream.getTracks()[0], stream);

      const channel = pc.createDataChannel("oai-events");
      channel.addEventListener("message", (message) => {
        try {
          handleEvent(JSON.parse(message.data) as RealtimeEvent);
        } catch {
          // A malformed frame isn't worth tearing the call down for.
        }
      });
      channel.addEventListener("open", () => {
        setStatus("connected");
        onStart?.();
      });

      pc.addEventListener("connectionstatechange", () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          setError("The call dropped. Try again.");
          cleanup();
        }
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(CALLS_URL, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        setError("The demo line is busy. Try again in a moment.");
        cleanup();
        return;
      }

      await pc.setRemoteDescription({ type: "answer", sdp: await sdpResponse.text() });
    } catch {
      setError("The call could not be connected. Try again.");
      cleanup();
    }
  }, [slug, onStart, handleEvent, cleanup]);

  return { status, isSpeaking, turns, error, start, end: cleanup };
}
