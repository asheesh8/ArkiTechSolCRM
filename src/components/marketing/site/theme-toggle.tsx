"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "@phosphor-icons/react";

type Theme = "day" | "night";

/**
 * Day / Night. The page is Burlington paper by day and the same town with
 * the lights on at night. The switch wipes outward from the button itself
 * (View Transitions), and falls back to a plain swap where that is missing.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("day");

  useEffect(() => {
    setTheme((document.documentElement.dataset.arkTheme as Theme) || "day");
  }, []);

  function apply(next: Theme) {
    document.documentElement.dataset.arkTheme = next;
    try {
      localStorage.setItem("ark-theme", next);
    } catch {}
    setTheme(next);
  }

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = theme === "day" ? "night" : "day";
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduce) {
      apply(next);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const root = document.documentElement;
    root.style.setProperty("--vt-x", `${rect.left + rect.width / 2}px`);
    root.style.setProperty("--vt-y", `${rect.top + rect.height / 2}px`);
    doc.startViewTransition(() => apply(next));
  }

  const label = theme === "day" ? "Switch to Night" : "Switch to Day";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center border border-[var(--rule-strong)] text-[var(--fg)] transition-colors duration-200 hover:border-[var(--lamp)] hover:text-[var(--accent-text)] ${className}`}
    >
      {theme === "day" ? <Moon size={17} weight="regular" /> : <Sun size={18} weight="regular" />}
    </button>
  );
}
