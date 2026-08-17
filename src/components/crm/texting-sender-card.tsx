"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { checkPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

// Point texting at a different Twilio number than calling.
//
// Voice works the day a number is bought; texting waits on A2P brand and
// campaign registration, which takes days and is invisible until messages
// quietly stop arriving. This is the escape hatch for that gap.

type SenderStatus = {
  configured: boolean;
  from: string | null;
  separate: boolean;
  canStore?: boolean;
};

type TwilioNumber = { phoneNumber: string; friendlyName: string; smsCapable: boolean };

function pretty(value: string | null) {
  if (!value) return "";
  return checkPhone(value).national || value;
}

export function TextingSenderCard({ onChanged }: { onChanged: (from: string | null) => void }) {
  const [status, setStatus] = useState<SenderStatus | null>(null);
  const [open, setOpen] = useState(false);

  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [numbers, setNumbers] = useState<TwilioNumber[] | null>(null);
  const [from, setFrom] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errorField, setErrorField] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/settings/twilio/messaging", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus(null));
  }, []);

  useEffect(load, [load]);

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
      const list = (data.numbers ?? []) as TwilioNumber[];
      setNumbers(list);
      setFrom(list.find((number) => number.smsCapable)?.phoneNumber ?? "");
    } catch {
      setError("Couldn't reach Twilio.");
    } finally {
      setBusy(false);
    }
  }

  async function connect() {
    setBusy(true);
    setError("");
    setErrorField(null);
    try {
      const response = await fetch("/api/settings/twilio/messaging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountSid: accountSid.trim(), authToken: authToken.trim(), callerId: from }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        fail(data, "Couldn't connect that texting number.");
        return;
      }
      setStatus(data);
      onChanged(data.from ?? null);
      setAuthToken("");
      setNumbers(null);
      setOpen(false);
    } catch {
      setError("Couldn't reach Twilio.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/settings/twilio/messaging", { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      setStatus(data);
      onChanged(data.from ?? null);
    } catch {
      setError("Couldn't disconnect that number.");
    } finally {
      setBusy(false);
    }
  }

  const smsNumbers = numbers?.filter((number) => number.smsCapable) ?? [];
  const ready = /^AC[0-9a-fA-F]{32}$/.test(accountSid.trim()) && authToken.trim().length >= 32;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full min-h-12 items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-[var(--surface-strong)]"
      >
        <MessageSquare className="h-4 w-4 shrink-0 text-[var(--accent)]" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold">Texts send from</span>
          <span className="mt-0.5 block truncate text-xs font-normal text-[var(--muted)]">
            {status?.from
              ? `${pretty(status.from)}${status.separate ? " · separate texting number" : " · same as your calling number"}`
              : "No number connected"}
          </span>
        </span>
        {status?.separate ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : null}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--muted)] transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-[var(--border)] p-3">
          <p className="text-xs leading-5 text-[var(--muted)]">
            Carriers filter texts from numbers whose A2P registration hasn&rsquo;t cleared, while calls go through
            straight away. If a different Twilio number is already registered, send from that one until yours clears.
          </p>

          {status?.separate ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="min-w-0 flex-1 text-xs">
                Sending from{" "}
                <span className="font-semibold">{pretty(status.from)}</span>
              </p>
              <Button variant="outline" size="sm" onClick={disconnect} disabled={busy}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Use my calling number
              </Button>
            </div>
          ) : numbers ? (
            <div className="space-y-3">
              {smsNumbers.length === 0 ? (
                <p className="text-xs leading-5 text-amber-600 dark:text-amber-400">
                  No SMS-capable numbers on that account.
                </p>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="texting-from">Send texts from</Label>
                  <Select id="texting-from" value={from} onChange={(event) => setFrom(event.target.value)}>
                    {smsNumbers.map((number) => (
                      <option key={number.phoneNumber} value={number.phoneNumber}>
                        {pretty(number.phoneNumber)}
                        {number.friendlyName && number.friendlyName !== number.phoneNumber ? ` — ${number.friendlyName}` : ""}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button onClick={connect} disabled={busy || !from}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Use this number
                </Button>
                <Button variant="ghost" onClick={() => setNumbers(null)} disabled={busy}>
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="texting-sid">Account SID</Label>
                <Input
                  id="texting-sid"
                  value={accountSid}
                  onChange={(event) => setAccountSid(event.target.value)}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  autoComplete="off"
                  spellCheck={false}
                  className={cn(errorField === "accountSid" && "border-red-500")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="texting-token">Auth Token</Label>
                <Input
                  id="texting-token"
                  type="password"
                  value={authToken}
                  onChange={(event) => setAuthToken(event.target.value)}
                  placeholder="From that account's console home page"
                  autoComplete="off"
                  spellCheck={false}
                  className={cn(errorField === "authToken" && "border-red-500")}
                />
                <p className="text-xs text-[var(--muted)]">
                  Stored encrypted and never sent back to your browser. Calls keep going out on your own number.
                </p>
              </div>
              <Button onClick={verify} disabled={busy || !ready}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Continue
              </Button>
            </div>
          )}

          {error ? (
            <p className="flex items-start gap-2 text-xs leading-5 text-red-600 dark:text-red-400" role="alert">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
