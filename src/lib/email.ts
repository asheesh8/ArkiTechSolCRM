import { Resend } from "resend";

const ENABLED = !!process.env.RESEND_API_KEY;
const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");

const FROM = "ArkiTech Solutions <hello@arkitechsol.com>";

async function send(payload: Parameters<typeof resend.emails.send>[0]) {
  if (!ENABLED) {
    console.log("[email stub] would send:", payload.subject, "→", payload.to);
    return { data: null, error: null };
  }
  return resend.emails.send(payload);
}

export async function sendContractEmail(opts: {
  to: string;
  clientName: string;
  planName: string;
  total: number;
  billingCycle: string;
  signUrl: string;
}) {
  return send({
    from: FROM,
    to: opts.to,
    subject: `Your ArkiTech Solutions agreement is ready to sign`,
    html: contractEmailHtml(opts),
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

function contractEmailHtml(opts: { clientName: string; planName: string; total: number; billingCycle: string; signUrl: string }) {
  const cycle = opts.billingCycle.toLowerCase();
  return base(`
<h1>Your agreement is ready</h1>
<p>Hi ${opts.clientName},</p>
<p>We've put together your service agreement for <strong>${opts.planName}</strong>. Please review and sign it at your convenience — it only takes a minute.</p>
<div class="info">
  <p><strong>Plan:</strong> ${opts.planName}</p>
  <p style="margin-top:8px"><strong>Investment:</strong> $${opts.total.toFixed(2)} / ${cycle}</p>
</div>
<a class="btn" href="${opts.signUrl}">Review &amp; Sign Agreement →</a>
<p style="font-size:13px;color:#a1a1aa">This link is unique to you. If you have any questions before signing, just reply to this email.</p>
`);
}

function portalWelcomeHtml(opts: { name: string; businessName: string; setupUrl: string }) {
  return base(`
<h1>Welcome to your client portal 🎉</h1>
<p>Hi ${opts.name},</p>
<p>Your agreement for <strong>${opts.businessName}</strong> is signed and we're ready to get to work. Click below to create your password and access your portal — you'll be able to track your project, submit requests, and pay invoices all in one place.</p>
<a class="btn" href="${opts.setupUrl}">Create my password →</a>
<div class="info">
  <p><strong>Your portal:</strong> arkitechsol.com/login</p>
  <p style="margin-top:8px"><strong>Email:</strong> ${opts.name}</p>
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
