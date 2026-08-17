import { NextResponse } from "next/server";
import { z } from "zod";
import { CALLBACK_CONSENT_TEXT } from "@/lib/callback-consent";
import { checkPhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";

// Callback requests from the widget on the main site.
//
// This is also the opt-in an A2P 10DLC reviewer is pointed at, which shapes
// what gets stored: the exact consent sentence shown on screen and the moment
// it was accepted, kept on the lead itself. "They ticked a box" is not an
// answer if a carrier ever asks; the wording they ticked is.

const COOLDOWN_MS = 60_000;
const lastSubmissionByIp = new Map<string, number>();

function pruneCooldowns(now: number) {
  for (const [key, at] of lastSubmissionByIp) {
    if (now - at > COOLDOWN_MS) lastSubmissionByIp.delete(key);
  }
}

function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40),
  message: z.string().trim().max(2_000).optional(),
  // Literal true rather than boolean: an unchecked box is a rejected submission,
  // not a submission with consent set to false.
  smsConsent: z.literal(true),
  consentText: z.string().trim().max(600).optional(),
  // Hidden field positioned off-screen. A real visitor never sees it.
  company: z.string().max(200).optional(),
});

const FIELD_MESSAGES: Record<string, string> = {
  name: "Tell us your name.",
  phone: "A phone number is required so we can call you back.",
  smsConsent: "Please agree to be contacted before submitting.",
};

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path?.[0] ?? "");
    return NextResponse.json({ error: FIELD_MESSAGES[field] ?? "Check the form and try again." }, { status: 400 });
  }

  const data = parsed.data;

  // Bot filled the honeypot. Answer as though it worked so it doesn't retry.
  if (data.company?.trim()) return NextResponse.json({ ok: true });

  const phone = checkPhone(data.phone);
  if (!phone.textable || !phone.e164) {
    return NextResponse.json({ error: "That doesn't look like a US phone number." }, { status: 400 });
  }

  const now = Date.now();
  pruneCooldowns(now);
  const key = clientIp(request.headers);
  const previous = lastSubmissionByIp.get(key);
  if (previous && now - previous < COOLDOWN_MS) {
    return NextResponse.json({ error: "We already have your request — we'll be in touch shortly." }, { status: 429 });
  }
  lastSubmissionByIp.set(key, now);

  const submittedAt = new Date(now).toISOString();
  const note = [
    "— Callback request from the arkitech-sol.com widget —",
    `Contact: ${data.name}`,
    `Phone: ${phone.national}`,
    data.message ? `\nWhat they said:\n${data.message}` : null,
    `\nConsent:\nPhone and SMS contact accepted at ${submittedAt}\n${data.consentText?.trim() || CALLBACK_CONSENT_TEXT}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await prisma.lead.create({
      data: {
        businessName: `${data.name} — callback request`,
        category: "Website enquiry",
        phone: phone.e164,
        // Someone who asked to be called outranks anything scraped.
        status: "NEW",
        priority: "PRIORITY",
        source: "website-widget",
        notes: note,
      },
      select: { id: true },
    });
  } catch (error) {
    console.error("[Callback request]", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "Something went wrong on our end. Call (802) 310-3749 and we'll sort it out." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
