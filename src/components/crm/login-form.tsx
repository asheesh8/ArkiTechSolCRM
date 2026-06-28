"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

type Step = "email" | "password";
type UserType = "unknown" | "staff" | "client";

export function LoginForm({ onDetect }: { onDetect?: (type: UserType) => void }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [userType, setUserType] = useState<UserType>("unknown");
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
    const type = data.type as UserType;
    onDetect?.(type);
    if (type === "staff" || type === "client") {
      setUserType(type);
      setStep("password");
    } else {
      setError("No account found for that email address.");
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.target as HTMLFormElement;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const endpoint = userType === "client" ? "/api/auth/client-login" : "/api/auth/login";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Could not sign in."); return; }
    router.push(userType === "client" ? "/portal" : "/dashboard");
    router.refresh();
  }

  // ── Step 1: email ────────────────────────────────────────────────────────
  if (step === "email") {
    return (
      <form onSubmit={submitEmail} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
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
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}
        <Button className="w-full" disabled={loading}>
          {loading ? "Checking…" : "Continue"} <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  // ── Step 2: password (staff or client) ───────────────────────────────────
  return (
    <form onSubmit={submitPassword} className="space-y-4">
      {/* Email pill — click to go back */}
      <button
        type="button"
        onClick={() => { setStep("email"); setError(""); setUserType("unknown"); }}
        className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        <Mail className="h-4 w-4 shrink-0 text-zinc-400" />
        <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{email}</span>
        <span className="text-xs text-zinc-400">Change</span>
      </button>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {userType === "client" && (
            <span className="text-xs text-zinc-400">Set up in your welcome email</span>
          )}
        </div>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            id="password"
            name="password"
            type="password"
            className="pl-9"
            autoComplete="current-password"
            autoFocus
            required
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
          {error.includes("set up yet") && (
            <p className="mt-1 text-xs">Haven't received it? Contact <strong>Ashish</strong> and we'll resend it.</p>
          )}
        </div>
      )}

      <Button className="w-full" disabled={loading}>
        {loading ? "Signing in…" : userType === "client" ? "Sign in to portal" : "Sign in"} <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
