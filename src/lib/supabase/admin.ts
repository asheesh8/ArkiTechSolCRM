import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";

/**
 * Service-role client. Bypasses row-level security, so use it only where no
 * user is acting: webhooks, cron, the public chatbot endpoint, provisioning.
 * Every query made with it must filter by workspace_id itself.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
