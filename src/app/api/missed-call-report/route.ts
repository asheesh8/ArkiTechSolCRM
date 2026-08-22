import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendMissedCallReport } from "@/lib/email";

// Emails someone their own missed-call figures, and files them as a lead.
//
// The trade is explicit on the form: they get the breakdown, we get an address
// and the numbers they picked. Those numbers are the useful part — a lead that
// arrives already saying "eight calls a week, $450 a job" is worth more than a
// contact form that says "interested in websites".

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

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(200),
  business: z.string().trim().max(160).optional(),
  // Mirrors the slider bounds on the calculator.
  missedPerWeek: z.number().int().min(1).max(40),
  averageJob: z.number().int().min(300).max(4_000),
  closeRate: z.number().int().min(5).max(90),
  // Hidden field positioned off-screen. A real visitor never sees it.
  company: z.string().max(200).optional(),
});

const FIELD_MESSAGES: Record<string, string> = {
  name: "Tell us your name.",
  email: "We need a valid email to send the breakdown to.",
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

  const now = Date.now();
  pruneCooldowns(now);
  const key = clientIp(request.headers);
  const previous = lastSubmissionByIp.get(key);
  if (previous && now - previous < COOLDOWN_MS) {
    return NextResponse.json({ error: "That's on its way — check your inbox in a minute." }, { status: 429 });
  }
  lastSubmissionByIp.set(key, now);

  // Same arithmetic as the calculator and the blog post. Weeks per month is
  // 4.345 so "8 a week" doesn't quietly become 32.
  const weekly = data.missedPerWeek * data.averageJob * (data.closeRate / 100);
  const monthly = weekly * 4.345;
  const yearly = monthly * 12;

  const note = [
    "— Missed-call calculator, arkitech-sol.com —",
    `Contact: ${data.name}`,
    `Email: ${data.email}`,
    data.business ? `Business: ${data.business}` : null,
    "",
    "Their own numbers:",
    `  Missed calls a week: ${data.missedPerWeek}`,
    `  Average job value:   ${currency.format(data.averageJob)}`,
    `  Would have booked:   ${data.closeRate}%`,
    "",
    `Estimated loss: ${currency.format(weekly)}/week · ${currency.format(monthly)}/month · ${currency.format(yearly)}/year`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    await prisma.lead.create({
      data: {
        businessName: data.business?.trim() || `${data.name} — missed-call calculator`,
        category: "AI receptionist enquiry",
        email: data.email,
        status: "NEW",
        // They did the arithmetic on their own losses. That is a warm lead.
        priority: "PRIORITY",
        source: "missed-call-calculator",
        notes: note,
      },
      select: { id: true },
    });
  } catch (error) {
    console.error("[Missed-call report]", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "Something went wrong on our end. Call (802) 310-3749 and we'll sort it out." },
      { status: 500 },
    );
  }

  // The lead is saved, so a mail failure must not read as a failed submission.
  try {
    await sendMissedCallReport({
      to: data.email,
      name: data.name.split(/\s+/)[0],
      missedPerWeek: data.missedPerWeek,
      averageJob: currency.format(data.averageJob),
      closeRate: data.closeRate,
      weekly: currency.format(weekly),
      monthly: currency.format(monthly),
      yearly: currency.format(yearly),
    });
  } catch (error) {
    console.error("[Missed-call report email]", error instanceof Error ? error.message : "unknown error");
  }

  return NextResponse.json({ ok: true });
}
