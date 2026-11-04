import { ArrowUpRight, Check } from "@phosphor-icons/react/dist/ssr";
import { Closing } from "@/components/marketing/site/closing";
import { ContactButton } from "@/components/marketing/site/contact-context";
import { pageMetadata } from "@/lib/marketing/seo";
import { WORK, workImage } from "@/lib/marketing/work";

export const metadata = {
  ...pageMetadata({
    title: "A Website With the Business Behind It, Done for You | ArkiTech",
    description:
      "Five minutes on what a website should do for your business, and the website, client portal, CRM and automations we build and run for you.",
    path: "/vsl",
  }),
  // Sent one-to-one and from ads; it repeats the home page, so keep it out of search.
  robots: { index: false, follow: true },
};

/** The five-minute walkthrough, hosted on Loom. */
const LOOM_EMBED = "https://www.loom.com/embed/65ebe002c53d4642a8ab37d4214dca02?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true";

const WHAT_YOU_GET = [
  {
    step: "01",
    title: "A custom website",
    body: "Designed for your business, fast on a phone, and written so a visitor knows what you do and how to reach you.",
    items: ["Custom design, not a template", "Quote and contact forms that land in your CRM", "Built to load in under 3 seconds"],
  },
  {
    step: "02",
    title: "Your own client portal",
    body: "One login to see how the business is doing, without digging through five different apps.",
    items: ["Analytics: who visited and where they came from", "Business overview at a glance", "Visibility into every automation"],
  },
  {
    step: "03",
    title: "CRM and automations",
    body: "Every inquiry is tracked from first contact to finished job, and the follow-up runs itself.",
    items: ["Custom CRM and pipeline", "Instant new-lead texts to your phone", "Automatic review requests after each job"],
  },
];

const WHY = [
  { title: "Our own system", body: "Built and owned by us, not a GoHighLevel template. Shaped to how your business actually works." },
  { title: "Setup handled", body: "We build it, connect it and configure it. You log in and use it, no hours of setup." },
  { title: "Edits and support", body: "Need a change? Tell us. Ongoing edits and support are part of it." },
  { title: "Reporting and optimization", body: "We review the numbers with you and keep improving what brings in work." },
];

const SHOWN = ["joe", "elite", "blacksheep"];

/**
 * The VSL page. Ads and meetings booked over the phone link here, and
 * /vsl?name=Jose greets them by name. It runs in the order the video does:
 * why a website matters, what we build, the proof, why us, then the booking.
 * Every "book a call" opens the same get-started form as the rest of the site,
 * so the lead lands in the CRM before they pick a time.
 */
export default async function VslPage({ searchParams }: { searchParams: Promise<{ name?: string | string[] }> }) {
  const raw = (await searchParams).name;
  const name = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 40);
  const work = SHOWN.map((slug) => WORK.find((w) => w.slug === slug)!).filter(Boolean);

  return (
    <>
      <section className="band-night pb-16 pt-[calc(var(--nav-h)+2.5rem)] sm:pb-24 sm:pt-[calc(var(--nav-h)+4rem)]">
        <div className="shell max-w-[64rem] text-center">
          <p className="meta uppercase">{name ? `${name}, here's how it all works` : "Watch: 5 minutes"}</p>
          <h1 className="ak-display h-xl mx-auto mt-5 max-w-[20ch]">
            A beautiful website. A connected business behind it. <em>All done for you.</em>
          </h1>
          <div className="mt-10 overflow-hidden rounded-xl border border-[var(--rule)] bg-black shadow-[var(--shadow)]">
            <div className="relative aspect-[17/10]">
              <iframe
                src={LOOM_EMBED}
                title="Why your business needs a website in 2026"
                allow="fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
          <div className="mt-9 flex flex-col items-center gap-3">
            <ContactButton className="ak-btn ak-btn-primary">Book a call</ContactButton>
            <p className="text-sm text-[var(--dim)]">30 minutes. No obligation.</p>
          </div>
        </div>
      </section>

      <section className="band section">
        <div className="shell">
          <p className="meta uppercase">01 / Why your website matters</p>
          <h2 className="ak-display h-lg mt-4 max-w-[22ch]">Your website is part of your sales process.</h2>
          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
            <ul className="grid content-start border-t border-[var(--rule)]">
              {[
                ["Builds trust", "People check you out before they call. Show your services and your work."],
                ["Captures inquiries 24/7", "Quote requests come in after hours, while you're on a job."],
                ["Shows what works", "See what brings people in, so you know where to spend on marketing."],
              ].map(([t, b]) => (
                <li key={t} className="border-b border-[var(--rule)] py-5">
                  <p className="font-medium">{t}</p>
                  <p className="body-dim mt-1">{b}</p>
                </li>
              ))}
            </ul>
            <div className="rounded-xl bg-[var(--bg-2)] p-8 sm:p-10">
              <p className="price text-[clamp(3rem,6vw,4.5rem)] leading-none">$24,000</p>
              <p className="mt-2 text-[var(--fg-2)]">a year, from just two extra customers a month</p>
              <p className="ak-mono mt-6 text-sm text-[var(--dim)]">2 customers × $1,000 × 12 months</p>
              <p className="mt-6 border-t border-[var(--rule)] pt-5 text-sm text-[var(--dim)]">
                Hypothetical example. Your customer value and results will differ.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="band-2 section">
        <div className="shell">
          <p className="meta uppercase">02 / What you get</p>
          <h2 className="ak-display h-lg mt-4 max-w-[22ch]">The whole setup, connected.</h2>
          <ol className="mt-12 grid gap-6 lg:grid-cols-3">
            {WHAT_YOU_GET.map((s) => (
              <li key={s.step} className="flex flex-col rounded-xl border border-[var(--rule)] bg-[var(--surface)] p-7">
                <span className="ak-mono text-sm text-[var(--accent-text)]">{s.step}</span>
                <h3 className="ak-display h-sm mt-3">{s.title}</h3>
                <p className="body-dim mt-3">{s.body}</p>
                <ul className="mt-6 grid gap-3 border-t border-[var(--rule)] pt-5">
                  {s.items.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[0.97rem]">
                      <Check size={16} className="mt-1 shrink-0 text-[var(--accent-text)]" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band section">
        <div className="shell">
          <p className="meta uppercase">03 / The work and the results</p>
          <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end lg:gap-16">
            <h2 className="ak-display h-lg max-w-[16ch]">Real sites for real businesses.</h2>
            <div className="border-l-2 border-[var(--accent)] pl-6">
              <p className="price text-[clamp(2.6rem,5vw,3.8rem)] leading-none">8 estimates</p>
              <p className="mt-3 text-[var(--fg-2)]">
                booked last month through CallJoe&apos;s new website.
              </p>
            </div>
          </div>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {work.map((w) => (
              <li key={w.slug}>
                <a href={w.url} target="_blank" rel="noopener noreferrer" className="group block">
                  <div className="overflow-hidden rounded-lg border border-[var(--rule)] shadow-[var(--shadow)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={workImage(w.slug, "cover")}
                      alt={`${w.name} website`}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                  <p className="mt-4 flex items-baseline justify-between gap-3">
                    <span className="font-medium group-hover:text-[var(--accent-text)]">{w.name}</span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm text-[var(--dim)]">
                      {w.host} <ArrowUpRight size={13} aria-hidden="true" />
                    </span>
                  </p>
                  <p className="text-sm text-[var(--dim)]">{w.what}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band-2 section">
        <div className="shell">
          <p className="meta uppercase">04 / Why ArkiTech</p>
          <h2 className="ak-display h-lg mt-4 max-w-[20ch]">Built for your business. Handled by our team.</h2>
          <ul className="mt-12 grid gap-x-12 border-t border-[var(--rule)] sm:grid-cols-2">
            {WHY.map((w) => (
              <li key={w.title} className="border-b border-[var(--rule)] py-6">
                <p className="font-medium">{w.title}</p>
                <p className="body-dim mt-1.5">{w.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Closing
        title="Let's map the right setup for your business."
        body="Answer a few quick questions, then pick a time. You get a working system and the people who keep improving it."
      />
    </>
  );
}
