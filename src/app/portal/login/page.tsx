"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const params = useSearchParams();
  const errorMsg = params.get("error") === "expired" ? "That link has expired. Request a new one below." : params.get("error") ? "Invalid link." : null;

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/portal/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setLoading(false);
    setSent(true);
  }

  return (
    <>
      {errorMsg && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>
      )}

      {sent ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-500" />
          <p className="font-semibold text-zinc-900">Check your inbox</p>
          <p className="mt-1 text-sm text-zinc-500">We sent a sign-in link to <strong>{email}</strong>. It expires in 15 minutes.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourbusiness.com"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {loading ? "Sending…" : "Send sign-in link"}
          </button>
        </form>
      )}
    </>
  );
}

export default function PortalLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">ArkiTech Solutions</p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">Client Portal</h1>
          <p className="mt-1 text-sm text-zinc-500">Sign in to view your project, submit requests, and pay invoices.</p>
        </div>

        <Suspense fallback={<div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm animate-pulse h-32" />}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-zinc-400">Not a client yet? <a href="/" className="text-indigo-600 hover:underline">Contact us</a></p>
      </div>
    </div>
  );
}
