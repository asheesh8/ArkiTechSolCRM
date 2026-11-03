import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { TenantContext } from "@/lib/tenant/context";

export type OnboardingState = {
  step: string;
  answers: Record<string, unknown>;
  business: {
    name: string;
    legalName: string;
    website: string;
    phone: string;
    industry: string;
    gbpUrl: string;
    address: { line1?: string; city?: string; state?: string; zip?: string };
  };
  accent: string;
  logoUrl: string | null;
  workspaceId: string;
  catalog: { key: string; name: string; blurb: string; monthlyCents: number; metered: unknown; kind: string }[];
  selectedAddons: string[];
  automations: { key: string; name: string; blurb: string; monthlyCents: number; included: boolean }[];
  sms: { status: string; business: Record<string, unknown>; contact: Record<string, unknown>; campaign: Record<string, unknown>; authorized: boolean } | null;
};

export async function loadOnboarding(tenant: TenantContext): Promise<OnboardingState> {
  const supabase = await createClient();
  const ws = tenant.workspace;
  const [{ data: mods }, { data: autos }, { data: sms }] = await Promise.all([
    supabase.from("modules").select("key, name, blurb, kind, monthly_cents, metered").eq("kind", "addon").eq("active", true).order("sort"),
    supabase.from("automations").select("key, name, blurb, monthly_cents, included").eq("active", true).order("sort"),
    supabase.from("sms_registrations").select("status, business, contact, campaign, consent").eq("workspace_id", ws.id).maybeSingle(),
  ]);
  const onboarding = (ws.onboarding ?? {}) as { step?: string; answers?: Record<string, unknown> };
  return {
    step: onboarding.step ?? "welcome",
    answers: onboarding.answers ?? {},
    business: {
      name: ws.name,
      legalName: ws.legal_name ?? "",
      website: ws.website ?? "",
      phone: ws.phone ?? "",
      industry: ws.industry ?? "",
      gbpUrl: ws.gbp_url ?? "",
      address: (ws.address ?? {}) as OnboardingState["business"]["address"],
    },
    accent: tenant.theme.accent ?? "#eaa14d",
    logoUrl: tenant.theme.logoUrl ?? null,
    workspaceId: ws.id,
    catalog: (mods ?? []).map((m) => ({ key: m.key, name: m.name, blurb: m.blurb, monthlyCents: m.monthly_cents, metered: m.metered, kind: m.kind })),
    selectedAddons: tenant.moduleRows.filter((r) => r.status === "active" || r.status === "trial").map((r) => r.module_key),
    automations: (autos ?? []).map((a) => ({ key: a.key, name: a.name, blurb: a.blurb, monthlyCents: a.monthly_cents, included: a.included })),
    sms: sms
      ? {
          status: sms.status,
          business: sms.business as Record<string, unknown>,
          contact: sms.contact as Record<string, unknown>,
          campaign: sms.campaign as Record<string, unknown>,
          authorized: Boolean((sms.consent as { authorized?: boolean })?.authorized),
        }
      : null,
  };
}
