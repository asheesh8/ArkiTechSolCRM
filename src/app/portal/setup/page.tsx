"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

function SetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [client, setClient] = useState<{ name: string; email: string; businessName: string } | null>(null);
  const [tokenError, setTokenError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setTokenError("Missing setup token."); return; }
    fetch(`/api/portal/setup?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setTokenError(d.error);
        else setClient(d.client);
      });
  }, [token]);

  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const strengthLabel = ["", "Too short", "Fair", "Good", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-emerald-400", "bg-emerald-500"];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/portal/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
    setDone(true);
    setTimeout(() => router.push("/portal"), 2000);
  }

  if (tokenError) {
    return (
      <div className="text-center space-y-3 py-4">
        <p className="text-red-600 font-medium">{tokenError}</p>
        <p className="text-sm text-zinc-500">This link may have expired. Contact ArkiTech Solutions and we'll send a new one.</p>
      </div>
    );
  }

  if (!client) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <p className="text-lg font-semibold">Password created!</p>
        <p className="text-sm text-zinc-500">Taking you to your portal…</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium mb-1">Setting up portal for</p>
        <p className="font-semibold">{client.businessName}</p>
        <p className="text-sm text-zinc-500">{client.email}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Create a password</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            id="password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-9 pr-10"
            placeholder="At least 8 characters"
            autoFocus
            required
          />
          <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {password.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className={`h-1 flex-1 rounded-full transition-all ${n <= strength ? strengthColor[strength] : "bg-zinc-200 dark:bg-zinc-800"}`} />
              ))}
            </div>
            <p className="text-xs text-zinc-500">{strengthLabel[strength]}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            id="confirm"
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="pl-9"
            placeholder="Same password again"
            required
          />
        </div>
        {confirm.length > 0 && password !== confirm && (
          <p className="text-xs text-red-500">Passwords don't match yet.</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <Button className="w-full" disabled={loading || password !== confirm || password.length < 8}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Setting up…</> : <>Create password & enter portal</>}
      </Button>
    </form>
  );
}

export default function SetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            ArkiTech Solutions
          </div>
          <h1 className="mt-4 text-xl font-semibold">Welcome — let's set up your account</h1>
          <p className="mt-2 text-sm text-zinc-500">Create a password to access your client portal. You'll use it every time you log in.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>}>
            <SetupForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
