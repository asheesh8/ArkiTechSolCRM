import { RequestDetailPage } from "@/modules/fulfillment/server";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestDetailPage requestId={id} />;
}
