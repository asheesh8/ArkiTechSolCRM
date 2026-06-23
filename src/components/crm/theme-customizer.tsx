"use client";

import { useEffect, useState } from "react";
import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const presets = [
  { name: "Sky", accent: "#38bdf8", foreground: "#020617" },
  { name: "Emerald", accent: "#34d399", foreground: "#022c22" },
  { name: "Rose", accent: "#fb7185", foreground: "#450a0a" },
  { name: "Amber", accent: "#f59e0b", foreground: "#1c1917" },
  { name: "Violet", accent: "#a78bfa", foreground: "#1e1b4b" },
  { name: "Slate", accent: "#e5e7eb", foreground: "#09090b" },
];

function applyAccent(accent: string, foreground: string) {
  document.documentElement.style.setProperty("--accent", accent);
  document.documentElement.style.setProperty("--accent-foreground", foreground);
  window.localStorage.setItem("locallead-accent", accent);
  window.localStorage.setItem("locallead-accent-foreground", foreground);
}

export function ThemeCustomizer() {
  const [accent, setAccent] = useState(presets[0].accent);
  const selected = presets.find((preset) => preset.accent.toLowerCase() === accent.toLowerCase());

  useEffect(() => {
    const savedAccent = window.localStorage.getItem("locallead-accent") ?? presets[0].accent;
    const savedForeground = window.localStorage.getItem("locallead-accent-foreground") ?? presets[0].foreground;
    setAccent(savedAccent);
    applyAccent(savedAccent, savedForeground);
  }, []);

  function setPreset(preset: (typeof presets)[number]) {
    setAccent(preset.accent);
    applyAccent(preset.accent, preset.foreground);
  }

  function setCustom(value: string) {
    setAccent(value);
    applyAccent(value, "#ffffff");
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-zinc-500" />
        <p className="text-sm text-zinc-500">Pick the accent used for buttons, active navigation, and pipeline highlights.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {presets.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => setPreset(preset)}
            className={cn(
              "flex items-center justify-between rounded-lg border border-zinc-200 p-3 text-left text-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900",
              selected?.name === preset.name && "ring-2 ring-[var(--accent)]",
            )}
          >
            <span className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: preset.accent }} />
              {preset.name}
            </span>
            {selected?.name === preset.name ? <Check className="h-4 w-4" /> : null}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-[180px_1fr] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="custom-accent">Custom color</Label>
          <input
            id="custom-accent"
            type="color"
            value={accent}
            onChange={(event) => setCustom(event.target.value)}
            className="h-10 w-full rounded-md border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm font-medium">Preview</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button">Primary action</Button>
            <span className="inline-flex h-10 items-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)]">
              Active status
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
