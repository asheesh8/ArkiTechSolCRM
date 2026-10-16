import { Resend } from "resend";
import { SITE } from "@/lib/marketing/site";

const ENABLED = !!process.env.RESEND_API_KEY;
const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");

// studio@ is the one address for everything: it sends, it receives the replies,
// and it is where every enquiry lands. RESEND_FROM only overrides the sender.
const STUDIO_INBOX = SITE.email;
const rawFrom = process.env.RESEND_FROM ?? STUDIO_INBOX;
const FROM = rawFrom.includes("@") && !rawFrom.includes("<")
  ? `ArkiTech Solutions <${rawFrom}>`
  : rawFrom;

async function send(payload: Parameters<typeof resend.emails.send>[0]) {
  if (!ENABLED) {
    console.log("[email stub] would send:", payload.subject, "→", payload.to);
    return { data: null, error: null };
  }
  // A client replying to an invoice or an agreement reaches the studio inbox,
  // whichever address the mail went out from.
  return resend.emails.send({ ...payload, replyTo: payload.replyTo ?? STUDIO_INBOX });
}

export async function sendContactEmail(opts: { fromEmail: string; subject: string; message: string }) {
  return send({
    from: FROM,
    to: STUDIO_INBOX,
    replyTo: opts.fromEmail,
    subject: `[ArkiTech] ${opts.subject}`,
    html: base(`
<h1>New project inquiry</h1>
<div class="info">
  <p><strong>From:</strong> ${opts.fromEmail}</p>
  <p style="margin-top:8px"><strong>Subject:</strong> ${opts.subject}</p>
</div>
<p style="white-space:pre-wrap">${opts.message.replace(/</g, "&lt;")}</p>
`),
  });
}

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** "Book a free call": the questionnaire answers, to the studio inbox. */
export async function sendBookingRequest(opts: {
  name: string;
  email: string;
  phone?: string;
  business?: string;
  services: string[];
  timeline: string;
  budget: string;
  message?: string;
}) {
  const rows: Array<[string, string | undefined]> = [
    ["Looking for", opts.services.join(", ")],
    ["Timeline", opts.timeline],
    ["Budget", opts.budget],
    ["Business", opts.business],
    ["Email", opts.email],
    ["Phone", opts.phone],
  ];
  return send({
    from: FROM,
    to: STUDIO_INBOX,
    replyTo: opts.email,
    subject: `[ArkiTech] Free call: ${opts.name} (${opts.services.join(", ")}, ${opts.timeline.toLowerCase()})`,
    html: base(`
<h1>Free call request</h1>
<p>${esc(opts.name)} answered the booking questions on the site. If a calendar invite follows, it comes from the booking page; reply here to reach them directly.</p>
<div class="info">
${rows.filter(([, v]) => v).map(([k, v], i) => `  <p${i ? ' style="margin-top:8px"' : ""}><strong>${k}:</strong> ${esc(v!)}</p>`).join("\n")}
</div>
${opts.message ? `<p style="white-space:pre-wrap">${esc(opts.message)}</p>` : ""}
`),
  });
}

/** The "Get a callback" widget. No email address, so replies can't go to them. */
export async function sendCallbackRequest(opts: { name: string; phone: string; message?: string }) {
  return send({
    from: FROM,
    to: STUDIO_INBOX,
    subject: `[ArkiTech] Callback: ${opts.name}, ${opts.phone}`,
    html: base(`
<h1>Callback request</h1>
<p>${esc(opts.name)} asked to be called back. It is in the CRM as a priority lead.</p>
<div class="info">
  <p><strong>Phone:</strong> ${esc(opts.phone)}</p>
</div>
${opts.message ? `<p style="white-space:pre-wrap">${esc(opts.message)}</p>` : ""}
`),
  });
}

export async function sendContractEmail(opts: {
  to: string;
  clientName: string;
  planName: string;
  total: number;
  billingCycle: string;
  signUrl: string;
  correction?: boolean;
}) {
  return send({
    from: FROM,
    to: opts.to,
    subject: opts.correction
      ? `Corrected agreement — please use this one instead`
      : `Your ArkiTech Solutions agreement is ready to sign`,
    html: contractEmailHtml(opts),
  });
}

export async function sendWorkComplete(opts: { to: string; clientName: string; businessName: string; requestTitle: string; portalUrl: string }) {
  return send({
    from: FROM,
    to: opts.to,
    subject: `Your request is done — ${opts.requestTitle}`,
    html: base(`
<h1>Your request is complete ✓</h1>
<p>Hi ${opts.clientName},</p>
<p>We've finished working on your request. Here's what was completed:</p>
<div class="info">
  <p><strong>${opts.requestTitle}</strong></p>
  <p style="margin-top:8px;color:#71717a">${opts.businessName}</p>
</div>
<a class="btn" href="${opts.portalUrl}">View in your portal →</a>
<p style="font-size:13px;color:#a1a1aa">If you have any questions or need any changes, you can submit a new request from your portal anytime.</p>
`),
  });
}

export async function sendPortalWelcome(opts: { to: string; name: string; businessName: string; setupUrl: string }) {
  return send({
    from: FROM,
    to: opts.to,
    subject: "Welcome to ArkiTech — create your portal password",
    html: portalWelcomeHtml(opts),
  });
}

export async function sendInvoiceReminder(opts: {
  to: string;
  clientName: string;
  amount: number;
  dueDate: string;
  payUrl: string;
  daysUntilDue: number;
}) {
  return send({
    from: FROM,
    to: opts.to,
    subject: `Payment reminder: $${opts.amount.toFixed(2)} due ${opts.daysUntilDue <= 0 ? "today" : `in ${opts.daysUntilDue} day${opts.daysUntilDue === 1 ? "" : "s"}`}`,
    html: invoiceReminderHtml(opts),
  });
}

export async function sendPaymentConfirmation(opts: {
  to: string;
  clientName: string;
  amount: number;
  description: string;
}) {
  return send({
    from: FROM,
    to: opts.to,
    subject: `Payment confirmed — thank you!`,
    html: paymentConfirmHtml(opts),
  });
}

// ─── HTML templates ──────────────────────────────────────────────────────────

function base(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#f4f4f5;margin:0;padding:32px 16px}
.card{background:#fff;border-radius:12px;max-width:560px;margin:0 auto;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.logo{font-size:20px;font-weight:700;color:#18181b;margin-bottom:32px}
.logo span{color:#6366f1}
h1{font-size:22px;font-weight:700;color:#18181b;margin:0 0 8px}
p{color:#52525b;font-size:15px;line-height:1.6;margin:0 0 16px}
.btn{display:inline-block;background:#6366f1;color:#fff!important;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600;font-size:15px;margin:8px 0 24px}
.info{background:#f4f4f5;border-radius:8px;padding:16px;margin-bottom:20px}
.info p{margin:0;font-size:14px;color:#3f3f46}
.info strong{color:#18181b}
.footer{font-size:12px;color:#a1a1aa;margin-top:32px;padding-top:24px;border-top:1px solid #e4e4e7}
</style></head><body><div class="card">
<div class="logo">Arki<span>Tech</span> Solutions</div>
${body}
<div class="footer">ArkiTech Solutions &bull; Burlington, VT &bull; You received this because you are a client or prospect.</div>
</div></body></html>`;
}

function contractEmailHtml(opts: { clientName: string; planName: string; total: number; billingCycle: string; signUrl: string; correction?: boolean }) {
  const cycle = opts.billingCycle.toLowerCase();
  return base(`
<h1>${opts.correction ? "Corrected agreement" : "Your agreement is ready"}</h1>
<p>Hi ${opts.clientName},</p>
${opts.correction ? `<div class="info" style="border-left:3px solid #f59e0b;background:#fffbeb">
  <p><strong>Quick correction:</strong> I accidentally sent the wrong agreement in my previous email. Please disregard that one and use this most recent email instead.</p>
</div>` : ""}
<p>${opts.correction ? "Here's the correct" : "We've put together your"} service agreement for <strong>${opts.planName}</strong>. Please review and sign it at your convenience — it only takes a minute.</p>
<div class="info">
  <p><strong>Plan:</strong> ${opts.planName}</p>
  <p style="margin-top:8px"><strong>Investment:</strong> $${opts.total.toFixed(2)} / ${cycle}</p>
</div>
<a class="btn" href="${opts.signUrl}">Review &amp; Sign Agreement →</a>
<p style="font-size:13px;color:#a1a1aa">This link is unique to you. If you have any questions before signing, just reply to this email.</p>
`);
}

function portalWelcomeHtml(opts: { to: string; name: string; businessName: string; setupUrl: string }) {
  return base(`
<h1>Welcome to your client portal 🎉</h1>
<p>Hi ${opts.name},</p>
<p>Your agreement for <strong>${opts.businessName}</strong> is signed and we're ready to get to work. Click below to create your password and access your portal — you'll be able to track your project, submit requests, and pay invoices all in one place.</p>
<a class="btn" href="${opts.setupUrl}">Create my password →</a>
<div class="info">
  <p><strong>Your portal:</strong> sol-arkitech.com/portal/login</p>
  <p style="margin-top:8px"><strong>Email:</strong> ${opts.to}</p>
</div>
<p style="font-size:13px;color:#a1a1aa">This setup link expires in 72 hours. If you have trouble, just reply to this email.</p>
`);
}

function invoiceReminderHtml(opts: { clientName: string; amount: number; dueDate: string; payUrl: string; daysUntilDue: number }) {
  const urgency = opts.daysUntilDue <= 0 ? "due today" : opts.daysUntilDue === 1 ? "due tomorrow" : `due in ${opts.daysUntilDue} days`;
  return base(`
<h1>Payment reminder</h1>
<p>Hi ${opts.clientName},</p>
<p>This is a friendly reminder that your monthly payment is <strong>${urgency}</strong>.</p>
<div class="info">
  <p><strong>Amount due:</strong> $${opts.amount.toFixed(2)}</p>
  <p style="margin-top:8px"><strong>Due date:</strong> ${opts.dueDate}</p>
</div>
<a class="btn" href="${opts.payUrl}">Pay now →</a>
<p style="font-size:13px;color:#a1a1aa">You can also view your invoice history in your client portal.</p>
`);
}

function paymentConfirmHtml(opts: { clientName: string; amount: number; description: string }) {
  return base(`
<h1>Payment confirmed ✓</h1>
<p>Hi ${opts.clientName},</p>
<p>We've received your payment — thank you!</p>
<div class="info">
  <p><strong>Amount:</strong> $${opts.amount.toFixed(2)}</p>
  <p style="margin-top:8px"><strong>Description:</strong> ${opts.description}</p>
</div>
<p>Your receipt is in your client portal. We appreciate your business and are hard at work on your project.</p>
`);
}

/**
 * The missed-call breakdown, emailed to whoever ran the numbers.
 *
 * Deliberately reports back exactly the figures they set rather than a generic
 * brochure — the whole reason they handed over an address is that the number
 * they saw was about their business, not ours.
 */
export async function sendMissedCallReport(opts: {
  to: string;
  name: string;
  missedPerWeek: number;
  averageJob: string;
  closeRate: number;
  weekly: string;
  monthly: string;
  yearly: string;
}) {
  return send({
    from: FROM,
    to: opts.to,
    subject: `${opts.name}, here's what those missed calls add up to`,
    html: base(`
<h1>${opts.weekly} a week</h1>
<p>You ran the numbers on our site. Here they are again, so you have them.</p>
<div class="info">
  <p><strong>Calls missed a week:</strong> ${opts.missedPerWeek}</p>
  <p style="margin-top:8px"><strong>Average job value:</strong> ${opts.averageJob}</p>
  <p style="margin-top:8px"><strong>Share who'd have booked:</strong> ${opts.closeRate}%</p>
</div>
<div class="info">
  <p><strong>Every week:</strong> ${opts.weekly}</p>
  <p style="margin-top:8px"><strong>Every month:</strong> ${opts.monthly}</p>
  <p style="margin-top:8px"><strong>Every year:</strong> ${opts.yearly}</p>
</div>
<p>These are your figures, not ours — change any of them and the shape holds. The point is that
the loss doesn't arrive as a bill. It arrives as a slightly quieter month.</p>
<p>If you want to talk about answering those calls, reply here or ring
<strong>(802) 557-8828</strong>. Twenty minutes, no obligation, and we'll tell you if we're not the
right fit.</p>
<p>— Ashish, ArkiTech Solutions</p>
`),
  });
}
