import { CONTENT_PAGES } from "@/lib/content/registry";
import { faqGroups } from "@/lib/marketing/faq";
import { loadPlans } from "@/lib/marketing/plans";
import { SITE_URL } from "@/lib/marketing/seo";
import { SITE } from "@/lib/marketing/site";

/**
 * /llms-full.txt: the FAQ answers and each published guide's quick answer, in
 * plain Markdown, from the same data the pages render. /llms.txt is the
 * short version.
 */

// Same cadence as /pricing, since the money answers quote live prices.
export const revalidate = 300;

const plain = (text: string) => text.replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1");

export async function GET() {
  const groups = faqGroups(await loadPlans());
  const pages = CONTENT_PAGES.filter((c) => !c.page.noindex);

  const lines = [
    `# ${SITE.name}: answers in full`,
    "",
    `> The questions customers ask ${SITE.name} most, answered, plus the short answer from each guide. Summary: ${SITE_URL}/llms.txt`,
    "",
    ...groups.flatMap((g) => [`## ${g.heading}`, "", ...g.items.flatMap((i) => [`### ${i.q}`, "", i.a, ""])]),
    "## Guides and local pages",
    "",
    ...pages.flatMap(({ page }) => [`### [${page.h1}](${SITE_URL}${page.path})`, "", plain(page.quickAnswer), ""]),
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
