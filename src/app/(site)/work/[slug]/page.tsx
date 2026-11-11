import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { contentMetadata } from "@/components/marketing/templates/guide-page";
import { CaseStudyPage } from "@/components/marketing/templates/case-study-page";
import { CASE_STUDIES } from "@/lib/content/case-studies";

export const dynamicParams = false;

export function generateStaticParams() {
  return CASE_STUDIES.map((p) => ({ slug: p.slug }));
}

const find = (slug: string) => CASE_STUDIES.find((p) => p.slug === slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = find((await params).slug);
  return page ? contentMetadata(page) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const page = find((await params).slug);
  if (!page) notFound();
  return <CaseStudyPage page={page} />;
}
