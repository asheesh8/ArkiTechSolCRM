import { NextResponse } from "next/server";
import { z } from "zod";
import { sendBookingRequest, sendContactEmail } from "@/lib/email";
import { sendToCommandCenter } from "@/lib/command-center";
import { BOOKING_BUDGETS, BOOKING_CURRENT_SITE, BOOKING_SERVICES, BOOKING_TIMELINES, CONTACT_CONSENT_TEXT } from "@/lib/marketing/booking";
import { checkPhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";

// The get-started form posts its questionnaire here. The answers go to the
// studio inbox, the Command Center and this app's CRM as a lead, before the
// visitor picks a time, so someone who closes the calendar is still someone
// we can follow up with.

const oneOf = (values: readonly string[]) => z.string().refine((v) => values.includes(v));

const bookingSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(40),
  business: z.string().trim().max(160).optional(),
  services: z.array(oneOf(BOOKING_SERVICES)).min(1).max(BOOKING_SERVICES.length),
  currentSite: oneOf(BOOKING_CURRENT_SITE.map((c) => c.value)),
  timeline: oneOf(BOOKING_TIMELINES.map((t) => t.value)),
  budget: oneOf(BOOKING_BUDGETS.map((b) => b.value)),
  message: z.string().trim().max(4_000).optional(),
  // The box under the form. It has to be ticked, and the text has to be the
  // wording on screen, which is what gets stored as the record.
  consent: z.literal(true),
  consentText: z.literal(CONTACT_CONSENT_TEXT),
  // Hidden field. A person never sees it, so anything in it came from a bot.
  website: z.string().max(200).optional(),
});

// The dialog before the questionnaire, still open in someone's tab mid-deploy.
const plainSchema = z.object({
  name: z.string().trim().max(200).optional(),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(4_000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const booking = bookingSchema.safeParse(body);
  if (!booking.success) {
    const plain = plainSchema.safeParse(body);
    if (!plain.success) return NextResponse.json({ error: "Check the form and try again." }, { status: 400 });
    await sendContactEmail({ fromEmail: plain.data.email, subject: plain.data.name || "New project inquiry", message: plain.data.message });
    return NextResponse.json({ ok: true });
  }

  const data = booking.data;
  if (data.website?.trim()) return NextResponse.json({ ok: true });

  const phone = checkPhone(data.phone);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const note = [
    "Get-started form on sol-arkitech.com",
    `Contact: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${phone?.national ?? data.phone}`,
    `
Looking for: ${data.services.join(", ")}`,
    `Website today: ${data.currentSite}`,
    `Timeline: ${data.timeline}`,
    `Budget: ${data.budget}`,
    data.message ? `
What they said:
${data.message}` : null,
    `
Contact consent: ticked at ${new Date().toISOString()} from IP ${ip}: "${data.consentText}"`,
    "They were shown the booking calendar next, so check for a booked call.",
  ]
    .filter(Boolean)
    .join("\n");

  // Hot means they want it soon and have a budget in mind.
  const hot = ["As soon as possible", "Within a month"].includes(data.timeline) && data.budget !== "Not sure yet";

  // Any one landing is enough: the inbox and the two CRMs back each other up.
  const [mail, lead, command] = await Promise.allSettled([
    sendBookingRequest({
      name: data.name,
      email: data.email,
      phone: phone?.national ?? data.phone,
      business: data.business,
      services: data.services,
      currentSite: data.currentSite,
      timeline: data.timeline,
      budget: data.budget,
      message: data.message,
    }).then((res) => {
      if (res.error) throw new Error(res.error.message);
    }),
    prisma.lead.create({
      data: {
        businessName: data.business || `${data.name} (website enquiry)`,
        category: "Website enquiry",
        email: data.email,
        phone: phone?.e164 ?? data.phone,
        status: "NEW",
        priority: "PRIORITY",
        source: "website-booking",
        notes: note,
      },
      select: { id: true },
    }),
    sendToCommandCenter({
      company: data.business || data.name,
      contact: data.name,
      email: data.email,
      phone: phone?.national ?? data.phone,
      service: data.services.join(", "),
      priority: hot ? "Priority" : "Standard",
      notes: note,
    }),
  ]);

  for (const [label, result] of [["email", mail], ["lead", lead], ["Command Center", command]] as const) {
    if (result.status === "rejected") {
      console.error(`[Booking request] ${label} failed:`, result.reason instanceof Error ? result.reason.message : "unknown error");
    }
  }
  const sentToCommand = command.status === "fulfilled" && command.value.status !== "skipped";
  if (mail.status === "rejected" && lead.status === "rejected" && !sentToCommand) {
    return NextResponse.json({ error: "That didn't send." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
