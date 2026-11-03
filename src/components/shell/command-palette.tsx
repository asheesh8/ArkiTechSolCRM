"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/badge";

type Item = { key: string; label: string; href: string; hint?: string; group: "Go to" | "Create" };

/** ⌘K: jump to a module, or start the common things. Search of records comes from /api/search. */
export function CommandPalette({ open, onClose, slug, modules }: { open: boolean; onClose: () => void; slug: string; modules: { key: string; label: string; href: string }[] }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [i, setI] = React.useState(0);
  const [results, setResults] = React.useState<Item[]>([]);
  const input = React.useRef<HTMLInputElement>(null);

  const statics: Item[] = React.useMemo(
    () => [
      ...modules.map((m) => ({ key: m.key, label: m.label, href: m.href, group: "Go to" as const })),
      { key: "new-request", label: "New request", href: `/w/${slug}/requests?new=1`, group: "Create", hint: "Work or a change" },
      { key: "new-contact", label: "New contact", href: `/w/${slug}/crm?new=1`, group: "Create" },
    ],
    [modules, slug],
  );

  React.useEffect(() => {
    if (!open) return;
    setQ("");
    setI(0);
    setTimeout(() => input.current?.focus(), 10);
  }, [open]);

  React.useEffect(() => {
    const term = q.trim().toLowerCase();
    const local = statics.filter((s) => !term || s.label.toLowerCase().includes(term));
    setResults(local);
    setI(0);
    if (term.length < 2) return;
    const ctrl = new AbortController();
    fetch(`/api/search?ws=${slug}&q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items: Item[] }) => setResults([...local, ...d.items]))
      .catch(() => {});
    return () => ctrl.abort();
  }, [q, statics, slug]);

  if (!open) return null;
  const go = (it: Item) => {
    onClose();
    router.push(it.href);
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal>
      <button aria-label="Close" className="fade-in absolute inset-0 bg-neutral-12/30" onClick={onClose} />
      <div className="rise-in relative w-full max-w-lg overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="size-4 text-text-faint" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setI((v) => Math.min(results.length - 1, v + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setI((v) => Math.max(0, v - 1)); }
              if (e.key === "Enter" && results[i]) go(results[i]);
            }}
            placeholder="Search contacts, requests, invoices…"
            className="h-12 flex-1 bg-transparent text-base outline-none placeholder:text-text-faint"
          />
          <Kbd>esc</Kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-1" role="listbox">
          {results.length === 0 ? <li className="px-3 py-6 text-center text-sm text-text-muted">Nothing matches.</li> : null}
          {(["Go to", "Create"] as const).map((group) => {
            const items = results.filter((r) => r.group === group);
            if (!items.length) return null;
            return (
              <li key={group}>
                <div className="px-2 pb-1 pt-2 font-mono text-[10px] uppercase tracking-wider text-text-faint">{group}</div>
                {items.map((it) => {
                  const idx = results.indexOf(it);
                  return (
                    <button
                      key={it.key}
                      onMouseEnter={() => setI(idx)}
                      onClick={() => go(it)}
                      className={cn("flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm", idx === i ? "bg-control-active text-text" : "text-text-muted")}
                      role="option"
                      aria-selected={idx === i}
                    >
                      {group === "Create" ? <Plus className="size-4" /> : <ArrowRight className="size-4" />}
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.hint ? <span className="text-xs text-text-faint">{it.hint}</span> : null}
                      {idx === i ? <CornerDownLeft className="size-3.5 text-text-faint" /> : null}
                    </button>
                  );
                })}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
