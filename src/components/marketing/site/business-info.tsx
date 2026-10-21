import { SITE } from "@/lib/marketing/site";

/**
 * The facts a visitor looks for before they reach out: who, where, when, how.
 * The same values as the footer and the Google Business Profile, from SITE.
 */
export function BusinessInfo({ id = "contact" }: { id?: string }) {
  const facts: [string, React.ReactNode][] = [
    [
      "Phone",
      <a key="tel" href={SITE.phoneHref} className="figure hover:text-[var(--accent-text)]">
        {SITE.phone}
      </a>,
    ],
    [
      "Email",
      <a key="mail" href={`mailto:${SITE.email}`} className="break-all hover:text-[var(--accent-text)]">
        {SITE.email}
      </a>,
    ],
    ["Hours", SITE.hours],
    ["Studio", SITE.studio],
    ["Clients", SITE.reach],
  ];

  return (
    <section id={id} className="band section-tight scroll-mt-24">
      <div className="shell grid gap-10 border-t border-[var(--rule)] pt-14 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
        <div>
          <h2 className="ak-display h-md">{SITE.name}</h2>
          <p className="mt-3 max-w-[36ch] text-[var(--fg-2)]">
            Based in Burlington, Vermont. We work remotely with businesses anywhere in the US.
          </p>
        </div>
        <dl className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map(([term, value]) => (
            <div key={term}>
              <dt className="text-sm text-[var(--dim)]">{term}</dt>
              <dd className="mt-1.5 text-[1.15rem]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
