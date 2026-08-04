import "server-only";

import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

// A public demo link is an open door to paid voice minutes, so each agent has
// its own ceiling and every caller IP has a much tighter one.
export const DEMO_LIMIT_PER_AGENT_PER_DAY = 50;
export const DEMO_LIMIT_PER_IP_PER_HOUR = 3;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Slugs are the public demo URL, so they must be unique and stable. Collisions
// get a numeric suffix rather than silently overwriting another agent's link.
export async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "agent";

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? root : `${root}-${attempt + 1}`;
    const clash = await prisma.voiceAgent.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!clash || clash.id === excludeId) return candidate;
  }

  return `${root}-${Date.now().toString(36)}`;
}

// Demo callers are anonymous prospects — hash the IP so the rate-limit ledger
// never stores a raw address.
export function hashIp(ip: string) {
  const salt = process.env.DEMO_IP_SALT ?? process.env.ELEVENLABS_WEBHOOK_SECRET ?? "arkitech-demo";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function clientIpFrom(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export type DemoRateVerdict =
  | { allowed: true }
  | { allowed: false; reason: string };

export async function checkDemoRateLimit(agentId: string, ipHash: string): Promise<DemoRateVerdict> {
  const now = Date.now();
  const [agentToday, ipThisHour] = await Promise.all([
    prisma.voiceDemoSession.count({
      where: { agentId, createdAt: { gte: new Date(now - 24 * 60 * 60 * 1_000) } },
    }),
    prisma.voiceDemoSession.count({
      where: { ipHash, createdAt: { gte: new Date(now - 60 * 60 * 1_000) } },
    }),
  ]);

  if (ipThisHour >= DEMO_LIMIT_PER_IP_PER_HOUR) {
    return { allowed: false, reason: "You've reached the demo limit for now. Try again in an hour." };
  }
  if (agentToday >= DEMO_LIMIT_PER_AGENT_PER_DAY) {
    return { allowed: false, reason: "This demo has hit today's limit. Please check back tomorrow." };
  }

  return { allowed: true };
}

export function publicAgentFields(agent: {
  slug: string;
  name: string;
  demoHeadline: string | null;
  demoSubheadline: string | null;
  demoBusiness: string | null;
}) {
  return {
    slug: agent.slug,
    name: agent.name,
    headline: agent.demoHeadline ?? `Talk to ${agent.name}`,
    subheadline: agent.demoSubheadline
      ?? "Ask about hours, pricing, or book an appointment — the same conversation your customers would have.",
    business: agent.demoBusiness,
  };
}
