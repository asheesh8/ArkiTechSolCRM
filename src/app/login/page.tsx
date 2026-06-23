import { redirect } from "next/navigation";
import { BarChart3, Building2, Gauge, Sparkles } from "lucide-react";
import { LoginForm } from "@/components/crm/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="grid min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden border-r border-zinc-200 bg-white px-10 py-10 dark:border-zinc-800 dark:bg-zinc-950 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">LocalLead CRM</p>
            <p className="text-sm text-zinc-500">ArkiTech Sol prospecting desk</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">Ashish + Terri</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight">
            Turn local searches into booked website meetings.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-500">
            Search local businesses, save qualified prospects, track calls, add notes, and run PageSpeed audits from one shared workspace.
          </p>
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              { label: "Pipeline", icon: BarChart3 },
              { label: "Clients", icon: Building2 },
              { label: "Audits", icon: Gauge },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <Icon className="h-5 w-5 text-zinc-500" />
                  <p className="mt-3 text-sm font-medium">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-zinc-500">Shared notes, follow-ups, and call history stay synced in Neon.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">LocalLead CRM</p>
              <p className="text-sm text-zinc-500">ArkiTech Sol</p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <p className="text-sm text-zinc-500">Sign in to manage calls, clients, and audits.</p>
            </CardHeader>
            <CardContent>
              <LoginForm />
              <div className="mt-5 rounded-lg bg-zinc-50 p-3 text-xs leading-5 text-zinc-500 dark:bg-zinc-900">
                Ashish: ashish@arkitech.com<br />
                Terri: terri@arkitech.com<br />
                Password: ARKITECH
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
