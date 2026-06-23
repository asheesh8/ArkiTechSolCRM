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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in before importing leads." }, { status: 401 });
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
    const skipped = [];

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

      const lead = await prisma.lead.upsert({
        where: payload.googlePlaceId ? { googlePlaceId: payload.googlePlaceId } : { id: `csv-missing-${rowNumber}` },
        update: payload,
        create: payload,
      });
      created.push(lead);
    }

    return NextResponse.json({ created: created.length, skipped, leads: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to import CSV" }, { status: 400 });
  }
}
