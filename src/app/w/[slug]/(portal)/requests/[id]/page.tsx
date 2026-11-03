import { requireModule } from "@/lib/tenant/context";
import { RequestDetailPage } from "@/modules/fulfillment/server";

export default async function Page({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  await requireModule(slug, "requests");
  return <RequestDetailPage requestId={id} />;
}
