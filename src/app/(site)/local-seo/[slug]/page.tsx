import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentMetadata, GuidePage } from "@/components/marketing/templates/guide-page";
import { LOCAL_SEO_GUIDES } from "@/lib/content/local-seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCAL_SEO_GUIDES.map((p) => ({ slug: p.slug }));
}

const find = (slug: string) => LOCAL_SEO_GUIDES.find((p) => p.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = find((await params).slug);
  return page ? contentMetadata(page) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const page = find((await params).slug);
  if (!page) notFound();
  return <GuidePage page={page} parent={{ name: "Local SEO", path: "/local-seo" }} about="Local SEO, Google Business Profile and Google reviews" />;
}
