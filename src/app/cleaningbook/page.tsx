import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CampaignClient, type CampaignAgent } from "./campaign-client";

// The agent this campaign shows off. If it's ever unpublished the page falls
// back to any other live demo rather than losing its centrepiece.
//
// Joey runs on ElevenLabs' voice with an OpenAI model as its brain. The
// speech-to-speech alternative lives on as `joe-the-cleaner` so the two can be
// compared side by side.
const PREFERRED_DEMO_SLUG = "joey";

// Nothing on this page reads a dynamic API, so Next would otherwise prerender
// it and bake in whichever agent was published at build time — unpublishing the
// demo from the Agents page would then need a redeploy to take effect.
export const dynamic = "force-dynamic";

// Anything that isn't a known transport falls back to ElevenLabs, which is what
// every pre-migration row holds.
function toCampaignAgent(agent: { slug: string; name: string; provider: string }): CampaignAgent {
  return {
    slug: agent.slug,
    name: agent.name,
    provider: agent.provider === "openai" ? "openai" : "elevenlabs",
  };
}

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
  const select = { slug: true, name: true, provider: true } as const;

  try {
    const preferred = await prisma.voiceAgent.findFirst({
      where: { slug: PREFERRED_DEMO_SLUG, demoEnabled: true, isArchived: false },
      select,
    });
    if (preferred) return toCampaignAgent(preferred);

    const fallback = await prisma.voiceAgent.findFirst({
      where: { demoEnabled: true, isArchived: false },
      orderBy: { createdAt: "asc" },
      select,
    });
    return fallback ? toCampaignAgent(fallback) : null;
  } catch (error) {
    // This page is behind ad spend — a database hiccup must degrade to the
    // scripted example call, never to an error page.
    console.error("[CleaningBook]", error instanceof Error ? error.message : "unknown error");
    return null;
  }
}

export default async function CleaningBookPage() {
  const agent = await findDemoAgent();
  return <CampaignClient agent={agent} />;
}
