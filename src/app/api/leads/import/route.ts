import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { leadCreateSchema, leadStatuses } from "@/lib/schemas";

const requiredHeaders = ["businessName"];
const allowedHeaders = [
  "businessName",
  "category",
  "phone",
  "email",
  "website",
  "address",
  "city",
  "state",
  "googlePlaceId",
  "googleMapsUrl",
  "googleRating",
  "googleReviewCount",
  "status",
  "notes",
];

type ImportAction = "ADD_COPY" | "MERGE" | "CANCEL";

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === "\"" && inQuotes && next === "\"") {
      field += "\"";
      i += 1;
      continue;
    }

    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field.trim());
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);

  return rows;
}

function cleanValue(value: string | undefined) {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed : undefined;
}

function normalizeText(value?: string | null) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizePhone(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

function normalizeUrl(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

function getDuplicateKey(input: {
  businessName?: string | null;
  phone?: string | null;
  website?: string | null;
  city?: string | null;
  state?: string | null;
  googlePlaceId?: string | null;
}) {
  if (input.googlePlaceId) return `place:${input.googlePlaceId}`;
  const website = normalizeUrl(input.website);
  if (website) return `website:${website}`;
  const phone = normalizePhone(input.phone);
  const businessName = normalizeText(input.businessName);
  if (phone && businessName) return `phone-name:${phone}:${businessName}`;
  return `name-location:${businessName}:${normalizeText(input.city)}:${normalizeText(input.state)}`;
}

async function findExistingLead(payload: ReturnType<typeof leadCreateSchema.parse>) {
  const phoneDigits = normalizePhone(payload.phone);
  const website = normalizeUrl(payload.website);
  return prisma.lead.findFirst({
    where: {
      OR: [
        ...(payload.googlePlaceId ? [{ googlePlaceId: payload.googlePlaceId }] : []),
        ...(website
          ? [
              { website: { contains: website, mode: "insensitive" as const } },
              { website: { contains: `www.${website}`, mode: "insensitive" as const } },
            ]
          : []),
        ...(phoneDigits
          ? [
              {
                businessName: { equals: payload.businessName, mode: "insensitive" as const },
                phone: { contains: phoneDigits },
              },
            ]
          : []),
        {
          businessName: { equals: payload.businessName, mode: "insensitive" as const },
          city: payload.city ? { equals: payload.city, mode: "insensitive" as const } : undefined,
          state: payload.state ? { equals: payload.state, mode: "insensitive" as const } : undefined,
        },
      ],
    },
    select: { id: true, businessName: true, city: true, state: true, phone: true, website: true, status: true },
  });
}

async function resolveDuplicates(request: NextRequest, userId: string) {
  const body = await request.json();
  const resolutions = Array.isArray(body.resolutions) ? body.resolutions : [];
  const created = [];
  const merged = [];
  const cancelled = [];
  const skipped: { row: number; reason: string }[] = [];

  for (const item of resolutions) {
    const row = Number(item.row);
    const action = item.action as ImportAction;
    const existingLeadId = typeof item.existingLeadId === "string" ? item.existingLeadId : "";
    const payload = leadCreateSchema.parse({ ...item.payload, assignedToId: userId });

    if (action === "CANCEL") {
      cancelled.push({ row, businessName: payload.businessName });
      continue;
    }

    if (action === "ADD_COPY") {
      const lead = await prisma.lead.create({
        data: {
          ...payload,
          googlePlaceId: null,
          notes: `${payload.notes ?? ""}\nAdded as duplicate copy from CSV`.trim(),
        },
      });
      created.push(lead);
      continue;
    }

    if (action === "MERGE") {
      if (!existingLeadId) {
        skipped.push({ row, reason: "Missing existing lead to merge into" });
        continue;
      }
      const existing = await prisma.lead.findUnique({
        where: { id: existingLeadId },
        select: { notes: true },
      });
      const mergedNotes = [existing?.notes, payload.notes, "Merged from CSV import"].filter(Boolean).join("\n");
      const lead = await prisma.lead.update({
        where: { id: existingLeadId },
        data: {
          ...payload,
          googlePlaceId: payload.googlePlaceId || undefined,
          notes: mergedNotes,
        },
      });
      merged.push(lead);
      continue;
    }

    skipped.push({ row, reason: "Choose add copy, merge, or cancel" });
  }

  return NextResponse.json({
    created: created.length,
    merged: merged.length,
    cancelled: cancelled.length,
    skipped,
    leads: [...created, ...merged],
  });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in before importing leads." }, { status: 401 });
    }

    if (request.headers.get("content-type")?.includes("application/json")) {
      return resolveDuplicates(request, user.id);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a CSV file before importing." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json({ error: "Only .csv files are supported." }, { status: 400 });
    }

    const rows = parseCsv(await file.text());
    const [headers, ...bodyRows] = rows;
    if (!headers?.length) {
      return NextResponse.json({ error: "CSV is empty. Add a header row and at least one business." }, { status: 400 });
    }

    const normalizedHeaders = headers.map((header) => header.trim());
    const missingHeaders = requiredHeaders.filter((header) => !normalizedHeaders.includes(header));
    if (missingHeaders.length) {
      return NextResponse.json({ error: `Missing required header: ${missingHeaders.join(", ")}` }, { status: 400 });
    }

    const unknownHeaders = normalizedHeaders.filter((header) => !allowedHeaders.includes(header));
    if (unknownHeaders.length) {
      return NextResponse.json({ error: `Unknown header: ${unknownHeaders.join(", ")}` }, { status: 400 });
    }

    if (bodyRows.length > 500) {
      return NextResponse.json({ error: "Import up to 500 rows at a time so the upload stays reliable." }, { status: 400 });
    }

    const created = [];
    const skipped: { row: number; reason: string }[] = [];
    const duplicates = [];
    const seenImportKeys = new Set<string>();

    for (const [index, row] of bodyRows.entries()) {
      const rowNumber = index + 2;
      const raw = Object.fromEntries(normalizedHeaders.map((header, columnIndex) => [header, cleanValue(row[columnIndex])]));
      const businessName = cleanValue(raw.businessName);

      if (!businessName) {
        skipped.push({ row: rowNumber, reason: "Missing businessName" });
        continue;
      }

      const status = raw.status && leadStatuses.includes(raw.status as any) ? raw.status : "SAVED";
      const category = raw.category?.includes("CSV import")
        ? raw.category
        : `${raw.category ?? "CSV Lead"} · CSV import`;
      const notes = raw.notes ? `${raw.notes}\nImported from CSV` : "Imported from CSV";

      const payload = leadCreateSchema.parse({
        ...raw,
        businessName,
        category,
        status,
        notes,
        assignedToId: user.id,
        googleRating: raw.googleRating,
        googleReviewCount: raw.googleReviewCount,
      });

      const duplicateKey = getDuplicateKey(payload);
      if (seenImportKeys.has(duplicateKey)) {
        duplicates.push({
          row: rowNumber,
          reason: "Duplicate inside this CSV",
          existingLead: null,
          payload,
        });
        continue;
      }
      seenImportKeys.add(duplicateKey);

      const existingLead = await findExistingLead(payload);

      if (existingLead) {
        duplicates.push({
          row: rowNumber,
          reason: `Possible duplicate of ${existingLead.businessName}`,
          existingLead,
          payload,
        });
        continue;
      }

      const lead = await prisma.lead.create({ data: payload });
      created.push(lead);
    }

    return NextResponse.json({ created: created.length, skipped, duplicates, leads: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to import CSV" }, { status: 400 });
  }
}
