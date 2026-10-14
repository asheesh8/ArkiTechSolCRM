import { loadPlans, GROUPS } from "@/lib/marketing/plans";
import { money, plansIn, tidy, type Plan } from "@/lib/marketing/plan-display";
import { SITE_URL } from "@/lib/marketing/seo";
import { SITE } from "@/lib/marketing/site";
import { WORK } from "@/lib/marketing/work";
import { services } from "@/lib/services-content";
import { SERVICE_AREAS } from "@/lib/service-areas";

/**
 * /llms.txt (llmstxt.org): the site in plain Markdown for AI assistants, so a
 * question like "how much does ArkiTech charge" gets the real answer. Every
 * fact comes from the same source as the page that shows it — prices from the
 * pricing table, services from services-content — so it can't drift.
 */

// Same cadence as /pricing, which owners edit from CRM settings.
export const revalidate = 300;

function price(p: Plan) {
  if (p.onceCents != null && p.monthlyCents != null) return `${money(p.onceCents)} to build, then ${money(p.monthlyCents)} a month`;
  if (p.monthlyCents != null) return `${money(p.monthlyCents)} a month`;
  if (p.onceCents != null) return `${money(p.onceCents)} one time`;
  return p.priceNote ? tidy(p.priceNote) : "Quoted in writing to scope";
}

export async function GET() {
  const plans = await loadPlans();
  const url = (path: string) => `${SITE_URL}${path}`;

  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.name} is a two-person web and software studio in ${SITE.studio}. We build websites, AI phone receptionists, automations, custom CRMs and client portals, and run local SEO for small and growing businesses, mostly in Vermont.`,
    "",
    `- Phone: ${SITE.phone}`,
    `- Email: ${SITE.email}`,
    `- Hours: ${SITE.hours}`,
    "- People: Ashish Subedi (CEO & Fullstack Designer, builds every site) and Teibiroa Ambo (CEO & Director of Client Relations)",
    "- Recurring plans are month to month. Project work is quoted in writing before it starts. Clients own their domain, code and content.",
    "",
    "## Services",
    "",
    ...services.map((s) => `- [${s.name}](${url(`/services/${s.slug}`)}): ${s.summary}`),
    "",
    "## Pricing",
    "",
    `Full table: ${url("/pricing")}`,
    "",
    ...GROUPS.flatMap((g) => {
      const rows = plansIn(plans, g.key);
      if (rows.length === 0) return [];
      return [`### ${g.label}`, "", ...rows.map((p) => `- ${p.name}: ${price(p)}`), ""];
    }),
    "## Service areas",
    "",
    ...SERVICE_AREAS.map((a) => `- [${a.town}, Vermont](${url(`/service-areas/${a.slug}`)}): ${a.short}`),
    "",
    "## Client work",
    "",
    ...WORK.filter((w) => w.kind === "client").map((w) => `- [${w.name}](${w.url}): ${w.what}${w.where ? `, ${w.where}` : ""}`),
    "",
    "## More",
    "",
    `- [About](${url("/about")})`,
    `- [Contact](${url("/contact")})`,
    `- [FAQ](${url("/faq")})`,
    ...services.map((s) => `- [${s.post.title}](${url(`/blog/${s.post.slug}`)}): ${s.post.excerpt}`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
