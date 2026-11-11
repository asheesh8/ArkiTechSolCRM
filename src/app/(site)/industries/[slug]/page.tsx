import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentMetadata } from "@/components/marketing/templates/guide-page";
import { IndustryPage } from "@/components/marketing/templates/industry-page";
import { INDUSTRIES } from "@/lib/content/industries";
import { loadPlans } from "@/lib/marketing/plans";

// Plans are read from the database, like /pricing.
export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return INDUSTRIES.map((p) => ({ slug: p.slug }));
}

const find = (slug: string) => INDUSTRIES.find((p) => p.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = find((await params).slug);
  return page ? contentMetadata(page) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const page = find((await params).slug);
  if (!page) notFound();
  return <IndustryPage page={page} plans={await loadPlans()} />;
}
