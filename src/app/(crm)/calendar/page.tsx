import { CalendarWorkspace } from "@/components/calendar/calendar-workspace";

export const metadata = { title: "Calendar · LocalLead CRM" };

const DEFAULT_SHARED_CALENDAR_EMBED_URL =
  "https://calendar.google.com/calendar/embed?src=c8bbc50640d97a9a6b5e55a1765c42cd522a7ffec403397a5002be548c1d07ac%40group.calendar.google.com&ctz=America%2FNew_York";

export default function CalendarPage() {
  const embedUrl = process.env.GOOGLE_CALENDAR_EMBED_URL || DEFAULT_SHARED_CALENDAR_EMBED_URL;
  const hasNativeCalendarAccess = Boolean(
    process.env.GOOGLE_CALENDAR_API_KEY ||
      (process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_CALENDAR_PRIVATE_KEY),
  );

  return <CalendarWorkspace embedUrl={embedUrl} nativeAgendaEnabled={!embedUrl || hasNativeCalendarAccess} />;
}
