/**
 * Wording the client agrees to when authorizing text-message registration.
 * The exact text shown is stored with the signature, so a later wording
 * change never rewrites what someone agreed to.
 */
export const CONSENT_VERSION = "2026-11-03";

export function consentText(legalName: string) {
  return `I authorize ArkiTech Solutions to register ${legalName || "my business"} for business text messaging with US carriers through Twilio, and to send review requests to my customers on our behalf. I confirm the business details and sample messages above are accurate, that every customer on our list gave permission to receive texts from us, and that we will honour STOP requests. I understand registration is reviewed by carriers, can take one to four weeks, and may be rejected.`;
}

export const USE_CASES = [
  { value: "CUSTOMER_CARE", label: "Customer care", hint: "Review requests and follow-ups after a visit or job." },
  { value: "MIXED", label: "Mixed", hint: "Reviews plus appointment reminders and occasional offers." },
  { value: "MARKETING", label: "Marketing", hint: "Promotions and offers. Stricter review; opt-in must be clear." },
] as const;

export const ENTITY_TYPES = ["LLC", "Corporation", "Partnership", "Non-profit", "Sole proprietor"] as const;

export function defaultSampleMessage(businessName: string) {
  return `Hi {first_name}, thanks for choosing ${businessName || "us"}! Would you leave us a quick review? {link} Reply STOP to opt out.`;
}
