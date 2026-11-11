import { loadPlans, GROUPS } from "@/lib/marketing/plans";
import { money, plansIn, tidy, type Plan } from "@/lib/marketing/plan-display";
import { OFFER_TERMS } from "@/lib/marketing/offers";
import { indexableRoutes, type SiteRoute } from "@/lib/marketing/routes";
import { SITE_URL } from "@/lib/marketing/seo";
import { AREA_SERVED, PEOPLE, SAME_AS, SITE } from "@/lib/marketing/site";
import { WORK } from "@/lib/marketing/work";
import { services } from "@/lib/services-content";

/**
 * /llms.txt (llmstxt.org): the site in plain Markdown for AI assistants, so a
 * question like "how much does ArkiTech charge" gets the real answer. Every
 * fact comes from the same source as the page that shows it: facts from
 * site.ts, prices from the pricing table, pages from the route registry.
 */

// Same cadence as /pricing, which owners edit from CRM settings.
export const revalidate = 300;

function price(p: Plan) {
  const note = p.priceNote ? ` (${tidy(p.priceNote)})` : "";
  if (p.onceCents != null && p.monthlyCents != null) return `${money(p.onceCents)} build, plus ${money(p.monthlyCents)} a month${note}`;
  if (p.monthlyCents != null) return `${money(p.monthlyCents)} a month${note}`;
  if (p.onceCents != null) return `${money(p.onceCents)} one time${note}`;
  return p.priceNote ? tidy(p.priceNote) : "See the pricing page";
}

function planLines(p: Plan) {
  const t = OFFER_TERMS[p.slug] ?? {};
  return [
    `- **${p.name}**: ${price(p)}. ${tidy(p.blurb)}`,
    ...p.features.map((f) => `  - ${tidy(f)}`),
    // Hosting and ownership are already in the plan's features; only the exclusions are added.
    ...(t.notIncluded?.length ? [`  - Not included: ${t.notIncluded.join("; ")}`] : []),
  ];
}

const SECTIONS: { key: SiteRoute["section"]; label: string }[] = [
  { key: "main", label: "Main pages" },
  { key: "services", label: "Services" },
  { key: "aeo-geo", label: "AEO & GEO guides" },
  { key: "local-seo", label: "Local SEO guides" },
  { key: "areas", label: "Service areas" },
  { key: "work", label: "Case studies" },
  { key: "industries", label: "Industries" },
  { key: "compare", label: "Comparisons" },
  { key: "guides", label: "Guides" },
  { key: "blog", label: "Blog" },
  { key: "legal", label: "Legal" },
];

export async function GET() {
  const plans = await loadPlans();
  const url = (path: string) => `${SITE_URL}${path}`;
  const routes = indexableRoutes();
  const towns = AREA_SERVED.towns.map((t) => t.name).join(", ");

  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.name} (${SITE.legalName}) is a two-person web design studio in ${SITE.studio}. We build fast custom websites, manage Google Business Profiles and reviews, build business dashboards and CRM, and build AEO (answer engine optimization) and GEO (generative engine optimization) websites meant to be found and cited by answer engines. We serve ${towns} and the rest of ${AREA_SERVED.state}, and work remotely with clients anywhere in the US.`,
    "",
    `- Website: ${SITE_URL}`,
    `- Phone: ${SITE.phone}`,
    `- Email: ${SITE.email}`,
    `- Hours: ${SITE.hours} (Eastern)`,
    `- Location: ${SITE.locality.city}, ${SITE.locality.regionName}`,
    ...PEOPLE.map((p) => `- ${p.name}: ${p.jobTitle}, from ${p.from}`),
    ...(SAME_AS.length ? [`- Profiles: ${SAME_AS.join(", ")}`] : []),
    "",
    "## Plans and pricing",
    "",
    `Full table: ${url("/pricing")}`,
    "",
    ...GROUPS.flatMap((g) => {
      const rows = plansIn(plans, g.key);
      if (rows.length === 0) return [];
      return [
        `### ${g.label}`,
        "",
        ...(g.key === "plans" ? rows.flatMap(planLines) : rows.map((p) => `- ${p.name}: ${price(p)}. ${tidy(p.blurb)}`)),
        "",
      ];
    }),
    "We don't promise that any business will appear in ChatGPT or other AI answers; nobody can.",
    "",
    "## Services",
    "",
    ...services.map((s) => `- [${s.name}](${url(`/services/${s.slug}`)}): ${s.summary}`),
    "",
    "## Service area",
    "",
    `Primary: ${towns}, and the State of ${AREA_SERVED.state}. Secondary: ${AREA_SERVED.remote.toLowerCase()}.`,
    "",
    "## Client work",
    "",
    ...WORK.filter((w) => w.kind === "client").map((w) => `- [${w.name}](${w.url}): ${w.what}${w.where ? `, ${w.where}` : ""}`),
    "",
    ...SECTIONS.flatMap(({ key, label }) => {
      const rows = routes.filter((r) => r.section === key && key !== "services");
      if (rows.length === 0) return [];
      return [`## ${label}`, "", ...rows.map((r) => `- [${r.title}](${url(r.path || "/")})`), ""];
    }),
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
