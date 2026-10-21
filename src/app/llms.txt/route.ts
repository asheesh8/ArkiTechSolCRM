import { loadPlans, GROUPS } from "@/lib/marketing/plans";
import { money, plansIn, tidy, type Plan } from "@/lib/marketing/plan-display";
import { SITE_URL } from "@/lib/marketing/seo";
import { SITE } from "@/lib/marketing/site";
import { WORK } from "@/lib/marketing/work";
import { services, servicesWithPosts } from "@/lib/services-content";

/**
 * /llms.txt (llmstxt.org): the site in plain Markdown for AI assistants, so a
 * question like "how much does ArkiTech charge" gets the real answer. Every
 * fact comes from the same source as the page that shows it — prices from the
 * pricing table, services from services-content — so it can't drift.
 */

// Same cadence as /pricing, which owners edit from CRM settings.
export const revalidate = 300;

function price(p: Plan) {
  const note = p.priceNote ? ` (${tidy(p.priceNote)})` : "";
  if (p.onceCents != null && p.monthlyCents != null) return `${money(p.onceCents)} to build, plus ${money(p.monthlyCents)} a month${note}`;
  if (p.monthlyCents != null) return `${money(p.monthlyCents)} a month${note}`;
  if (p.onceCents != null) return `${money(p.onceCents)} one time${note}`;
  return p.priceNote ? tidy(p.priceNote) : "See the pricing page";
}

export async function GET() {
  const plans = await loadPlans();
  const url = (path: string) => `${SITE_URL}${path}`;

  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.name} is a two-person web and software studio in ${SITE.studio}. We build custom websites, business dashboards and CRM, and AI search optimization, and offer a year-long Growth Partnership (website, Google Business Profile management and 30 review requests a month). We work remotely with businesses anywhere in the US.`,
    "",
    `- Phone: ${SITE.phone}`,
    `- Email: ${SITE.email}`,
    `- Hours: ${SITE.hours}`,
    `- Clients: ${SITE.reach} (the studio is in ${SITE.studio}; the work is remote)`,
    "- People: Ashish Subedi (CEO & Fullstack Designer, builds every site) and Terri Ambo (CEO & Director of Client Relations)",
    "- The Growth Partnership is a 12-month partnership. The Custom Website is a one-time fee; its monthly plan is optional and can be cancelled anytime. AI Search Optimization is a one-time build.",
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
    "## Client work",
    "",
    ...WORK.filter((w) => w.kind === "client").map((w) => `- [${w.name}](${w.url}): ${w.what}${w.where ? `, ${w.where}` : ""}`),
    "",
    "## More",
    "",
    `- [About and contact](${url("/about")})`,
    `- [FAQ](${url("/faq")})`,
    ...servicesWithPosts.map((s) => `- [${s.post.title}](${url(`/blog/${s.post.slug}`)}): ${s.post.excerpt}`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
