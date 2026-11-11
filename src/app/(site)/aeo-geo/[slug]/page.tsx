import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentMetadata, GuidePage } from "@/components/marketing/templates/guide-page";
import { AEO_GEO_GUIDES } from "@/lib/content/aeo-geo";

export const dynamicParams = false;

export function generateStaticParams() {
  return AEO_GEO_GUIDES.map((p) => ({ slug: p.slug }));
}

const find = (slug: string) => AEO_GEO_GUIDES.find((p) => p.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = find((await params).slug);
  return page ? contentMetadata(page) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const page = find((await params).slug);
  if (!page) notFound();
  return <GuidePage page={page} parent={{ name: "AEO & GEO", path: "/aeo-geo" }} about="Answer engine optimization (AEO) and generative engine optimization (GEO)" />;
}
