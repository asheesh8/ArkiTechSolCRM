"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const passwordsMatch = newPassword === confirmPassword;
  const ready = currentPassword.length > 0 && newPassword.length >= 8 && passwordsMatch;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        setMessage({ text: payload.error ?? "The password could not be changed.", error: true });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage({ text: "Password changed. Other signed-in devices have been logged out.", error: false });
    } catch {
      setMessage({ text: "The password could not be changed. Try again.", error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      <div>
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type={showPasswords ? "text" : "password"}
          autoComplete="current-password"
          className="mt-1.5"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            className="mt-1.5"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            minLength={8}
            maxLength={72}
            required
          />
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            className="mt-1.5"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            maxLength={72}
            required
            aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!ready || busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Changing password" : "Change password"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setShowPasswords((shown) => !shown)}>
          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPasswords ? "Hide passwords" : "Show passwords"}
        </Button>
      </div>

      <p className="text-xs text-zinc-500">Use at least 8 characters. Your current device stays signed in.</p>
      {confirmPassword.length > 0 && !passwordsMatch ? (
        <p className="text-sm text-amber-600 dark:text-amber-400">The new passwords do not match.</p>
      ) : null}
      {message ? (
        <p aria-live="polite" className={message.error ? "text-sm text-red-600 dark:text-red-400" : "text-sm text-emerald-600 dark:text-emerald-400"}>
          {message.text}
        </p>
      ) : null}
    </form>
  );
}
