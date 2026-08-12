import type { CampaignAttribution } from "@/lib/campaign";

const DEFAULT_ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/28475263/46j723m/";
const DEFAULT_TIMEOUT_MS = 5_000;

type CleaningBookLeadForm = {
  formIntent: "gate" | "booking";
  name: string;
  businessName?: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  bestTime?: string;
  message?: string;
  currentSituation?: string;
  onlinePresence?: string;
  investmentRange?: string;
  startTimeline?: string;
  callConsent: true;
  callConsentText?: string;
  attribution?: CampaignAttribution;
};

type CleaningBookLeadPhone = {
  e164: string | null;
  national: string | null;
  textable?: boolean;
  status?: string;
  reason?: string;
};

function clean(value: string | null | undefined) {
  return value?.trim() || "";
}

function bool(value: boolean | undefined) {
  return value ? "true" : "false";
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

export function buildCleaningBookZapierPayload({
  data,
  businessName,
  category,
  phone,
  leadId,
  submittedAt,
  source,
  callConsentText,
}: {
  data: CleaningBookLeadForm;
  businessName: string;
  category: string;
  phone: CleaningBookLeadPhone;
  leadId: string;
  submittedAt: string;
  source: string;
  callConsentText: string;
}) {
  const attribution = data.attribution ?? {};

  return {
    event: "cleaningbook_lead_submitted",
    page: "/cleaningbook",
    submitted_at: submittedAt,
    lead_id: leadId,
    lead_form_intent: data.formIntent,
    lead_name: clean(data.name),
    lead_first_name: firstName(data.name),
    lead_business_name: clean(businessName),
    lead_phone: clean(data.phone),
    lead_phone_e164: clean(phone.e164 || data.phone),
    lead_phone_national: clean(phone.national || data.phone),
    lead_phone_valid: bool(phone.textable),
    lead_phone_status: clean(phone.status),
    lead_phone_validation_reason: clean(phone.reason),
    lead_email: clean(data.email),
    lead_city: clean(data.city),
    lead_state: clean(data.state),
    lead_current_situation: clean(data.currentSituation),
    lead_online_presence: clean(data.onlinePresence),
    lead_investment_range: clean(data.investmentRange),
    lead_start_timeline: clean(data.startTimeline),
    lead_best_time: clean(data.bestTime),
    lead_category: clean(category),
    lead_status: "NEW",
    lead_priority: "PRIORITY",
    lead_source: source,
    lead_call_consent: bool(data.callConsent),
    lead_call_consent_at: data.callConsent ? submittedAt : "",
    lead_call_consent_text: clean(callConsentText),
    attribution_utm_source: clean(attribution.utmSource),
    attribution_utm_medium: clean(attribution.utmMedium),
    attribution_utm_campaign: clean(attribution.utmCampaign),
    attribution_utm_content: clean(attribution.utmContent),
    attribution_utm_term: clean(attribution.utmTerm),
    attribution_fbclid: clean(attribution.fbclid),
    attribution_referrer: clean(attribution.referrer),
    attribution_landed_at: clean(attribution.landedAt),
  };
}

export async function sendCleaningBookZapierLead(
  payload: Record<string, unknown>,
  {
    webhookUrl = DEFAULT_ZAPIER_WEBHOOK_URL,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  }: {
    webhookUrl?: string;
    timeoutMs?: number;
  } = {},
) {
  const url = webhookUrl.trim();
  if (!url) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Zapier responded ${response.status}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}
