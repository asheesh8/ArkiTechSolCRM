import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentMetadata, GuidePage } from "@/components/marketing/templates/guide-page";
import { GUIDES } from "@/lib/content/guides";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((p) => ({ slug: p.slug }));
}

const find = (slug: string) => GUIDES.find((p) => p.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = find((await params).slug);
  return page ? contentMetadata(page) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const page = find((await params).slug);
  if (!page) notFound();
  return <GuidePage page={page} parent={{ name: "Blog", path: "/blog" }} about="Small business websites in Vermont" />;
}
