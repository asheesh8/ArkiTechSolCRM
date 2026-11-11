import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentMetadata } from "@/components/marketing/templates/guide-page";
import { ComparePage } from "@/components/marketing/templates/compare-page";
import { COMPARISONS } from "@/lib/content/compare";

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARISONS.map((p) => ({ slug: p.slug }));
}

const find = (slug: string) => COMPARISONS.find((p) => p.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = find((await params).slug);
  return page ? contentMetadata(page) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const page = find((await params).slug);
  if (!page) notFound();
  return <ComparePage page={page} />;
}
