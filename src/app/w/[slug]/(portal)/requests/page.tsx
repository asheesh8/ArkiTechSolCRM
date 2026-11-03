import { requireModule } from "@/lib/tenant/context";
import { ClientRequestsPage } from "@/modules/fulfillment/server";

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ show?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  await requireModule(slug, "requests");
  return <ClientRequestsPage workspaceSlug={slug} filter={sp.show === "closed" ? "closed" : "open"} />;
}
