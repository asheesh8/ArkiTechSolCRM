"use client";

import Image from "next/image";
import { Captions, Clock3, Play, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "@/app/videodemo/video-demo.module.css";

const chapters = [
  {
    time: 0,
    timestamp: "00:00",
    title: "The owner keeps working",
    body: "The call no longer depends on someone stopping mid-job to catch it.",
  },
  {
    time: 16.5,
    timestamp: "00:16",
    title: "ArkiTech answers",
    body: "The receptionist handles the request, checks the schedule, and keeps it moving.",
  },
  {
    time: 21.54,
    timestamp: "00:21",
    title: "The job gets booked",
    body: "The customer gets help. The cleaner gets the appointment.",
  },
];

export function VideoDemoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pendingTimeRef = useRef(0);
  const [started, setStarted] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    if (!started || !videoRef.current) return;

    const video = videoRef.current;
    const beginPlayback = () => {
      video.currentTime = pendingTimeRef.current;
      void video.play().catch(() => undefined);
    };

    if (video.readyState >= 1) {
      beginPlayback();
      return;
    }

    video.addEventListener("loadedmetadata", beginPlayback, { once: true });
    video.load();
    return () => video.removeEventListener("loadedmetadata", beginPlayback);
  }, [started]);

  const playFrom = useCallback((time: number) => {
    pendingTimeRef.current = time;
    const chapterIndex = chapters.reduce(
      (current, chapter, index) => (time >= chapter.time ? index : current),
      0,
    );
    setActiveChapter(chapterIndex);

    if (!started) {
      setStarted(true);
      return;
    }

    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    void video.play().catch(() => undefined);
  }, [started]);

  function updateChapter() {
    const time = videoRef.current?.currentTime ?? 0;
    const next = chapters.reduce(
      (current, chapter, index) => (time >= chapter.time ? index : current),
      0,
    );
    setActiveChapter((current) => (current === next ? current : next));
  }

  return (
    <div id="film" className={styles.playerColumn}>
      <div className={styles.playerStage}>
        <div className={styles.glassPlate} aria-hidden="true">
          <Image
            src="/videodemo/arkitech-smoked-prism-glass.webp"
            alt=""
            fill
            priority
            sizes="520px"
            className={styles.glassPlateImage}
          />
        </div>

        <div className={styles.playerMeta}>
          <span><span className={styles.liveDot} /> Campaign cut · V5</span>
          <span>00:29</span>
        </div>

        <div className={styles.videoFrame}>
          <video
            ref={videoRef}
            className={styles.video}
            poster="/videodemo/arkitech-cleaning-ad-v5-poster.webp"
            preload="none"
            playsInline
            controls={started}
            onTimeUpdate={updateChapter}
            aria-label="ArkiTech AI receptionist cleaning campaign video"
          >
            {started && (
              <>
                <source
                  src="/videodemo/arkitech-cleaning-ad-v5-720.mp4"
                  type="video/mp4"
                  media="(max-width: 767px)"
                />
                <source src="/videodemo/arkitech-cleaning-ad-v5-1080.mp4" type="video/mp4" />
              </>
            )}
            <track
              default
              kind="captions"
              src="/videodemo/arkitech-cleaning-ad-v5-en.vtt"
              srcLang="en"
              label="English"
            />
            Your browser does not support embedded video.
          </video>

          {!started && (
            <button
              type="button"
              className={styles.playOverlay}
              onClick={() => playFrom(0)}
              aria-label="Play the 30-second campaign film with sound"
            >
              <span className={styles.playIcon}><Play aria-hidden="true" /></span>
              <span>
                <strong>Watch with sound</strong>
                <small>30-second campaign story</small>
              </span>
            </button>
          )}
        </div>

        <div className={styles.playerBadges} aria-label="Video details">
          <span><Clock3 aria-hidden="true" /> 29.9 seconds</span>
          <span><Volume2 aria-hidden="true" /> Voice + sound design</span>
          <span><Captions aria-hidden="true" /> Captions</span>
        </div>
      </div>

      <div className={styles.chapterList} aria-label="Video chapters">
        {chapters.map((chapter, index) => (
          <button
            type="button"
            key={chapter.timestamp}
            onClick={() => playFrom(chapter.time)}
            className={styles.chapterButton}
            data-active={activeChapter === index}
            aria-current={activeChapter === index ? "step" : undefined}
            aria-label={`Play chapter ${index + 1}, ${chapter.title}, at ${chapter.timestamp}`}
          >
            <span className={styles.chapterTime}>{chapter.timestamp}</span>
            <span className={styles.chapterCopy}>
              <strong>{chapter.title}</strong>
              <small>{chapter.body}</small>
            </span>
          </button>
        ))}
      </div>

      <p className={styles.disclosure}>
        Illustrative scenario shown in the film: 12 missed calls/week × $450 average job × 40% booking rate. Estimate, not a guarantee. Results vary.
      </p>

      <details className={styles.transcript}>
        <summary>Read transcript and visual description</summary>
        <div>
          <p><strong>Visual description:</strong> A cleaner stays busy and misses an urgent call. An ArkiTech receptionist answers, checks availability, confirms the booking, and the cleaner later meets the customer at the door.</p>
          <p><strong>Narration:</strong> You&apos;re doing the work, managing the crew, and keeping the whole day moving. Then the phone rings. You miss it—and just like that, your next customer is already calling somebody else. That&apos;s why we built ArkiTech. Our AI receptionist answers instantly, sounds natural, and turns calls into booked jobs. Watch this. Same-day cleaning. Schedule checked. Appointment confirmed. Done—that fast. You stay focused. Your customer gets help. And you get the job. Never miss another call—or the revenue behind it. ArkiTech Solutions.</p>
        </div>
      </details>
    </div>
  );
}
