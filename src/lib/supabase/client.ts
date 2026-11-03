"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/db/types";

let browser: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Supabase client for client components (realtime, uploads, optimistic UI). */
export function supabaseBrowser() {
  browser ??= createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return browser;
}
export { supabaseBrowser as createClient };
