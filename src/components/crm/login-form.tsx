"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

type Step = "email" | "password" | "magic-sent";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.type === "staff") {
      setStep("password");
    } else if (data.type === "client") {
      // Send the magic link
      await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStep("magic-sent");
    } else {
      setError("No account found for that email.");
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.target as HTMLFormElement;
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: (form.elements.namedItem("password") as HTMLInputElement).value }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Could not sign in"); return; }
    router.push("/dashboard");
    router.refresh();
  }

  if (step === "magic-sent") {
    return (
      <div className="space-y-4 text-center py-2">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">Check your inbox</p>
          <p className="mt-1 text-sm text-zinc-500">We sent a sign-in link to <strong>{email}</strong>. It expires in 15 minutes.</p>
        </div>
        <button
          type="button"
          onClick={() => { setStep("email"); setEmail(""); setError(""); }}
          className="text-sm text-zinc-400 hover:text-zinc-600 underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  if (step === "password") {
    return (
      <form onSubmit={submitPassword} className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
          <Mail className="h-4 w-4 shrink-0 text-zinc-400" />
          <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{email}</span>
          <button type="button" onClick={() => { setStep("email"); setError(""); }} className="text-xs text-zinc-400 hover:text-zinc-600">Change</button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input id="password" name="password" type="password" className="pl-9" autoComplete="current-password" autoFocus required />
          </div>
        </div>
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">{error}</div>
        )}
        <Button className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"} <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  // Step: email
  return (
    <form onSubmit={submitEmail} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-9"
            autoComplete="email"
            autoFocus
            required
          />
        </div>
      </div>
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">{error}</div>
      )}
      <Button className="w-full" disabled={loading}>
        {loading ? "Checking…" : "Continue"} <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
