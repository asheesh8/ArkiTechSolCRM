import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck2,
  CircleCheckBig,
  MessageCircleQuestion,
  PhoneCall,
} from "lucide-react";
import { FilmProvider } from "@/components/videodemo/film-provider";
import { FilmStage } from "@/components/videodemo/film-stage";
import { FilmTimeline } from "@/components/videodemo/film-timeline";
import styles from "./video-demo.module.css";

export const metadata: Metadata = {
  title: "AI Receptionist Campaign Film | ArkiTech Solutions",
  description:
    "Watch ArkiTech Solutions turn a missed cleaning call into a booked job with an AI receptionist built for local service businesses.",
  alternates: {
    canonical: "https://arkitech-sol.com/videodemo",
  },
  openGraph: {
    title: "A missed call becomes a booked job | ArkiTech Solutions",
    description:
      "A 30-second campaign film showing an urgent request answered, qualified, and booked while the owner stays focused on the work.",
    type: "website",
    url: "https://arkitech-sol.com/videodemo",
    images: [
      {
        url: "https://arkitech-sol.com/videodemo/arkitech-cleaning-ad-v5-poster.webp",
        width: 1080,
        height: 1920,
        alt: "ArkiTech AI receptionist campaign film",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A missed call becomes a booked job | ArkiTech Solutions",
    description: "Watch the current ArkiTech AI receptionist campaign cut.",
    images: ["https://arkitech-sol.com/videodemo/arkitech-cleaning-ad-v5-poster.webp"],
  },
};

/**
 * The exchange the film puts on screen, in the film's own words. Keeping the
 * page and the cut in sync matters more than fresh copy here — someone who
 * watches the 30 seconds should recognise every line.
 */
const callCards = [
  {
    tone: "agent" as const,
    label: "AI receptionist",
    line: "Agent answered",
    note: "Call handled while the cleaner keeps working.",
    status: "Connected",
  },
  {
    tone: "caller" as const,
    label: "Customer",
    line: "Emergency cleaning today — possible?",
  },
  {
    tone: "agent" as const,
    label: "ArkiTech agent",
    line: "Yes — 3:30 PM is open. I can book it.",
  },
  {
    tone: "booked" as const,
    label: "Booking confirmed",
    line: "Confirmed · Details sent to the client.",
  },
];

const capabilities = [
  {
    icon: MessageCircleQuestion,
    title: "Questions and quotes",
    body: "Services, pricing ranges, locations, and the questions customers ask before they book.",
  },
  {
    icon: PhoneCall,
    title: "Urgent requests",
    body: "Captures what happened and keeps the right calls moving while your team stays on the job.",
  },
  {
    icon: CalendarCheck2,
    title: "Availability",
    body: "Checks the schedule against the rules, hours, and service windows you choose.",
  },
  {
    icon: CircleCheckBig,
    title: "Booking and handoff",
    body: "Confirms the next step and passes the details to your team without another round of phone tag.",
  },
];

export default function VideoDemoPage() {
  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true">
        <Image
          src="/videodemo/arkitech-signal-caustics.webp"
          alt=""
          fill
          sizes="100vw"
          className={styles.ambientImage}
        />
      </div>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label="ArkiTech Solutions home" className={styles.logo}>
            <Image
              src="/arkitech-banner.png"
              alt="ArkiTech Solutions"
              fill
              priority
              sizes="176px"
              className={styles.logoImage}
            />
          </Link>

          <nav className={styles.nav} aria-label="Film navigation">
            <a href="#story">The film</a>
            <a href="#capabilities">What it handles</a>
            <Link href="/cleaningbook#demo" className={styles.navCta}>
              Live agent
            </Link>
          </nav>
        </div>
      </header>

      <FilmProvider>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.pulseDot} />
              AI receptionist · Cleaning businesses
            </p>

            <h1 className={styles.heroTitle}>
              A missed call shouldn&apos;t become{" "}
              <em>somebody else&apos;s job.</em>
            </h1>

            <p className={styles.heroBody}>
              Thirty seconds: the phone rings mid-job, ArkiTech answers, checks the
              schedule, and books the work before the caller tries the next company.
            </p>

            <div className={styles.heroActions}>
              <Link href="/cleaningbook#demo" className={styles.buttonPrimary}>
                Try the live agent
                <ArrowUpRight aria-hidden="true" />
              </Link>
              <a href="tel:+18023103749" className={styles.buttonGhost}>
                <PhoneCall aria-hidden="true" />
                Book a 15-minute call
              </a>
            </div>

            <p className={styles.heroNote}>
              Built by ArkiTech Solutions in Burlington, Vermont.
            </p>
          </div>

          <FilmStage />
        </section>

        <section id="story" className={styles.storySection}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>The thirty seconds</p>
            <h2>Four beats, one missed call.</h2>
            <p className={styles.sectionBody}>
              Pick any beat and the film picks up from there.
            </p>
          </div>

          <FilmTimeline />

          <div className={styles.storyNotes}>
            <details className={styles.transcript}>
              <summary>Transcript and visual description</summary>
              <div>
                <p>
                  <strong>Visual description:</strong> A cleaner stays busy and misses an
                  urgent call. An ArkiTech receptionist answers, checks availability,
                  confirms the booking, and the cleaner later meets the customer at the
                  door.
                </p>
                <p>
                  <strong>Narration:</strong> You&apos;re doing the work, managing the crew,
                  and keeping the whole day moving. Then the phone rings. You miss it—and
                  just like that, your next customer is already calling somebody else.
                  That&apos;s why we built ArkiTech. Our AI receptionist answers instantly,
                  sounds natural, and turns calls into booked jobs. Watch this. Same-day
                  cleaning. Schedule checked. Appointment confirmed. Done—that fast. You
                  stay focused. Your customer gets help. And you get the job. Never miss
                  another call—or the revenue behind it. ArkiTech Solutions.
                </p>
              </div>
            </details>

            <p className={styles.disclosure}>
              Illustrative scenario shown in the film: 12 missed calls/week × $450 average
              job × 40% booking rate. Estimate, not a guarantee. Results vary.
            </p>
          </div>
        </section>
      </FilmProvider>

      <section className={styles.callSection}>
        <div className={styles.callCopy}>
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>On the call</p>
            <h2>What the caller actually hears.</h2>
            <p className={styles.sectionBody}>
              The receptionist works from your services, your prices, and your calendar.
              This is the exchange the film puts on screen, start to finish.
            </p>
          </div>

          <div className={styles.mascot}>
            <div className={styles.mascotGlow} aria-hidden="true" />
            <Image
              src="/videodemo/arkitech-cleaning-receptionist-mascot.webp"
              alt="The ArkiTech cleaning receptionist mascot, a friendly robot in an apron"
              width={1024}
              height={1024}
              sizes="(max-width: 900px) 168px, 232px"
              className={styles.mascotImage}
            />
            <p className={styles.mascotStatus}>
              <span className={styles.pulseDot} />
              Receptionist active
            </p>
          </div>
        </div>

        <ol className={styles.callStack}>
          {callCards.map((card) => (
            <li key={card.line} className={styles.callCard} data-tone={card.tone}>
              <p className={styles.callLabel}>
                {card.label}
                {card.status && (
                  <span className={styles.callStatus}>
                    <span className={styles.pulseDot} />
                    {card.status}
                  </span>
                )}
              </p>
              <p className={styles.callLine}>{card.line}</p>
              {card.note && <p className={styles.callNote}>{card.note}</p>}
            </li>
          ))}
        </ol>
      </section>

      <section id="capabilities" className={styles.capabilitySection}>
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Beyond this call</p>
          <h2>Built around the calls your business actually gets.</h2>
          <p className={styles.sectionBody}>
            The receptionist follows your services, schedule, and handoff rules — then
            keeps the conversation moving in a voice that feels natural.
          </p>
        </div>

        <div className={styles.capabilityGrid}>
          {capabilities.map(({ icon: Icon, title, body }) => (
            <article className={styles.capability} key={title}>
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.studioSection}>
        <div>
          <p className={styles.eyebrow}>Burlington, Vermont</p>
          <h2>A local team sets it up around your business.</h2>
        </div>
        <div>
          <p className={styles.sectionBody}>
            ArkiTech Solutions is a Vermont digital product studio. We shape the
            receptionist around your services, availability, and handoff rules — not a
            generic script.
          </p>
          <div className={styles.studioLinks}>
            <Link href="/#about">Meet the team</Link>
            <Link href="/">Explore ArkiTech Solutions</Link>
          </div>
        </div>
      </section>

      <section className={styles.closing}>
        <div className={styles.closingGlow} aria-hidden="true" />
        <p className={styles.eyebrow}>The next call</p>
        <h2>Your next job is already calling.</h2>
        <p className={styles.sectionBody}>Let&apos;s make sure someone answers.</p>
        <div className={styles.heroActions}>
          <a href="tel:+18023103749" className={styles.buttonPrimary}>
            <PhoneCall aria-hidden="true" />
            Book a 15-minute call
          </a>
          <Link href="/cleaningbook#demo" className={styles.buttonGhost}>
            Try the live agent
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerBrand}>
          ArkiTech Solutions
        </Link>
        <span>© {new Date().getFullYear()} · Burlington, Vermont</span>
        <div>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
        </div>
      </footer>
    </main>
  );
}
