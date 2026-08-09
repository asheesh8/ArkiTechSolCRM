import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  CircleCheckBig,
  MapPin,
  MessageCircleQuestion,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { VideoDemoPlayer } from "@/components/videodemo/video-demo-player";
import styles from "./video-demo.module.css";

export const metadata: Metadata = {
  title: "AI Receptionist Campaign Demo | ArkiTech Solutions",
  description:
    "Watch ArkiTech Solutions turn a missed cleaning call into a booked job with an AI receptionist built for local service businesses.",
  alternates: {
    canonical: "https://arkitech-sol.com/videodemo",
  },
  openGraph: {
    title: "A missed call becomes a booked job | ArkiTech Solutions",
    description:
      "A 30-second campaign story showing an urgent request answered, qualified, and booked while the owner stays focused on the work.",
    type: "website",
    url: "https://arkitech-sol.com/videodemo",
    images: [
      {
        url: "https://arkitech-sol.com/videodemo/arkitech-cleaning-ad-v5-poster.webp",
        width: 1080,
        height: 1920,
        alt: "ArkiTech AI receptionist campaign video",
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

const proofPoints = [
  "Answers while you work",
  "Qualifies the request",
  "Checks availability",
  "Books the next step",
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
          priority
          sizes="100vw"
          className={styles.ambientImage}
        />
      </div>
      <div className={styles.backgroundGrid} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label="ArkiTech Solutions home" className={styles.logoLink}>
            <Image
              src="/arkitech-banner.png"
              alt="ArkiTech Solutions"
              fill
              priority
              sizes="192px"
              className={styles.logoImage}
            />
          </Link>

          <nav className={styles.nav} aria-label="Video demo navigation">
            <a href="#capabilities" className={styles.navLink}>What it handles</a>
            <Link href="/cleaningbook#demo" className={styles.navLink}>Live agent</Link>
            <a href="tel:+18023103749" className={styles.callLink}>Call us</a>
          </nav>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} />
            AI receptionist for cleaning businesses
          </div>

          <h1 className={styles.heroTitle}>
            A missed call shouldn&apos;t become
            <span> somebody else&apos;s job.</span>
          </h1>

          <p className={styles.heroBody}>
            See how ArkiTech answers an urgent request, checks availability, and books the work while the owner stays focused on the clean.
          </p>

          <div className={styles.heroActions}>
            <a href="#film" className={styles.primaryButton}>
              Watch the 30-second story
              <ArrowRight aria-hidden="true" />
            </a>
            <Link href="/cleaningbook#demo" className={styles.secondaryButton}>
              Call the live agent
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.localNote}>
            <MapPin aria-hidden="true" />
            Built by ArkiTech Solutions in Burlington, Vermont.
          </div>
        </div>

        <VideoDemoPlayer />
      </section>

      <section className={styles.proofRail} aria-label="AI receptionist capabilities">
        {proofPoints.map((point, index) => (
          <div className={styles.proofItem} key={point}>
            <span className={index === proofPoints.length - 1 ? styles.successDot : styles.signalDot} />
            {point}
          </div>
        ))}
      </section>

      <section id="capabilities" className={styles.capabilitySection}>
        <div className={styles.sectionIntro}>
          <p className={styles.sectionEyebrow}>What it handles</p>
          <h2>Built around the calls your business actually gets.</h2>
          <p>
            The receptionist follows your services, schedule, and handoff rules—then keeps the conversation moving in a voice that feels natural.
          </p>
        </div>

        <div className={styles.capabilityGrid}>
          {capabilities.map(({ icon: Icon, title, body }, index) => (
            <article className={styles.capabilityCard} key={title}>
              <div className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</div>
              <div className={styles.iconShell}><Icon aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.signalSection}>
        <div className={styles.materialPanel} aria-hidden="true">
          <Image
            src="/videodemo/arkitech-smoked-prism-glass.webp"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className={styles.materialImage}
          />
          <div className={styles.materialSheen} />
        </div>

        <div className={styles.signalCopy}>
          <div className={styles.sectionEyebrow}>Vermont Signal</div>
          <h2>Real work underneath. Precise ArkiTech signal above.</h2>
          <p>
            The physical story stays grounded and human. ArkiTech only enters where it matters: the answer, the booking, and the outcome.
          </p>

          <div className={styles.signalDetails}>
            <div><span>01</span> Real service-business pressure</div>
            <div><span>02</span> Exact booking conversation</div>
            <div><span>03</span> Clear human payoff</div>
          </div>
        </div>

        <div className={styles.mascotPanel}>
          <div className={styles.mascotGlow} aria-hidden="true" />
          <Image
            src="/videodemo/arkitech-cleaning-receptionist-mascot.webp"
            alt="Friendly ArkiTech cleaning receptionist mascot"
            width={1024}
            height={1024}
            sizes="(max-width: 720px) 70vw, 360px"
            className={styles.mascotImage}
          />
          <div className={styles.mascotStatus}>
            <span />
            Receptionist active
          </div>
        </div>
      </section>

      <section className={styles.localSection}>
        <div className={styles.localCard}>
          <Sparkles aria-hidden="true" className={styles.localSpark} />
          <p className={styles.sectionEyebrow}>Built in Burlington</p>
          <h2>A real local team sets it up around your business.</h2>
          <p>
            ArkiTech Solutions is a Vermont digital product studio. We shape the receptionist around your services, availability, and handoff rules—not a generic script.
          </p>
          <div className={styles.localActions}>
            <Link href="/#about" className={styles.primaryButton}>
              Meet the team
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/" className={styles.textLink}>Explore ArkiTech Solutions</Link>
          </div>
        </div>
      </section>

      <section className={styles.closingSection}>
        <div className={styles.closingGlow} aria-hidden="true" />
        <p className={styles.sectionEyebrow}>The next call</p>
        <h2>Your next job is already calling.</h2>
        <p>Let&apos;s make sure someone answers.</p>
        <div className={styles.heroActions}>
          <a href="tel:+18023103749" className={styles.primaryButton}>
            Book a 15-minute call
            <PhoneCall aria-hidden="true" />
          </a>
          <Link href="/cleaningbook#demo" className={styles.secondaryButton}>
            Try the live agent
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerBrand}>ArkiTech Solutions</Link>
        <span>© {new Date().getFullYear()} · Burlington, Vermont</span>
        <div>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
        </div>
      </footer>
    </main>
  );
}
