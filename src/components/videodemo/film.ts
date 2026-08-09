/**
 * Shared facts about the campaign cut. Imported by both the server page and
 * the client components that drive playback, so the timeline, the transcript,
 * and the metadata can never drift apart.
 */

export const FILM_POSTER = "/videodemo/arkitech-cleaning-ad-v5-poster.webp";
export const FILM_CAPTIONS = "/videodemo/arkitech-cleaning-ad-v5-en.vtt";

/**
 * The 1080 cut is 11 MB and the 720 cut is 5 MB. A `media` attribute on
 * `<source>` is ignored inside `<video>` — it only works inside `<picture>` —
 * so the narrow cut has to be chosen in JS at play time instead.
 */
export const FILM_SOURCES = {
  wide: "/videodemo/arkitech-cleaning-ad-v5-1080.mp4",
  narrow: "/videodemo/arkitech-cleaning-ad-v5-720.mp4",
} as const;

/** Fallback until the real duration arrives with the video metadata. */
export const FILM_DURATION = 29.9;

/**
 * Which side of the story a beat belongs to. The rail runs warm while the
 * problem is the owner's, turns to the agent's violet the moment ArkiTech
 * picks up, and lands on the booking green.
 */
export type FilmTone = "ember" | "agent" | "booked";

export type FilmBeat = {
  /** Seconds into the cut. */
  time: number;
  timecode: string;
  tone: FilmTone;
  title: string;
  /** What the narrator is saying at this point in the cut. */
  line: string;
};

/**
 * Beat times are cue boundaries from arkitech-cleaning-ad-v5-en.vtt, so a
 * timecode on the rail always lands on the line the viewer is hearing. Edit
 * the caption file and these move with it.
 */
export const FILM_BEATS: FilmBeat[] = [
  {
    time: 0,
    timecode: "00:00",
    tone: "ember",
    title: "The day is already full",
    line: "You're doing the work, managing the crew, and keeping the whole day moving.",
  },
  {
    time: 4.55,
    timecode: "00:04",
    tone: "ember",
    title: "The call you can't take",
    line: "Then the phone rings. You miss it — and your next customer is already calling somebody else.",
  },
  {
    time: 13.65,
    timecode: "00:13",
    tone: "agent",
    title: "ArkiTech picks up",
    line: "Same-day cleaning. Schedule checked. Appointment confirmed.",
  },
  {
    time: 19.65,
    timecode: "00:19",
    tone: "booked",
    title: "You still get the job",
    line: "You stay focused. Your customer gets help. And you get the job.",
  },
];

export function beatIndexAt(seconds: number): number {
  let index = 0;
  for (let i = 0; i < FILM_BEATS.length; i += 1) {
    if (seconds >= FILM_BEATS[i].time) index = i;
  }
  return index;
}

export function formatTimecode(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const minutes = Math.floor(safe / 60);
  const rest = Math.floor(safe % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
