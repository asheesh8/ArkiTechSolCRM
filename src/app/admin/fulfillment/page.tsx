import { TeamBoardPage } from "@/modules/fulfillment/server";

export default async function Page({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const sp = await searchParams;
  return <TeamBoardPage view={sp.view === "list" ? "list" : "board"} />;
}
