"use client";

import { useState } from "react";
import { BarChart3, Building2, CheckCircle2, FileText, Gauge, MessageSquarePlus, Sparkles } from "lucide-react";
import { LoginForm } from "@/components/crm/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UserType = "unknown" | "staff" | "client";

const PANELS: Record<UserType, React.ReactNode> = {
  unknown: (
    <>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold">ArkiTech Solutions</p>
          <p className="text-sm text-zinc-500">Your digital growth partner</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">Welcome</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight">
          One place for everything we build together.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-500">
          Sign in with your email and we'll take you to the right place — whether you're a client or part of the ArkiTech team.
        </p>
        <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
          {[
            { label: "Your project", icon: Building2 },
            { label: "Invoices", icon: FileText },
            { label: "Send requests", icon: MessageSquarePlus },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <Icon className="h-5 w-5 text-zinc-500" />
              <p className="mt-3 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-zinc-500">ArkiTech Solutions · Burlington, VT</p>
    </>
  ),

  client: (
    <>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold">ArkiTech Solutions</p>
          <p className="text-sm text-zinc-500">Client Portal</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-indigo-500">Client portal</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-tight">
          Your project hub, all in one place.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-500">
          Check in on your project, submit change requests, upload files, and pay invoices — no back-and-forth emails needed.
        </p>
        <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
          {[
            { label: "Track progress", icon: CheckCircle2 },
            { label: "Submit requests", icon: MessageSquarePlus },
            { label: "Pay invoices", icon: FileText },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <Icon className="h-5 w-5 text-indigo-500" />
              <p className="mt-3 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-zinc-500">We'll email you a sign-in link — no password needed.</p>
    </>
  ),

  staff: (
    <>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold">LocalLead CRM</p>
          <p className="text-sm text-zinc-500">ArkiTech Sol prospecting desk</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-zinc-500">ArkiTech team</p>
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
          ].map(({ label, icon: Icon }) => (
            <div key={label} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <Icon className="h-5 w-5 text-zinc-500" />
              <p className="mt-3 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-zinc-500">Shared notes, follow-ups, and call history stay synced in Neon.</p>
    </>
  ),
};

export default function LoginPage() {
  const [userType, setUserType] = useState<UserType>("unknown");

  return (
    <main className="grid min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden border-r border-zinc-200 bg-white px-10 py-10 dark:border-zinc-800 dark:bg-zinc-950 lg:flex lg:flex-col lg:justify-between transition-all duration-300">
        {PANELS[userType]}
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">ArkiTech Solutions</p>
              <p className="text-sm text-zinc-500">Sign in to continue</p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <p className="text-sm text-zinc-500">Enter your email to get started.</p>
            </CardHeader>
            <CardContent>
              <LoginForm onDetect={setUserType} />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
