"use client";
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * Detail panel. On desktop it slides in from the right over the page; on
 * phones it is a full-height sheet. Pages render the same content either way.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  width = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "md" | "lg";
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button aria-label="Close" className="fade-in absolute inset-0 bg-neutral-12/30" onClick={onClose} />
      <div
        className={cn(
          "relative flex h-full w-full flex-col border-l border-border bg-surface shadow-lg sm:max-w-[min(100%,var(--w))]",
          width === "lg" ? "[--w:720px]" : "[--w:520px]",
          "animate-[sheet-in_240ms_var(--ease-out)_both]",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="min-w-0 truncate text-sm font-semibold">{title}</div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer ? <div className="shrink-0 border-t border-border px-4 py-3">{footer}</div> : null}
      </div>
      <style>{`@keyframes sheet-in{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  );
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <button aria-label="Close" className="fade-in absolute inset-0 bg-neutral-12/30" onClick={onClose} />
      <div className="rise-in relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-lg border border-border bg-surface shadow-lg sm:rounded-lg">
        {title ? <div className="border-b border-border px-5 py-4 text-md font-semibold">{title}</div> : null}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}
