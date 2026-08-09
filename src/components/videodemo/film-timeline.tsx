"use client";

import { useFilm } from "./film-provider";
import { FILM_BEATS } from "./film";
import styles from "@/app/videodemo/video-demo.module.css";

export function FilmTimeline() {
  const { progress, activeBeat, started, duration, play } = useFilm();

  return (
    <div className={styles.timeline}>
      <div
        className={styles.track}
        style={{ "--progress": `${progress * 100}%` } as React.CSSProperties}
      >
        <div className={styles.trackFill} aria-hidden="true" />
        {FILM_BEATS.map((beat, index) => (
          <span
            key={beat.timecode}
            className={styles.trackMark}
            data-tone={beat.tone}
            data-reached={started && index <= activeBeat}
            style={{ left: `${(beat.time / duration) * 100}%` }}
            aria-hidden="true"
          />
        ))}
      </div>

      <ol className={styles.beats}>
        {FILM_BEATS.map((beat, index) => (
          <li key={beat.timecode}>
            <button
              type="button"
              className={styles.beat}
              data-tone={beat.tone}
              data-active={started && activeBeat === index}
              onClick={() => play(beat.time)}
              aria-current={started && activeBeat === index ? "true" : undefined}
              aria-label={`Play from ${beat.timecode}, ${beat.title}`}
            >
              <span className={styles.beatTime}>{beat.timecode}</span>
              <strong className={styles.beatTitle}>{beat.title}</strong>
              <span className={styles.beatLine}>{beat.line}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
