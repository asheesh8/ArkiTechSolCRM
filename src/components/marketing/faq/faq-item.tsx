"use client";

import { useId, useState } from "react";
import { Plus } from "@phosphor-icons/react";

export function FaqItem({ question, children, defaultOpen = false }: { question: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="border-b border-[var(--rule)]">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="group flex w-full items-start justify-between gap-6 py-6 text-left"
        >
          <span className="ak-display text-[clamp(1.3rem,2vw,1.65rem)] leading-snug group-hover:text-[var(--accent-text)]">{question}</span>
          <Plus
            size={18}
            aria-hidden="true"
            className={`mt-2 shrink-0 text-[var(--dim)] transition-transform duration-300 ${open ? "rotate-45 text-[var(--accent-text)]" : ""}`}
          />
        </button>
      </h3>
      <div id={id} className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="max-w-[62ch] pb-7 leading-relaxed text-[var(--fg-2)]">{children}</div>
        </div>
      </div>
    </div>
  );
}
