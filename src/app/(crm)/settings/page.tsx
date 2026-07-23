import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeCustomizer } from "@/components/crm/theme-customizer";

const env = [
  "DATABASE_URL",
  "GOOGLE_PLACES_API_KEY",
  "GOOGLE_PAGESPEED_API_KEY",
  "GOOGLE_CALENDAR_ID",
  "GOOGLE_CALENDAR_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_CALENDAR_PRIVATE_KEY",
  "GOOGLE_CALENDAR_API_KEY",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-1 text-sm text-zinc-500">Configuration checklist for local development and production deploys.</p>
      </section>
      <Card>
        <CardHeader><CardTitle>Environment Variables</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {env.map((key) => (
            <div key={key} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <code className="text-sm font-semibold">{key}</code>
              <p className="mt-2 text-xs text-zinc-500">{process.env[key] ? "Configured" : "Add this in .env before using live integrations."}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Dark Mode Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeCustomizer />
        </CardContent>
      </Card>
    </div>
  );
}
