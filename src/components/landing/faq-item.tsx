"use client";

import { useState, type ReactNode } from "react";

/**
 * One FAQ row.
 *
 * Still a real <details>, so the answer is in the DOM for search engines and
 * the row expands with JavaScript off. The only thing React tracks is the
 * marker rotation — `group-open:` doesn't generate in this Tailwind build, and
 * a decorative plus sign isn't worth a custom CSS rule.
 */
export function FaqItem({ index, question, children }: { index: string; question: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <details
      className="border-b"
      style={{ borderColor: "var(--rule)" }}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="flex cursor-pointer list-none items-baseline gap-5 py-6 [&::-webkit-details-marker]:hidden">
        <span className="figure-index shrink-0">{index}</span>
        <span className="d3 flex-1" style={{ fontSize: "clamp(1.1rem, 1.7vw, 1.4rem)" }}>{question}</span>
        <span
          className="shrink-0 text-lg transition-transform duration-200"
          aria-hidden="true"
          style={{ color: "var(--dim)", transform: open ? "rotate(45deg)" : "none" }}
        >
          +
        </span>
      </summary>
      <div
        className="max-w-[62ch] pb-7 pl-0 text-[0.95rem] sm:pl-[3.6rem]"
        style={{ color: "var(--dim)", lineHeight: 1.75 }}
      >
        {children}
      </div>
    </details>
  );
}
