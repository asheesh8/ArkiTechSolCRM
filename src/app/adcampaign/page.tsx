import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CampaignClient, type CampaignAgent } from "./campaign-client";

// The agent this campaign shows off. If it's ever unpublished the page falls
// back to any other live demo rather than losing its centrepiece.
const PREFERRED_DEMO_SLUG = "joe-the-cleaner";

// Nothing on this page reads a dynamic API, so Next would otherwise prerender
// it and bake in whichever agent was published at build time — unpublishing the
// demo from the Agents page would then need a redeploy to take effect.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Never miss another cleaning job — ArkiTech Solutions",
  description:
    "A voice AI agent answers your calls, quotes the job, and books it on your calendar while you work. Try it live on this page.",
  // A paid landing page shouldn't compete with the main site in search results.
  robots: { index: false, follow: false },
  openGraph: {
    title: "Missed calls = missed cleaning jobs",
    description:
      "Let a voice AI agent answer, qualify, and book appointments while you work. Talk to it yourself on this page.",
    type: "website",
  },
};

async function findDemoAgent(): Promise<CampaignAgent> {
  try {
    const preferred = await prisma.voiceAgent.findFirst({
      where: { slug: PREFERRED_DEMO_SLUG, demoEnabled: true, isArchived: false },
      select: { slug: true, name: true },
    });
    if (preferred) return preferred;

    return await prisma.voiceAgent.findFirst({
      where: { demoEnabled: true, isArchived: false },
      orderBy: { createdAt: "asc" },
      select: { slug: true, name: true },
    });
  } catch (error) {
    // This page is behind ad spend — a database hiccup must degrade to the
    // scripted example call, never to an error page.
    console.error("[Ad campaign]", error instanceof Error ? error.message : "unknown error");
    return null;
  }
}

export default async function AdCampaignPage() {
  const agent = await findDemoAgent();
  return <CampaignClient agent={agent} />;
}
