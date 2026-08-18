"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Remember what someone already typed.
//
// The campaign forms are long, and a visitor who leaves to check their own
// website and comes back should not start over. Values are kept in
// localStorage on the visitor's own device and never leave it.
//
// Two things are deliberately never remembered: the honeypot, and consent.
// Restoring a ticked consent box would mean the next submission carries an
// agreement nobody made on that visit — and since the timestamp stored against
// it is what a carrier would be shown, that record has to be true. Consent is
// re-given every time, by design.

type Primitive = string | number | boolean;

function isPrimitive(value: unknown): value is Primitive {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

export function useCachedForm<T extends Record<string, Primitive>>(
  storageKey: string,
  initial: T,
  neverRemember: ReadonlyArray<keyof T>,
) {
  const [form, setForm] = useState<T>(initial);
  // Until the saved values are read, writing would persist the empty initial
  // state straight over them.
  const [restored, setRestored] = useState(false);

  // Captured once, so a caller passing fresh array literals each render
  // doesn't retrigger the effects. Both are fixed per form.
  const initialRef = useRef(initial);
  const omitRef = useRef(neverRemember);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      const saved = raw ? (JSON.parse(raw) as unknown) : null;

      if (saved && typeof saved === "object") {
        const allowed: Partial<T> = {};
        for (const [key, value] of Object.entries(saved as Record<string, unknown>)) {
          // Only fields this form actually declares, of the type it declared
          // them as. Anything else is stale or tampered with, and is dropped.
          const expected = initialRef.current[key as keyof T];
          if (expected === undefined) continue;
          if (omitRef.current.includes(key as keyof T)) continue;
          if (!isPrimitive(value) || typeof value !== typeof expected) continue;
          allowed[key as keyof T] = value as T[keyof T];
        }
        if (Object.keys(allowed).length > 0) {
          setForm((current) => ({ ...current, ...allowed }));
        }
      }
    } catch {
      // Private browsing, a full quota, or hand-edited JSON. Starting from a
      // blank form is a fine outcome for any of them.
    }
    setRestored(true);
  }, [storageKey]);

  useEffect(() => {
    if (!restored) return;
    try {
      const toSave: Record<string, Primitive> = {};
      for (const [key, value] of Object.entries(form)) {
        if (omitRef.current.includes(key as keyof T)) continue;
        toSave[key] = value;
      }
      window.localStorage.setItem(storageKey, JSON.stringify(toSave));
    } catch {
      // Quota or private mode — not worth interrupting anyone over.
    }
  }, [form, restored, storageKey]);

  const update = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const forget = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Nothing to do — the values simply outlive the visit.
    }
  }, [storageKey]);

  return { form, setForm, update, restored, forget };
}
