import { Reveal } from "@/components/marketing/site/reveal";
import { TeamFlag, type Country } from "./flags";

const TEAM: {
  name: string;
  role: string;
  bio: string;
  initials: string;
  country: Country;
  tags: string[];
}[] = [
  {
    name: "Ashish Subedi",
    role: "CEO & Fullstack Designer",
    bio: "The architect behind every build. Ashish handles product vision, engineering, and design, making sure every site is fast, beautiful, and built to convert.",
    initials: "AS",
    country: "nepal",
    tags: ["Fullstack Dev", "UI/UX", "Product"],
  },
  {
    name: "Teibiroa Ambo",
    role: "CEO & Director of Client Relations",
    bio: "Tei is the voice of ArkiTech: building trust with every call, nurturing long-term client relationships, and making sure every business we work with feels like a priority.",
    initials: "TA",
    country: "kiribati",
    tags: ["Client Success", "Sales", "Relations", "Consultant"],
  },
];

/** Initials in the display face with each owner's home flag behind them. */
export function Team() {
  return (
    <section id="team" className="band section">
      <div className="shell">
        <div className="max-w-3xl">
          <h2 className="ak-display h-xl">Built by people who actually give a dang.</h2>
          <p className="ak-lede mt-6 max-w-[48ch]">
            A focused leadership team with a network built to scale around each engagement.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {TEAM.map((p, i) => (
            <Reveal key={p.name} delay={i * 110} as="article" className="border border-[var(--rule)] p-8 sm:p-10">
              <div className="flex items-center justify-between gap-6">
                <span className="relative isolate inline-flex" style={{ fontSize: "clamp(4.2rem, 7vw, 6rem)" }}>
                  <TeamFlag country={p.country} />
                  <span className="ak-display relative leading-[0.85] tracking-[-0.02em]">{p.initials}</span>
                </span>
              </div>
              <h3 className="ak-display mt-10 text-[2rem] leading-none">{p.name}</h3>
              <p className="mt-2 font-medium text-[var(--accent-text)]">{p.role}</p>
              <p className="mt-6 max-w-[50ch] leading-relaxed text-[var(--fg-2)]">{p.bio}</p>
              <ul className="mt-7 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <li key={t} className="border border-[var(--rule)] px-2.5 py-1 text-xs text-[var(--dim)]">
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
