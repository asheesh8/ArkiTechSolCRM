import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendContactEmail } from "@/lib/email";
import { checkPhone } from "@/lib/phone";
import { CAMPAIGN_SOURCE } from "@/lib/campaign";
import { clientIpFrom, hashIp } from "@/lib/voice-agents";

// Public endpoint behind a paid ad, so it writes straight into the CRM lead
// pipeline. Two cheap guards keep it from becoming a spam funnel: a honeypot
// field no human ever fills, and a short per-IP cooldown.
const COOLDOWN_MS = 45_000;

// Per-instance rather than in the database — a lead table is the wrong place
// for rate-limit state, and a serverless instance living long enough to be
// reused is exactly the case that catches a script hammering the form.
const lastSubmissionByIp = new Map<string, number>();

function pruneCooldowns(now: number) {
  for (const [key, at] of lastSubmissionByIp) {
    if (now - at > COOLDOWN_MS) lastSubmissionByIp.delete(key);
  }
}

const attributionSchema = z.object({
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
  utmContent: z.string().max(120).optional(),
  utmTerm: z.string().max(120).optional(),
  fbclid: z.string().max(120).optional(),
  referrer: z.string().max(120).optional(),
  landedAt: z.string().max(40).optional(),
}).partial();

// Zod reports a missing key as a type error, whose default wording ("expected
// string, received undefined") is no use to someone filling in a form. Messages
// are keyed off the field instead, so every rule on it reads the same way.
const FIELD_MESSAGES: Record<string, string> = {
  name: "Tell us your name.",
  businessName: "Tell us your business name.",
  phone: "A phone number is required so we can call you back.",
  email: "That email address doesn't look right.",
};

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  businessName: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional(),
  bestTime: z.string().trim().max(80).optional(),
  message: z.string().trim().max(2_000).optional(),
  // Hidden field, positioned off-screen. A real visitor never sees it.
  company: z.string().max(200).optional(),
  attribution: attributionSchema.optional(),
});

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = String(issue?.path?.[0] ?? "");
    return NextResponse.json(
      { error: FIELD_MESSAGES[field] ?? "Check the form and try again." },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Bot filled the honeypot. Answer as though it worked so it doesn't retry.
  if (data.company?.trim()) return NextResponse.json({ ok: true });

  const phone = checkPhone(data.phone);
  if (!phone.textable) {
    return NextResponse.json(
      { error: "That phone number doesn't look like a US number." },
      { status: 400 },
    );
  }

  const now = Date.now();
  const ipHash = hashIp(clientIpFrom(req.headers));
  pruneCooldowns(now);

  const previous = lastSubmissionByIp.get(ipHash);
  if (previous && now - previous < COOLDOWN_MS) {
    return NextResponse.json(
      { error: "We already have your request — we'll call you shortly." },
      { status: 429 },
    );
  }
  lastSubmissionByIp.set(ipHash, now);

  const attribution = data.attribution ?? {};
  const attributionRows = [
    attribution.utmSource && `Source: ${attribution.utmSource}`,
    attribution.utmMedium && `Medium: ${attribution.utmMedium}`,
    attribution.utmCampaign && `Campaign: ${attribution.utmCampaign}`,
    attribution.utmContent && `Ad/creative: ${attribution.utmContent}`,
    attribution.utmTerm && `Term: ${attribution.utmTerm}`,
    attribution.fbclid && `Meta click id: ${attribution.fbclid}`,
    attribution.referrer && `Referrer: ${attribution.referrer}`,
  ].filter(Boolean) as string[];

  const note = [
    "— Inbound from the /cleaningbook landing page —",
    `Contact: ${data.name}`,
    `Phone: ${phone.national}`,
    data.email ? `Email: ${data.email}` : null,
    data.city ? `Area: ${data.city}` : null,
    data.bestTime ? `Best time to call: ${data.bestTime}` : null,
    data.message ? `\nWhat they said:\n${data.message}` : null,
    attributionRows.length ? `\nAttribution:\n${attributionRows.join("\n")}` : null,
  ].filter(Boolean).join("\n");

  let leadId: string;
  try {
    const lead = await prisma.lead.create({
      data: {
        businessName: data.businessName,
        category: "Cleaning",
        phone: phone.e164,
        email: data.email || null,
        city: data.city || null,
        // An inbound lead that asked to be called outranks anything scraped.
        status: "NEW",
        priority: "PRIORITY",
        source: CAMPAIGN_SOURCE,
        notes: note,
      },
      select: { id: true },
    });
    leadId = lead.id;
  } catch (error) {
    console.error("[Campaign lead]", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "Something went wrong on our end. Call (802) 310-3749 and we'll sort it out." },
      { status: 500 },
    );
  }

  // The lead is already safe in the CRM — a failed notification must not read
  // as a failed submission to the person who just filled the form.
  try {
    await sendContactEmail({
      fromEmail: data.email || "no-reply@arkitech-sol.com",
      subject: `Ad lead: ${data.businessName}`,
      message: note,
    });
  } catch (error) {
    console.error("[Campaign lead] notification failed:", error instanceof Error ? error.message : "unknown error");
  }

  return NextResponse.json({ ok: true, leadId });
}
