"use client";

import { Delete, Loader2, Phone, PhoneOff } from "lucide-react";
import { checkPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

// A real keypad, for the two moments a text field can't cover: reading a number
// off a screen and punching it in, and getting past "press 2 for scheduling"
// once someone has already picked up. Which of those it is depends entirely on
// whether a call is live — the same button either composes or sends a tone.

const KEYS: Array<[string, string]> = [
  ["1", ""],
  ["2", "ABC"],
  ["3", "DEF"],
  ["4", "GHI"],
  ["5", "JKL"],
  ["6", "MNO"],
  ["7", "PQRS"],
  ["8", "TUV"],
  ["9", "WXYZ"],
  ["*", ""],
  ["0", "+"],
  ["#", ""],
];

export function Dialpad({
  value,
  onChange,
  onCall,
  onHangUp,
  onDigit,
  callerId,
  status,
  busy,
  disabled,
  seconds,
}: {
  value: string;
  // A setter rather than a plain callback: keys pressed faster than React
  // re-renders would otherwise each append to the same stale value, and only
  // the last one would survive.
  onChange: React.Dispatch<React.SetStateAction<string>>;
  onCall: () => void;
  onHangUp: () => void;
  /** Live call only: send this digit as a touch tone. */
  onDigit: (digit: string) => boolean;
  callerId: string | null;
  status: string;
  busy: boolean;
  disabled: boolean;
  seconds: number;
}) {
  const check = checkPhone(value);
  const canCall = !disabled && !busy && check.textable;

  function press(key: string) {
    // Mid-call the keypad stops being a composer and becomes a tone pad, so a
    // stray keypress can't quietly rewrite the number being dialled.
    if (busy) {
      onDigit(key);
      return;
    }
    onChange((current) => current + key);
  }

  function backspace() {
    if (busy) return;
    onChange((current) => current.slice(0, -1));
  }

  const timer = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-3">
      {/* Readout */}
      <div className="min-h-14 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2">
        <p
          className={cn(
            "truncate text-right text-xl font-semibold tabular-nums",
            !value && "text-[var(--muted)]",
          )}
        >
          {value ? check.national || value : "Enter a number"}
        </p>
        <p className="mt-0.5 truncate text-right text-[11px] text-[var(--muted)]">
          {busy
            ? `${status === "on-call" ? timer : status === "ringing" ? "Ringing" : "Connecting"} · keys send tones`
            : callerId
              ? `From ${checkPhone(callerId).national || callerId}`
              : "No number connected"}
        </p>
      </div>

      {/* Keys */}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map(([key, letters]) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            disabled={disabled}
            aria-label={busy ? `Send tone ${key}` : `Dial ${key}`}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] transition",
              "hover:border-[var(--accent)]/50 hover:bg-[var(--surface-strong)] active:scale-95",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            <span className="text-lg font-semibold leading-none">{key}</span>
            {letters ? (
              <span className="mt-0.5 text-[9px] font-medium tracking-widest text-[var(--muted)]">{letters}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Call / hang up */}
      <div className="flex items-center gap-2">
        {busy ? (
          <button
            type="button"
            onClick={onHangUp}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95"
          >
            <PhoneOff className="h-4 w-4" />
            Hang up
          </button>
        ) : (
          <button
            type="button"
            onClick={onCall}
            disabled={!canCall}
            className={cn(
              "flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition active:scale-95",
              canCall
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "cursor-not-allowed bg-[var(--surface-strong)] text-[var(--muted)]",
            )}
          >
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
            Call
          </button>
        )}
        <button
          type="button"
          onClick={backspace}
          disabled={busy || !value}
          aria-label="Delete last digit"
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--border)] transition",
            "hover:bg-[var(--surface-strong)] active:scale-95",
            "disabled:pointer-events-none disabled:opacity-30",
          )}
        >
          <Delete className="h-4 w-4" />
        </button>
      </div>

      {value && !check.textable ? (
        <p className="text-xs leading-5 text-amber-600 dark:text-amber-400">{check.reason}</p>
      ) : null}
    </div>
  );
}
