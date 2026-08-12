import type { CampaignAttribution } from "@/lib/campaign";

const DEFAULT_ZAPIER_WEBHOOK_URL =
  process.env.CLEANINGBOOK_ZAPIER_WEBHOOK_URL?.trim() || "https://hooks.zapier.com/hooks/catch/28475263/46j723m/";
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
  attribution?: CampaignAttribution;
};

type CleaningBookLeadPhone = {
  e164: string | null;
  national: string | null;
};

export function buildCleaningBookZapierPayload({
  data,
  businessName,
  category,
  phone,
  leadId,
  note,
  submittedAt,
  source,
}: {
  data: CleaningBookLeadForm;
  businessName: string;
  category: string;
  phone: CleaningBookLeadPhone;
  leadId: string;
  note: string;
  submittedAt: string;
  source: string;
}) {
  const attribution = data.attribution ?? {};

  return {
    event: "cleaningbook_lead_submitted",
    page: "/cleaningbook",
    submittedAt,
    leadId,
    formIntent: data.formIntent,
    name: data.name,
    businessName,
    phone: data.phone,
    phoneE164: phone.e164 || data.phone,
    phoneNational: phone.national || data.phone,
    email: data.email || "",
    city: data.city || "",
    state: data.state || "",
    bestTime: data.bestTime || "",
    message: data.message || "",
    currentSituation: data.currentSituation || "",
    onlinePresence: data.onlinePresence || "",
    investmentRange: data.investmentRange || "",
    startTimeline: data.startTimeline || "",
    category,
    status: "NEW",
    priority: "PRIORITY",
    source,
    note,
    attributionUtmSource: attribution.utmSource || "",
    attributionUtmMedium: attribution.utmMedium || "",
    attributionUtmCampaign: attribution.utmCampaign || "",
    attributionUtmContent: attribution.utmContent || "",
    attributionUtmTerm: attribution.utmTerm || "",
    attributionFbclid: attribution.fbclid || "",
    attributionReferrer: attribution.referrer || "",
    attributionLandedAt: attribution.landedAt || "",
    attribution,
    formFields: {
      formIntent: data.formIntent,
      name: data.name,
      businessName,
      phone: data.phone,
      email: data.email || "",
      city: data.city || "",
      state: data.state || "",
      bestTime: data.bestTime || "",
      message: data.message || "",
      currentSituation: data.currentSituation || "",
      onlinePresence: data.onlinePresence || "",
      investmentRange: data.investmentRange || "",
      startTimeline: data.startTimeline || "",
    },
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
