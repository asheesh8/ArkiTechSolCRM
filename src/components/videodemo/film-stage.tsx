"use client";

import Image from "next/image";
import { Captions, Play, RotateCcw, Volume2 } from "lucide-react";
import { useFilm } from "./film-provider";
import { FILM_CAPTIONS, FILM_POSTER, formatTimecode } from "./film";
import styles from "@/app/videodemo/video-demo.module.css";

export function FilmStage() {
  const { attachVideo, source, started, ended, elapsed, duration, play } = useFilm();

  return (
    <div className={styles.stage}>
      {/* Decorative, but it sits above the fold and paints wider than the frame
          itself, so Next picks it as the LCP element. 36 KB and eager beats a
          lazy image the browser waits on. */}
      <div className={styles.stageLight} aria-hidden="true">
        <Image
          src="/videodemo/arkitech-smoked-prism-glass.webp"
          alt=""
          fill
          priority
          sizes="600px"
          className={styles.stageLightImage}
        />
      </div>

      <div className={styles.stageInner}>
        <div className={styles.stageHead}>
          <span className={styles.stageSlate}>
            <span className={styles.pulseDot} />
            Campaign cut · V5
          </span>
          <span className={styles.stageClock}>
            {formatTimecode(elapsed)}
            <i>/</i>
            {formatTimecode(duration)}
          </span>
        </div>

        <div className={styles.frame}>
          <video
            ref={attachVideo}
            className={styles.video}
            poster={FILM_POSTER}
            preload="none"
            playsInline
            controls={started}
            aria-label="ArkiTech AI receptionist cleaning campaign film"
          >
            {source && <source src={source} type="video/mp4" />}
            <track default kind="captions" src={FILM_CAPTIONS} srcLang="en" label="English" />
            Your browser does not support embedded video.
          </video>

          {!started && (
            <button
              type="button"
              className={styles.frameCover}
              onClick={() => play(0)}
              aria-label="Play the campaign film with sound, 30 seconds"
            >
              <span className={styles.playKey}>
                <Play aria-hidden="true" />
              </span>
              <span className={styles.playCopy}>
                <strong>Watch with sound</strong>
                <small>30 seconds · captions included</small>
              </span>
            </button>
          )}

          {ended && (
            <button
              type="button"
              className={styles.frameReplay}
              onClick={() => play(0)}
            >
              <RotateCcw aria-hidden="true" />
              Watch again
            </button>
          )}
        </div>

        <ul className={styles.stageFacts}>
          <li>
            <Volume2 aria-hidden="true" />
            Voice and sound design
          </li>
          <li>
            <Captions aria-hidden="true" />
            English captions
          </li>
        </ul>
      </div>
    </div>
  );
}
