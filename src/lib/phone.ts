// US phone-number normalization + format validation for cold-text outreach.
// No external API — pure format checks (digit count, area/exchange rules).

export type PhoneCheck = {
  raw: string;
  /** E.164 form, e.g. "+18025550192" — only set when textable. */
  e164: string | null;
  /** Pretty national form, e.g. "(802) 555-0192". */
  national: string | null;
  /** OK to text. true for "valid" and "suspicious"; false for "invalid". */
  textable: boolean;
  status: "valid" | "suspicious" | "invalid";
  /** Human-readable note shown in the UI. */
  reason: string;
};

function digitsOnly(value: string) {
  return value.replace(/\D+/g, "");
}

/**
 * Normalize and validate a raw US phone string.
 * Accepts things like "(802) 555-0192", "1-802-555-0192", "+1 802 555 0192".
 */
export function checkPhone(raw: string | null | undefined): PhoneCheck {
  const input = (raw ?? "").trim();

  if (!input) {
    return { raw: input, e164: null, national: null, textable: false, status: "invalid", reason: "No phone number" };
  }

  let digits = digitsOnly(input);

  // Strip a leading US country code if present.
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }

  if (digits.length !== 10) {
    return {
      raw: input,
      e164: null,
      national: null,
      textable: false,
      status: "invalid",
      reason: digits.length < 10 ? "Too few digits" : "Too many digits",
    };
  }

  const area = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  const line = digits.slice(6);

  // NANP rules: area & exchange codes must start 2–9.
  if (area[0] === "0" || area[0] === "1" || exchange[0] === "0" || exchange[0] === "1") {
    return { raw: input, e164: null, national: null, textable: false, status: "invalid", reason: "Invalid area/exchange code" };
  }

  const national = `(${area}) ${exchange}-${line}`;
  const e164 = `+1${digits}`;

  // 555-01XX is the reserved fictional/test block. Flag but still allow texting.
  if (exchange === "555" && line.startsWith("01")) {
    return { raw: input, e164, national, textable: true, status: "suspicious", reason: "Reserved test number (555-01XX)" };
  }

  return { raw: input, e164, national, textable: true, status: "valid", reason: "Looks valid" };
}

/**
 * Fill {name}, {business}, {city}, {state} tokens in a message template.
 * Unknown tokens are left as-is; missing values collapse to a sensible fallback.
 */
export function fillTemplate(template: string, lead: { businessName?: string | null; city?: string | null; state?: string | null }) {
  const business = lead.businessName?.trim() || "there";
  return template
    .replace(/\{business\}/gi, business)
    .replace(/\{name\}/gi, business)
    .replace(/\{city\}/gi, lead.city?.trim() || "your area")
    .replace(/\{state\}/gi, lead.state?.trim() || "");
}

/**
 * Build a cross-platform sms: deep link that pre-fills the message body.
 * The "?&body=" form is understood by both modern iOS and Android.
 */
export function smsLink(e164: string, body: string) {
  return `sms:${e164}?&body=${encodeURIComponent(body)}`;
}
