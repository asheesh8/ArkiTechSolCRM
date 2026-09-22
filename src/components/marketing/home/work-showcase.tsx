"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimate, useReducedMotion } from "framer-motion";
import {
  ArrowCounterClockwise,
  ArrowUpRight,
  CaretLeft,
  CaretRight,
  Desktop,
  DeviceMobile,
  Export,
  LockSimple,
  Plus,
} from "@phosphor-icons/react";
import { WORK, workImage, type Work } from "@/lib/marketing/work";

type View = "desktop" | "phone";

/** The screens the captures were taken at. */
const DESKTOP = { w: 1200, h: 750 };
const PHONE = { w: 390, h: 844 };

/**
 * The work, one site at a time. The screen sits on the site's first view
 * until someone picks it; then the whole page scrolls past once and glides
 * back to the top. The toggle swaps the laptop for the phone layout of the
 * same site. Hovering the screen holds the scroll.
 *
 * These are captures of the live sites, not mockups, and each row says
 * whether it is a client or a build we made to show the craft.
 */
export function WorkShowcase() {
  const [index, setIndex] = useState(0);
  const [view, setView] = useState<View>("desktop");
  const [play, setPlay] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const work = WORK[index];

  function bringScreenIntoView() {
    // On a phone the list sits under the screen; bring the screen back into
    // view so the scroll is actually seen.
    const r = frameRef.current?.getBoundingClientRect();
    if (r && (r.top < 0 || r.bottom > window.innerHeight)) {
      frameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function pick(i: number) {
    setIndex(i);
    setPlay((n) => n + 1);
    bringScreenIntoView();
  }

  function switchView(v: View) {
    if (v === view) return;
    setView(v);
    setPlay((n) => n + 1);
  }

  return (
    <section id="work" className="band section overflow-hidden">
      {/* The old site anchored this section as #showcase; keep those links working. */}
      <span id="showcase" aria-hidden="true" className="block scroll-mt-24" />
      <div className="shell">
        <div className="max-w-3xl">
          <h2 className="ak-display h-xl">Every pixel, built here.</h2>
          <p className="ak-lede mt-6 max-w-[54ch]">
            Five client sites that are live today, and two builds we made so you can judge the work before you ever
            book a call. Pick one to scroll through it.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_23rem]">
          <div ref={frameRef} className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="min-w-0 truncate text-sm text-[var(--dim)]">
                {view === "desktop" ? "On a laptop" : "On a phone"}<span className="hidden sm:inline">, as it looks today</span>
              </p>
              <ViewToggle value={view} onChange={switchView} />
            </div>

            {view === "desktop" ? <Laptop work={work} play={play} /> : <Phone work={work} play={play} />}
          </div>

          <div className="flex min-w-0 flex-col">
            <ol className="border-t border-[var(--rule)]">
              {WORK.map((w, i) => {
                const active = i === index;
                return (
                  <li key={w.slug} className="border-b border-[var(--rule)]">
                    <button
                      type="button"
                      onClick={() => pick(i)}
                      aria-pressed={active}
                      className="group relative flex w-full items-baseline justify-between gap-4 py-3.5 pl-4 text-left"
                    >
                      <span
                        aria-hidden="true"
                        className={`absolute bottom-3 left-0 top-3 w-[2px] origin-top bg-[var(--lamp)] transition-transform duration-500 ${
                          active ? "scale-y-100" : "scale-y-0"
                        }`}
                      />
                      <span className="min-w-0">
                        <span
                          className={`block text-[1.05rem] font-medium transition-colors ${
                            active ? "text-[var(--fg)]" : "text-[var(--fg-2)] group-hover:text-[var(--fg)]"
                          }`}
                        >
                          {w.name}
                        </span>
                        <span className="block text-sm text-[var(--dim)]">
                          {w.what}
                          {w.where ? `, ${w.where}` : ""}
                        </span>
                      </span>
                      <span className={`shrink-0 text-xs ${w.kind === "client" ? "text-[var(--accent-text)]" : "text-[var(--dim)]"}`}>
                        {w.kind === "client" ? "Client" : "Demo build"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 flex items-center justify-between gap-4">
              <a href={work.url} target="_blank" rel="noopener noreferrer" className="ak-arrow-link min-w-0">
                <span className="truncate">Visit {work.host}</span>
                <ArrowUpRight size={15} aria-hidden="true" className="shrink-0" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setPlay((n) => n + 1);
                  bringScreenIntoView();
                }}
                aria-label={`Scroll through ${work.name} again`}
                title="Scroll through it again"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--rule-strong)] hover:border-[var(--fg)]"
              >
                <ArrowCounterClockwise size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ViewToggle({ value, onChange }: { value: View; onChange: (v: View) => void }) {
  const options: { v: View; label: string; Icon: typeof Desktop }[] = [
    { v: "desktop", label: "Desktop", Icon: Desktop },
    { v: "phone", label: "Phone", Icon: DeviceMobile },
  ];
  return (
    <div role="group" aria-label="Screen size" className="inline-flex shrink-0 border border-[var(--rule-strong)] p-0.5">
      {options.map(({ v, label, Icon }) => {
        const on = v === value;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(v)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm transition-colors duration-200 ${
              on ? "bg-[var(--fg)] text-[var(--bg)]" : "text-[var(--fg-2)] hover:text-[var(--fg)]"
            }`}
          >
            <Icon size={15} aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A capture inside a screen. Each new `play` value runs the page down once,
 * holds, and brings it back to the top.
 */
function Screen({
  src,
  alt,
  capture,
  screen,
  play,
  className,
}: {
  src: string;
  alt: string;
  capture: { w: number; h: number };
  screen: { w: number; h: number };
  play: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLImageElement>();
  const controls = useRef<ReturnType<typeof animate> | null>(null);
  const running = useRef(false);
  const lastPlay = useRef(0);

  useEffect(() => {
    const el = scope.current;
    if (!el || reduce || play === 0 || play === lastPlay.current) return;
    lastPlay.current = play;
    // Page height in screen units, and how far it has to travel.
    const pageH = (capture.h / capture.w) * screen.w;
    const travel = Math.max(0, ((pageH - screen.h) / pageH) * 100);
    const down = Math.max(5, capture.h / (capture.w > 600 ? 520 : 480));
    const total = down + 1.2 + 1.6;
    controls.current?.stop();
    running.current = true;
    controls.current = animate(
      el,
      { y: ["0%", `-${travel}%`, `-${travel}%`, "0%"] },
      {
        duration: total,
        times: [0, down / total, (down + 1.2) / total, 1],
        ease: [[0.45, 0, 0.35, 1], "linear", [0.65, 0, 0.35, 1]],
        delay: 0.45,
      },
    );
    controls.current.then(() => {
      running.current = false;
    });
    return () => {
      controls.current?.stop();
      running.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, src]);

  return (
    <div
      className={`relative overflow-hidden bg-[#101216] ${className ?? ""}`}
      style={{ aspectRatio: `${screen.w} / ${screen.h}` }}
      onMouseEnter={() => running.current && controls.current?.pause()}
      onMouseLeave={() => running.current && controls.current?.play()}
    >
      {/* Keyed on the file so a new site mounts fresh at the top. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        ref={scope}
        src={src}
        alt={alt}
        width={capture.w}
        height={capture.h}
        className="screen-in block h-auto w-full will-change-transform"
      />
    </div>
  );
}

/** Safari's window bar: traffic lights, back and forward, a centred address. */
function SafariBar({ host }: { host: string }) {
  return (
    <div
      className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b px-3 py-[0.55rem] sm:px-4"
      style={{ background: "var(--mac-chrome)", borderColor: "var(--mac-chrome-rule)" }}
    >
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-[7px]" aria-hidden="true">
          <i className="block h-[11px] w-[11px] rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]" />
          <i className="block h-[11px] w-[11px] rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]" />
          <i className="block h-[11px] w-[11px] rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]" />
        </span>
        <span className="hidden items-center gap-2 sm:flex" style={{ color: "var(--mac-url-fg)" }} aria-hidden="true">
          <CaretLeft size={13} weight="bold" />
          <CaretRight size={13} weight="bold" className="opacity-40" />
        </span>
      </div>
      <div
        className="flex min-w-0 items-center justify-center gap-1.5 rounded-md px-3 py-[3px] text-[0.72rem] sm:w-[22rem] sm:text-[0.76rem]"
        style={{ background: "var(--mac-url)", color: "var(--mac-url-fg)" }}
      >
        <LockSimple size={11} weight="fill" aria-hidden="true" className="shrink-0" />
        <span className="truncate">{host}</span>
      </div>
      <div className="hidden items-center justify-end gap-3 sm:flex" style={{ color: "var(--mac-url-fg)" }} aria-hidden="true">
        <Export size={14} />
        <Plus size={14} />
      </div>
    </div>
  );
}

/**
 * A MacBook, drawn to its proportions: black glass bezel with the camera
 * notch, the Safari window inside, and an aluminium deck a little wider than
 * the lid with the thumb notch cut into its front edge.
 */
function Laptop({ work, play }: { work: Work; play: number }) {
  return (
    <figure className="mx-auto flex w-full flex-col items-center pb-6">
      {/* Lid */}
      <div
        className="relative w-[88%] rounded-t-[clamp(0.9rem,1.9vw,1.5rem)] p-[1.1%] pb-[1.6%] pt-[2.4%]"
        style={{
          background: "#0b0c0e",
          boxShadow: "0 0 0 1px var(--mac-edge), 0 0 0 2px rgba(0,0,0,0.25), var(--shadow)",
        }}
      >
        {/* Camera notch */}
        <span aria-hidden="true" className="absolute left-1/2 top-0 h-[2.1%] min-h-[9px] w-[11%] -translate-x-1/2 rounded-b-[6px] bg-[#0b0c0e]">
          <i className="absolute left-1/2 top-1/2 block h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1c2230] shadow-[inset_0_0_0_1px_#2a3244]" />
        </span>
        <div className="overflow-hidden rounded-[4px]">
          <SafariBar host={work.host} />
          <Screen
            src={workImage(work.slug, "full")}
            alt={`${work.name}: the home page at ${work.host}, on a laptop`}
            capture={{ w: 1200, h: work.fullH }}
            screen={DESKTOP}
            play={play}
          />
        </div>
      </div>

      {/* Deck: hinge line, aluminium body, thumb notch, and the soft shadow
          it casts on the page. */}
      <div aria-hidden="true" className="relative w-full">
        <div className="mx-auto h-[4px] w-[88%]" style={{ background: "linear-gradient(to bottom, #1a1b1e, #3a3c40)" }} />
        <div
          className="relative h-[clamp(0.7rem,1.5vw,1.05rem)] w-full rounded-b-[clamp(0.7rem,1.6vw,1.2rem)]"
          style={{
            background: "linear-gradient(to bottom, var(--mac-body-1) 0%, var(--mac-body-1) 35%, var(--mac-body-2) 100%)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.35) inset, 0 22px 26px -18px rgba(0,0,0,0.55)",
          }}
        >
          <span
            className="absolute left-1/2 top-0 h-[45%] w-[14%] -translate-x-1/2 rounded-b-[8px]"
            style={{ background: "linear-gradient(to bottom, var(--mac-body-2), var(--mac-body-1))", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.25)" }}
          />
        </div>
      </div>
    </figure>
  );
}

/** An iPhone: titanium edge, side buttons, Dynamic Island. */
function Phone({ work, play }: { work: Work; play: number }) {
  return (
    // A stage close to the laptop's shape, so switching views doesn't move
    // the page under the visitor's thumb.
    <div className="flex aspect-[4/5] items-center justify-center bg-[var(--bg-2)] py-6 sm:aspect-[1200/820] sm:py-8">
      <div className="relative h-full">
        {/* Side buttons: action and volume on the left, power on the right */}
        <span aria-hidden="true" className="absolute -left-[3px] top-[17%] h-[4%] w-[3px] rounded-l-sm" style={{ background: "var(--mac-edge)" }} />
        <span aria-hidden="true" className="absolute -left-[3px] top-[25%] h-[8%] w-[3px] rounded-l-sm" style={{ background: "var(--mac-edge)" }} />
        <span aria-hidden="true" className="absolute -left-[3px] top-[35%] h-[8%] w-[3px] rounded-l-sm" style={{ background: "var(--mac-edge)" }} />
        <span aria-hidden="true" className="absolute -right-[3px] top-[27%] h-[12%] w-[3px] rounded-r-sm" style={{ background: "var(--mac-edge)" }} />
        <div
          className="h-full rounded-[clamp(1.9rem,4vw,2.9rem)] p-[9px]"
          style={{ background: "#0b0c0e", boxShadow: "0 0 0 1.5px var(--mac-edge), 0 0 0 3px rgba(0,0,0,0.2), var(--shadow)" }}
        >
          <div className="relative h-full overflow-hidden rounded-[clamp(1.4rem,3.3vw,2.3rem)]" style={{ aspectRatio: `${PHONE.w} / ${PHONE.h}` }}>
            <Screen
              src={workImage(work.slug, "mobile")}
              alt={`${work.name}: the home page at ${work.host}, on a phone`}
              capture={{ w: 390, h: work.mobileH }}
              screen={PHONE}
              play={play}
              className="h-full"
            />
            <span aria-hidden="true" className="absolute left-1/2 top-[1.6%] h-[3.6%] w-[31%] -translate-x-1/2 rounded-full bg-[#0b0c0e]" />
            <span aria-hidden="true" className="absolute bottom-[1.2%] left-1/2 h-[0.55%] w-[36%] -translate-x-1/2 rounded-full bg-[rgba(16,18,22,0.55)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
