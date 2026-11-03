import { getTenant } from "@/lib/tenant/context";
import { OverviewPage } from "@/modules/overview/page";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getTenant(slug);
  return <OverviewPage tenant={tenant} />;
}
