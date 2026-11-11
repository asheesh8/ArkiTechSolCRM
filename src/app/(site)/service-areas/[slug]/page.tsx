import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentMetadata } from "@/components/marketing/templates/guide-page";
import { TownPage } from "@/components/marketing/templates/town-page";
import { TOWNS } from "@/lib/content/towns";
import { loadPlans } from "@/lib/marketing/plans";

// Plans are read from the database, like /pricing.
export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return TOWNS.map((p) => ({ slug: p.slug }));
}

const find = (slug: string) => TOWNS.find((p) => p.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = find((await params).slug);
  return page ? contentMetadata(page) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const page = find((await params).slug);
  if (!page) notFound();
  return <TownPage page={page} plans={await loadPlans()} />;
}
