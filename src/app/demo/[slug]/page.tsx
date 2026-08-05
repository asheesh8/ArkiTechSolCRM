import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { publicAgentFields } from "@/lib/voice-agents";
import { DemoClient } from "./demo-client";

async function findDemoAgent(slug: string) {
  const agent = await prisma.voiceAgent.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      provider: true,
      demoEnabled: true,
      isArchived: true,
      demoHeadline: true,
      demoSubheadline: true,
      demoBusiness: true,
    },
  });

  if (!agent || !agent.demoEnabled || agent.isArchived) return null;
  return publicAgentFields(agent);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const agent = await findDemoAgent(slug);
  if (!agent) return { title: "Demo unavailable" };

  return {
    title: `${agent.headline} — ArkiTech Solutions`,
    description: agent.subheadline,
    // A demo link is shared one-to-one with a prospect, not indexed.
    robots: { index: false, follow: false },
  };
}

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = await findDemoAgent(slug);
  if (!agent) notFound();

  return <DemoClient agent={agent} />;
}
