"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  PhoneCall,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { checkPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

// Connecting a teammate's own Twilio account.
//
// Twilio's own console is the place to buy a number, so this doesn't try to
// wrap it — it links out, then asks for the two values printed on the console
// home page. The API key and TwiML app that browser dialling actually needs are
// created server-side from those, because pointing a TwiML app at the right
// voice URL by hand is the step that quietly breaks dialling.

const CONSOLE_URL = "https://console.twilio.com";
const BUY_NUMBER_URL = "https://console.twilio.com/us1/develop/phone-numbers/manage/search";
const SIGNUP_URL = "https://www.twilio.com/try-twilio";

export type TwilioConnection = {
  connected: boolean;
  usable: boolean;
  accountSid: string | null;
  callerId: string | null;
  friendlyName: string | null;
  connectedAt: string | null;
  canStore?: boolean;
};

type TwilioNumber = {
  phoneNumber: string;
  friendlyName: string;
  voiceCapable: boolean;
};

function prettyNumber(value: string) {
  return checkPhone(value).national || value;
}

export function TwilioConnectDialog({
  open,
  onOpenChange,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (connection: TwilioConnection) => void;
}) {
  const [connection, setConnection] = useState<TwilioConnection | null>(null);
  const [loading, setLoading] = useState(true);

  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [numbers, setNumbers] = useState<TwilioNumber[] | null>(null);
  const [callerId, setCallerId] = useState("");
  const [accountName, setAccountName] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setErrorField(null);
    setNumbers(null);
    setAccountSid("");
    setAuthToken("");
    setCallerId("");
    setAccountName(null);

    fetch("/api/settings/twilio", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Couldn't load your dialling setup.");
        if (!cancelled) setConnection(data);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Couldn't load your dialling setup.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  function fail(data: { error?: string; field?: string }, fallback: string) {
    setError(data.error || fallback);
    setErrorField(typeof data.field === "string" ? data.field : null);
  }

  async function verify() {
    setBusy(true);
    setError("");
    setErrorField(null);

    try {
      const response = await fetch("/api/settings/twilio/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountSid: accountSid.trim(), authToken: authToken.trim() }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        fail(data, "Couldn't check those credentials.");
        return;
      }

      setAccountName(data.friendlyName ?? null);
      setNumbers(data.numbers ?? []);
      const firstVoice = (data.numbers as TwilioNumber[] | undefined)?.find((number) => number.voiceCapable);
      setCallerId(firstVoice?.phoneNumber ?? "");
    } catch {
      setError("Couldn't reach Twilio. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function connect() {
    setBusy(true);
    setError("");
    setErrorField(null);

    try {
      const response = await fetch("/api/settings/twilio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountSid: accountSid.trim(), authToken: authToken.trim(), callerId }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        fail(data, "Couldn't connect that Twilio account.");
        return;
      }

      setConnection(data);
      onConnected(data);
      // The token is no longer needed anywhere in this tab.
      setAuthToken("");
      setNumbers(null);
    } catch {
      setError("Couldn't reach Twilio. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/settings/twilio", { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        fail(data, "Couldn't disconnect that account.");
        return;
      }
      setConnection(data);
      onConnected(data);
    } catch {
      setError("Couldn't disconnect that account.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const voiceNumbers = numbers?.filter((number) => number.voiceCapable) ?? [];
  const credentialsReady = /^AC[0-9a-fA-F]{32}$/.test(accountSid.trim()) && authToken.trim().length >= 32;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/55 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-label="Close dialling setup"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="twilio-connect-title"
        className="crm-card-strong relative z-10 flex max-h-[min(720px,90vh)] w-full max-w-lg flex-col overflow-hidden rounded-lg border"
      >
        <header className="flex items-start gap-3 border-b border-[var(--border)] p-4 sm:p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
            <PhoneCall className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="twilio-connect-title" className="text-base font-semibold">Your phone line</h2>
            <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
              Calls go out on your own Twilio account, from your own number, billed to you.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="min-h-48 flex-1 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center text-[var(--muted)]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : connection?.connected ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-semibold">
                    {connection.usable ? "Connected" : "Connected, but needs reconnecting"}
                  </p>
                  <p className="text-xs leading-5 text-[var(--muted)]">
                    {connection.friendlyName ? `${connection.friendlyName} · ` : ""}
                    {connection.accountSid ? `${connection.accountSid.slice(0, 10)}…` : ""}
                  </p>
                  {connection.callerId ? (
                    <p className="text-xs leading-5 text-[var(--muted)]">
                      Prospects see{" "}
                      <span className="font-semibold text-[var(--foreground)]">{prettyNumber(connection.callerId)}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              {!connection.usable ? (
                <p className="flex items-start gap-2 text-xs leading-5 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  The stored credentials can&rsquo;t be read back. Disconnect and connect again to fix it.
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={disconnect} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Disconnect
                </Button>
                <a
                  href={CONSOLE_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-sm font-medium hover:bg-[var(--surface-strong)]"
                >
                  Twilio console
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ) : connection?.canStore === false ? (
            <p className="flex items-start gap-2 text-sm leading-6 text-amber-600 dark:text-amber-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              This deployment can&rsquo;t store credentials yet — <code className="font-mono text-xs">CREDENTIAL_ENCRYPTION_KEY</code> isn&rsquo;t set.
              Generate one with <code className="font-mono text-xs">openssl rand -hex 32</code> and add it to the environment.
            </p>
          ) : numbers ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-xs leading-5 text-[var(--muted)]">
                  Credentials checked{accountName ? ` against ${accountName}` : ""}. Pick the number prospects should see.
                </p>
              </div>

              {voiceNumbers.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm leading-6">
                    This account doesn&rsquo;t have a voice-capable number yet. Buy one in the Twilio console, then come
                    back — it takes about a minute.
                  </p>
                  <a
                    href={BUY_NUMBER_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 text-sm font-semibold text-white"
                  >
                    Buy a number
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                  <Button variant="outline" className="w-full" onClick={verify} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    I bought one — check again
                  </Button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="twilio-caller-id">Caller ID</Label>
                  <Select
                    id="twilio-caller-id"
                    value={callerId}
                    onChange={(event) => setCallerId(event.target.value)}
                    aria-label="Number prospects will see"
                  >
                    {voiceNumbers.map((number) => (
                      <option key={number.phoneNumber} value={number.phoneNumber}>
                        {prettyNumber(number.phoneNumber)}
                        {number.friendlyName && number.friendlyName !== number.phoneNumber
                          ? ` — ${number.friendlyName}`
                          : ""}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-[var(--muted)]">
                    This is what shows on a prospect&rsquo;s phone when you call them.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-3">
                <p className="text-xs leading-5 text-[var(--muted)]">
                  No Twilio account yet?{" "}
                  <a
                    href={SIGNUP_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-semibold text-[var(--accent)] underline underline-offset-2"
                  >
                    Create one
                  </a>
                  , buy a local number, then copy the two values from the console home page below.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="twilio-account-sid">Account SID</Label>
                <Input
                  id="twilio-account-sid"
                  value={accountSid}
                  onChange={(event) => setAccountSid(event.target.value)}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  autoComplete="off"
                  spellCheck={false}
                  className={cn(errorField === "accountSid" && "border-red-500")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="twilio-auth-token">Auth Token</Label>
                <Input
                  id="twilio-auth-token"
                  type="password"
                  value={authToken}
                  onChange={(event) => setAuthToken(event.target.value)}
                  placeholder="Hidden behind the Show button in Twilio"
                  autoComplete="off"
                  spellCheck={false}
                  className={cn(errorField === "authToken" && "border-red-500")}
                />
                <p className="text-xs text-[var(--muted)]">
                  Stored encrypted, and never sent back to your browser. Only this server can read it.
                </p>
              </div>
            </div>
          )}

          {error ? (
            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-red-600 dark:text-red-400" role="alert">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          ) : null}
        </div>

        {!loading && !connection?.connected && connection?.canStore !== false ? (
          <footer className="flex items-center justify-end gap-2 border-t border-[var(--border)] p-4 sm:p-5">
            {numbers ? (
              <>
                <Button variant="outline" onClick={() => setNumbers(null)} disabled={busy}>
                  Back
                </Button>
                <Button onClick={connect} disabled={busy || !callerId}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Connect
                </Button>
              </>
            ) : (
              <Button onClick={verify} disabled={busy || !credentialsReady}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Continue
              </Button>
            )}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
