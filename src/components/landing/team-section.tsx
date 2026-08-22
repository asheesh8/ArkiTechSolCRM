"use client";

import { Reveal } from "./reveal";
import { TeamFlag, type Country } from "./flags";

const TEAM = [
  {
    name: "Ashish Subedi",
    role: "CEO & Fullstack Designer",
    bio: "The architect behind every build. Ashish handles product vision, engineering, and design — making sure every site is fast, beautiful, and built to convert.",
    initials: "AS",
    country: "nepal" as Country,
    tags: ["Fullstack Dev", "UI/UX", "Product"],
  },
  {
    name: "Teibiroa Ambo",
    role: "Director of Client Relations",
    bio: "Tei is the voice of ArkiTech — building trust with every call, nurturing long-term client relationships, and making sure every business we work with feels like a priority.",
    initials: "TA",
    country: "kiribati" as Country,
    tags: ["Client Success", "Sales", "Relations", "Consultant"],
  },
] as const;

/**
 * The team, set as a masthead rather than a card grid.
 *
 * The initials were gradient-filled rounded squares with a coloured drop
 * shadow; they are now just large condensed type on a rule, which is both
 * quieter and considerably harder to mistake for a template.
 */
export function TeamSection() {
  return (
    <section id="team" className="band-raised site-section">
      <div className="site-shell">
        <Reveal>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">The team</p>
              <h2 className="d2 max-w-[15ch]">Built by people who actually give a dang.</h2>
            </div>
            <p className="lede lg:max-w-[30ch] lg:text-right">
              A focused leadership team with a network built to scale around each engagement.
            </p>
          </div>
        </Reveal>

        <div className="ledger mt-16">
          {TEAM.map((person, i) => (
            <Reveal key={person.name} delay={i * 110}>
              <article
                className="grid gap-x-10 gap-y-6 border-b py-10 sm:grid-cols-[auto_1fr] sm:py-14"
                style={{ borderColor: "var(--rule)" }}
              >
                <div className="flex items-start gap-5 sm:w-52 sm:flex-col sm:gap-3">
                  {/* Home flag behind the initials — the one place on the site
                      that carries colour outside the palette, which is the
                      point of it. */}
                  {/* The display size lives on the wrapper, not the letters:
                      the flag is sized in `em`, so it has to resolve against
                      the same font-size the initials are set at. */}
                  <span
                    className="relative inline-flex isolate"
                    style={{ fontSize: "clamp(3.5rem, 6vw, 5.5rem)" }}
                  >
                    <TeamFlag country={person.country} />
                    <span
                      className="relative leading-[0.8]"
                      style={{ fontStretch: "76%", fontWeight: 680, letterSpacing: "-0.06em" }}
                    >
                      {person.initials}
                    </span>
                  </span>
                  <span className="figure-index relative sm:mt-1">{String(i + 1).padStart(2, "0")}</span>
                </div>

                <div>
                  <h3 className="d3">{person.name}</h3>
                  <p className="mono mt-2.5" style={{ color: "var(--violet-lift)" }}>{person.role}</p>

                  <p className="mt-6 max-w-[54ch]" style={{ color: "var(--dim)", lineHeight: 1.7 }}>
                    {person.bio}
                  </p>

                  <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
                    {person.tags.map((tag) => (
                      <li key={tag} className="mono" style={{ color: "var(--dim)", fontSize: "0.62rem" }}>
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
