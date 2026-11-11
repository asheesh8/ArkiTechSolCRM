import { HubPage } from "@/components/marketing/templates/hub-page";
import { TOWNS } from "@/lib/content/towns";
import { pageMetadata } from "@/lib/marketing/seo";
import { AREA_SERVED } from "@/lib/marketing/site";

export const metadata = pageMetadata({
  title: "Service Areas: Chittenden County, VT Web Design | ArkiTech",
  description:
    "ArkiTech Solutions builds websites for businesses in Burlington, South Burlington, Winooski, Essex and across Chittenden County, Vermont, and works remotely.",
  path: "/service-areas",
});

export default function ServiceAreasHub() {
  const towns = AREA_SERVED.towns.map((t) => t.name);
  return (
    <HubPage
      path="/service-areas"
      name="Service areas"
      kicker="Service areas · Chittenden County, Vermont"
      title="Where we work."
      lede={`ArkiTech Solutions is based in Essex Junction and builds websites for businesses across Chittenden County and Vermont: ${towns.slice(0, -1).join(", ")} and ${towns[towns.length - 1]}. We also work remotely with businesses anywhere in the US. Each town page below covers what local businesses there need from a website.`}
      items={TOWNS.filter((t) => !t.noindex).map((t) => ({ href: t.path, title: t.h1, summary: t.description }))}
      related={[
        { href: "/work", label: "Client work across Vermont" },
        { href: "/pricing", label: "Plans and pricing" },
      ]}
    />
  );
}
