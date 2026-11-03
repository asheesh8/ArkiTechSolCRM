"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Button, Field, Input } from "@/components/ui";

export function LoginForm({ next, error: initialError, sent }: { next?: string; error?: string; sent?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = React.useState<"link" | "password">("password");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(initialError);
  const [done, setDone] = React.useState(Boolean(sent));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    const supabase = supabaseBrowser();
    if (mode === "link") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next ?? "/")}` },
      });
      setBusy(false);
      if (error) return setError(error.message);
      setDone(true);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError("That email and password don't match.");
    router.replace(next && next.startsWith("/") ? next : "/");
    router.refresh();
  }

  if (done)
    return (
      <div className="rounded-lg border border-border bg-bg-subtle p-4 text-sm">
        <p className="font-medium">Check your email.</p>
        <p className="mt-1 text-text-muted">We sent a sign-in link to {email || "you"}. It works once and expires in an hour.</p>
      </div>
    );

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Email" htmlFor="email">
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
      </Field>
      {mode === "password" ? (
        <Field label="Password" htmlFor="password">
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
      ) : null}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" size="lg" loading={busy}>
        {mode === "link" ? "Email me a link" : "Sign in"}
      </Button>
      <button type="button" onClick={() => setMode(mode === "link" ? "password" : "link")} className="text-sm text-text-muted underline-offset-4 hover:text-text hover:underline">
        {mode === "link" ? "Use a password instead" : "Email me a sign-in link instead"}
      </button>
    </form>
  );
}
