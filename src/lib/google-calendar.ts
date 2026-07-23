import "server-only";

import { createSign } from "node:crypto";

const CALENDAR_READONLY_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3/calendars";

type CalendarConfig = { id: string; name: string };

type GoogleEventDate = {
  date?: string;
  dateTime?: string;
  timeZone?: string;
};

type GoogleEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  status?: string;
  start?: GoogleEventDate;
  end?: GoogleEventDate;
  creator?: { email?: string; displayName?: string };
  organizer?: { email?: string; displayName?: string };
  attendees?: Array<{ email?: string; displayName?: string; responseStatus?: string }>;
};

export type CalendarEvent = {
  id: string;
  calendarId: string;
  calendarName: string;
  title: string;
  description: string | null;
  location: string | null;
  start: string;
  end: string;
  allDay: boolean;
  htmlLink: string | null;
  status: string;
  organizer: string | null;
  attendees: Array<{ name: string; email: string | null; responseStatus: string | null }>;
};

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

function base64url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function configuredCalendars(): CalendarConfig[] {
  const raw = process.env.GOOGLE_CALENDAR_IDS || process.env.GOOGLE_CALENDAR_ID || "";
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [maybeName, ...rest] = part.split("::");
      const id = rest.length ? rest.join("::").trim() : maybeName.trim();
      return { id, name: rest.length ? maybeName.trim() || id : id };
    });
}

function normalizedPrivateKey() {
  return process.env.GOOGLE_CALENDAR_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function hasServiceAccountCredentials() {
  return Boolean(process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_EMAIL && normalizedPrivateKey());
}

async function getServiceAccountToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.accessToken;

  const email = process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_EMAIL;
  const privateKey = normalizedPrivateKey();
  if (!email || !privateKey) throw new Error("Google Calendar service account credentials are missing.");

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({
    iss: email,
    scope: CALENDAR_READONLY_SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
    ...(process.env.GOOGLE_CALENDAR_SUBJECT ? { sub: process.env.GOOGLE_CALENDAR_SUBJECT } : {}),
  }));
  const unsigned = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(privateKey);
  const assertion = `${unsigned}.${base64url(signature)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const data = await res.json().catch(() => null) as { access_token?: string; expires_in?: number; error_description?: string } | null;
  if (!res.ok || !data?.access_token) {
    throw new Error(data?.error_description || "Could not authorize Google Calendar.");
  }

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.accessToken;
}

function eventDate(value: GoogleEventDate | undefined, fallback: string) {
  return value?.dateTime || value?.date || fallback;
}

function mapEvent(calendar: CalendarConfig, event: GoogleEvent): CalendarEvent {
  const start = eventDate(event.start, new Date().toISOString());
  const end = eventDate(event.end, start);
  const organizer = event.organizer?.displayName || event.organizer?.email || event.creator?.displayName || event.creator?.email || null;

  return {
    id: `${calendar.id}:${event.id}`,
    calendarId: calendar.id,
    calendarName: calendar.name,
    title: event.summary || "Untitled event",
    description: event.description || null,
    location: event.location || null,
    start,
    end,
    allDay: Boolean(event.start?.date && !event.start.dateTime),
    htmlLink: event.htmlLink || null,
    status: event.status || "confirmed",
    organizer,
    attendees: (event.attendees ?? []).map((attendee) => ({
      name: attendee.displayName || attendee.email || "Guest",
      email: attendee.email || null,
      responseStatus: attendee.responseStatus || null,
    })),
  };
}

export async function listGoogleCalendarEvents({ timeMin, timeMax }: { timeMin: string; timeMax: string }) {
  const calendars = configuredCalendars();
  if (!calendars.length) {
    throw new Error("Set GOOGLE_CALENDAR_ID or GOOGLE_CALENDAR_IDS to connect your shared calendar.");
  }

  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
  const accessToken = hasServiceAccountCredentials() ? await getServiceAccountToken() : null;
  if (!apiKey && !accessToken) {
    throw new Error("Set GOOGLE_CALENDAR_API_KEY for a public calendar, or service account credentials for a private shared calendar.");
  }

  const headers: HeadersInit = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  const results = await Promise.all(calendars.map(async (calendar) => {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "2500",
      showDeleted: "false",
    });
    if (apiKey && !accessToken) params.set("key", apiKey);

    const res = await fetch(`${CALENDAR_API}/${encodeURIComponent(calendar.id)}/events?${params.toString()}`, {
      headers,
      cache: "no-store",
    });
    const data = await res.json().catch(() => null) as { items?: GoogleEvent[]; error?: { message?: string } } | null;
    if (!res.ok) throw new Error(data?.error?.message || `Could not load ${calendar.name}.`);
    return (data?.items ?? []).map((event) => mapEvent(calendar, event));
  }));

  return results.flat().sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}
