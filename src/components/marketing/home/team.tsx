import { Reveal } from "@/components/marketing/site/reveal";
import { TeamFlag, type Country } from "./flags";

/**
 * The founders, told as stories rather than cards. Each `story` paragraph is
 * something the founder has said about themselves; add to it, but never fill
 * it with anything they haven't.
 */
const FOUNDERS: {
  name: string;
  role: string;
  from: string;
  initials: string;
  country: Country;
  story: string[];
  does: string[];
  /** Direct line. The site's main number (SITE.phone) is Terri's. */
  phone: string;
  phoneHref: string;
}[] = [
  {
    name: "Ashish Subedi",
    role: "CEO & Fullstack Designer",
    from: "From Nepal",
    initials: "AS",
    country: "nepal",
    story: [
      "Ashish grew up in Nepal and came to Burlington to study at Champlain College.",
      "Ashish is the architect behind every build: product vision, engineering and design. Every site, dashboard and page we ship is built by Ashish, start to finish, with no agency layer and no junior handed the project after you sign.",
    ],
    does: ["Design", "Engineering", "Product"],
    phone: "(802) 310-3749",
    phoneHref: "tel:+18023103749",
  },
  {
    name: "Terri Ambo",
    role: "CEO & Director of Client Relations",
    from: "From Kiribati",
    initials: "TA",
    country: "kiribati",
    story: [
      "Terri is from Kiribati, an island nation in the middle of the Pacific.",
      "Terri is the voice of ArkiTech: building trust with every call, looking after every client long after launch, and making sure every business we work with feels like a priority. Call the main line and it's Terri who picks up.",
    ],
    does: ["Client success", "Sales", "Strategy"],
    phone: "(802) 557-8828",
    phoneHref: "tel:+18025578828",
  },
];

/** One founder per row, alternating sides, initials over each home flag. */
export function Team() {
  return (
    <section id="team" className="band pb-24 sm:pb-32">
      <div className="shell grid gap-6">
        {FOUNDERS.map((p, i) => (
          <Reveal
            key={p.name}
            as="article"
            className="grid gap-10 border border-[var(--rule)] bg-[var(--bg)] p-8 sm:p-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
          >
            <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
              <span className="relative isolate inline-flex" style={{ fontSize: "clamp(5rem, 10vw, 8.5rem)" }}>
                <TeamFlag country={p.country} />
                <span className="ak-display relative leading-[0.85] tracking-[-0.02em]">{p.initials}</span>
              </span>
              <p className="meta mt-10 uppercase tracking-[0.16em]">{p.from}</p>
              <h2 className="ak-display mt-3 text-[2.4rem] leading-none">{p.name}</h2>
              <p className="mt-2 font-medium text-[var(--accent-text)]">{p.role}</p>
              <a href={p.phoneHref} className="figure mt-4 inline-block text-[var(--fg-2)] hover:text-[var(--fg)]">
                {p.phone}
              </a>
            </div>
            <div className="flex flex-col justify-center">
              <div className="grid gap-5 text-[1.08rem] leading-relaxed text-[var(--fg-2)]">
                {p.story.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
              <ul className="mt-8 flex flex-wrap gap-2">
                {p.does.map((t) => (
                  <li key={t} className="border border-[var(--rule)] px-2.5 py-1 text-xs text-[var(--dim)]">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
