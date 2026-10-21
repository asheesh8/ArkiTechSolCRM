"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CTA_LABEL } from "@/lib/marketing/site";

type ContactState = { isOpen: boolean; open: () => void; close: () => void };

const ContactContext = createContext<ContactState>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

/**
 * One get-started form for the whole site. The nav, the hero, the pricing
 * cards and the closing band all open the same one, so there is a single
 * place that talks to /api/contact.
 */
export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

export function useContact() {
  return useContext(ContactContext);
}

/** For server components that need a button which opens the dialog. */
export function ContactButton({
  className = "ak-btn ak-btn-primary",
  children = CTA_LABEL,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const { open } = useContact();
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}
