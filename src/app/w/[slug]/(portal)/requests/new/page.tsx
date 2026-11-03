import { requireModule } from "@/lib/tenant/context";
import { ClientNewRequestPage } from "@/modules/fulfillment/server";

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ type?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  await requireModule(slug, "requests");
  return <ClientNewRequestPage workspaceSlug={slug} type={sp.type} />;
}
