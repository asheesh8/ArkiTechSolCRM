export const LEAD_EXPORT_HEADERS = ["Name", "Website", "Phone Number", "Additional Notes"] as const;

export type ExportableLead = {
  businessName: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  category?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  googleMapsUrl?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  status?: string | null;
  priority?: string | null;
  websiteScore?: number | null;
  pageSpeedPerformance?: number | null;
  pageSpeedAccessibility?: number | null;
  pageSpeedSEO?: number | null;
  pageSpeedBestPractices?: number | null;
  notes?: string | null;
  source?: string | null;
  assignedTo?: { name?: string | null } | null;
};

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function cleanText(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function enumLabel(value: string | null | undefined) {
  const cleaned = cleanText(value);
  if (!cleaned) return "";
  return cleaned.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/** Convert stored US numbers to +1XXXXXXXXXX without fabricating missing digits. */
export function exportPhoneNumber(phone: string | null | undefined) {
  const raw = cleanText(phone);
  if (!raw) return "";

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (raw.startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;

  // Preserve an unrecognized stored value exactly instead of inventing or
  // silently dropping contact data.
  return raw;
}

function additionalNotes(lead: ExportableLead) {
  const location = [cleanText(lead.address), [cleanText(lead.city), cleanText(lead.state)].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(", ");
  const googleRating = lead.googleRating !== null && lead.googleRating !== undefined
    ? `${lead.googleRating}/5${lead.googleReviewCount !== null && lead.googleReviewCount !== undefined ? ` (${lead.googleReviewCount} reviews)` : ""}`
    : lead.googleReviewCount !== null && lead.googleReviewCount !== undefined
      ? `${lead.googleReviewCount} reviews`
      : "";

  const fields: Array<[string, string | number | null | undefined]> = [
    ["Category", lead.category],
    ["Email", lead.email],
    ["Address", location],
    ["Google rating", googleRating],
    ["Google Maps", lead.googleMapsUrl],
    ["CRM status", enumLabel(lead.status)],
    ["Priority", enumLabel(lead.priority)],
    ["Assigned to", lead.assignedTo?.name],
    ["Website score", lead.websiteScore],
    ["PageSpeed performance", lead.pageSpeedPerformance],
    ["PageSpeed accessibility", lead.pageSpeedAccessibility],
    ["PageSpeed SEO", lead.pageSpeedSEO],
    ["PageSpeed best practices", lead.pageSpeedBestPractices],
    ["Source", lead.source],
    ["Notes", lead.notes],
  ];

  const phrases = fields.flatMap(([label, value]) => {
    const text = cleanText(value).replace(/[.\s]+$/, "");
    return text ? [`${label}: ${text}`] : [];
  });

  return phrases.length ? `${phrases.join(". ")}.` : "";
}

export function buildLeadExportCsv(leads: ExportableLead[]) {
  const rows = leads.map((lead) => [
    cleanText(lead.businessName),
    cleanText(lead.website),
    exportPhoneNumber(lead.phone),
    additionalNotes(lead),
  ]);

  return [LEAD_EXPORT_HEADERS.join(","), ...rows.map((row) => row.map(csvCell).join(","))].join("\r\n");
}
