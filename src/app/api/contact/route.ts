import { NextResponse } from "next/server";
import { z } from "zod";
import { sendBookingRequest, sendContactEmail } from "@/lib/email";
import { BOOKING_BUDGETS, BOOKING_SERVICES, BOOKING_TIMELINES } from "@/lib/marketing/booking";
import { checkPhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";

// "Book a free call" posts its questionnaire here. The answers go to the
// studio inbox and into the CRM as a lead, before the visitor picks a time,
// so someone who closes the calendar is still someone we can follow up with.

const oneOf = (values: readonly string[]) => z.string().refine((v) => values.includes(v));

const bookingSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional(),
  business: z.string().trim().max(160).optional(),
  services: z.array(oneOf(BOOKING_SERVICES)).min(1).max(BOOKING_SERVICES.length),
  timeline: oneOf(BOOKING_TIMELINES.map((t) => t.value)),
  budget: oneOf(BOOKING_BUDGETS.map((b) => b.value)),
  message: z.string().trim().max(4_000).optional(),
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

  const phone = data.phone ? checkPhone(data.phone) : null;
  const note = [
    "— Free call request from sol-arkitech.com —",
    `Contact: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${phone?.national ?? data.phone}` : null,
    `\nLooking for: ${data.services.join(", ")}`,
    `Timeline: ${data.timeline}`,
    `Budget: ${data.budget}`,
    data.message ? `\nWhat they said:\n${data.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // Either one landing is enough: the inbox and the CRM back each other up.
  const [mail, lead] = await Promise.allSettled([
    sendBookingRequest({
      name: data.name,
      email: data.email,
      phone: phone?.national ?? data.phone,
      business: data.business,
      services: data.services,
      timeline: data.timeline,
      budget: data.budget,
      message: data.message,
    }).then((res) => {
      if (res.error) throw new Error(res.error.message);
    }),
    prisma.lead.create({
      data: {
        businessName: data.business || `${data.name} — free call request`,
        category: "Website enquiry",
        email: data.email,
        phone: phone?.e164 ?? (data.phone || null),
        status: "NEW",
        priority: "PRIORITY",
        source: "website-booking",
        notes: note,
      },
      select: { id: true },
    }),
  ]);

  for (const [label, result] of [["email", mail], ["lead", lead]] as const) {
    if (result.status === "rejected") {
      console.error(`[Booking request] ${label} failed:`, result.reason instanceof Error ? result.reason.message : "unknown error");
    }
  }
  if (mail.status === "rejected" && lead.status === "rejected") {
    return NextResponse.json({ error: "That didn't send." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
