"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { beatIndexAt, FILM_DURATION, FILM_SOURCES } from "./film";

type FilmContextValue = {
  /** Callback ref the stage hands to its `<video>`. */
  attachVideo: (element: HTMLVideoElement | null) => void;
  /** Null until the first play — keeps the 11 MB cut off the initial load. */
  source: string | null;
  started: boolean;
  playing: boolean;
  ended: boolean;
  elapsed: number;
  duration: number;
  /** 0–1, refreshed per animation frame while playing. */
  progress: number;
  activeBeat: number;
  play: (time?: number) => void;
};

const FilmContext = createContext<FilmContextValue | null>(null);

export function useFilm(): FilmContextValue {
  const value = useContext(FilmContext);
  if (!value) throw new Error("useFilm must be used inside <FilmProvider>");
  return value;
}

function pickSource(): string {
  return window.matchMedia("(max-width: 767px)").matches
    ? FILM_SOURCES.narrow
    : FILM_SOURCES.wide;
}

export function FilmProvider({ children }: { children: ReactNode }) {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(FILM_DURATION);
  const pendingSeekRef = useRef(0);

  // `timeupdate` only fires about four times a second, which reads as a
  // stuttering progress bar on a half-minute film. Drive it from rAF while
  // the film is playing and fall back to the event when it isn't.
  useEffect(() => {
    if (!video || !playing) return;

    let frame = requestAnimationFrame(function tick() {
      setElapsed(video.currentTime);
      frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [video, playing]);

  useEffect(() => {
    if (!video) return;

    const syncTime = () => setElapsed(video.currentTime);
    const syncDuration = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        setDuration(video.duration);
      }
    };
    const onPlay = () => {
      setPlaying(true);
      setEnded(false);
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setEnded(true);
    };

    video.addEventListener("loadedmetadata", syncDuration);
    video.addEventListener("timeupdate", syncTime);
    video.addEventListener("seeked", syncTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("loadedmetadata", syncDuration);
      video.removeEventListener("timeupdate", syncTime);
      video.removeEventListener("seeked", syncTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [video]);

  // Runs once, when the first play swaps a real `src` onto the element.
  useEffect(() => {
    if (!video || !source) return;

    let cancelled = false;
    const begin = () => {
      if (cancelled) return;
      video.currentTime = pendingSeekRef.current;
      void video.play().catch(() => undefined);
    };

    if (video.readyState >= 1) {
      begin();
      return;
    }

    video.addEventListener("loadedmetadata", begin, { once: true });
    video.load();

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", begin);
    };
  }, [video, source]);

  const play = useCallback(
    (time = 0) => {
      pendingSeekRef.current = time;
      setElapsed(time);
      setEnded(false);

      if (!source) {
        setSource(pickSource());
        return;
      }

      if (!video) return;
      video.currentTime = time;
      void video.play().catch(() => undefined);
    },
    [source, video],
  );

  const value = useMemo<FilmContextValue>(
    () => ({
      attachVideo: setVideo,
      source,
      started: source !== null,
      playing,
      ended,
      elapsed,
      duration,
      progress: duration > 0 ? Math.min(elapsed / duration, 1) : 0,
      activeBeat: beatIndexAt(elapsed),
      play,
    }),
    [source, playing, ended, elapsed, duration, play],
  );

  return <FilmContext.Provider value={value}>{children}</FilmContext.Provider>;
}
