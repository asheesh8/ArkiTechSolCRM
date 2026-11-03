"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getTenant } from "@/lib/tenant/context";
import { createClient } from "@/lib/supabase/server";
import { audit, fail, ok, parseInput, type ActionResult } from "@/lib/actions";
import { CONSENT_VERSION, consentText } from "./consent";

async function adminTenant(slug: string) {
  const tenant = await getTenant(slug);
  if (!tenant.isStaff && tenant.role !== "owner" && tenant.role !== "admin") throw new Error("Only an owner or admin can set up the workspace.");
  return tenant;
}

const businessSchema = z.object({
  name: z.string().trim().min(1, "Tell us what to call the business").max(80),
  legalName: z.string().trim().max(120).optional().default(""),
  website: z.string().trim().max(200).optional().default(""),
  phone: z.string().trim().max(30).optional().default(""),
  industry: z.string().trim().max(60).optional().default(""),
  gbpUrl: z.string().trim().max(300).optional().default(""),
  line1: z.string().trim().max(120).optional().default(""),
  city: z.string().trim().max(60).optional().default(""),
  state: z.string().trim().max(30).optional().default(""),
  zip: z.string().trim().max(12).optional().default(""),
});

/** Step: business details. Saves to the workspace row, remembers where we are. */
export async function saveBusiness(slug: string, input: unknown): Promise<ActionResult> {
  const tenant = await adminTenant(slug);
  const p = parseInput(businessSchema, input);
  if (!p.ok) return p;
  const d = p.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("workspaces")
    .update({
      name: d.name,
      legal_name: d.legalName || null,
      website: d.website || null,
      phone: d.phone || null,
      industry: d.industry || null,
      gbp_url: d.gbpUrl || null,
      address: { line1: d.line1, city: d.city, state: d.state, zip: d.zip },
      onboarding: { ...(tenant.workspace.onboarding as object), step: "brand" },
    })
    .eq("id", tenant.workspace.id);
  if (error) return fail("Couldn't save. Try again.");
  return ok(undefined);
}

const brandSchema = z.object({
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit colour like #1f6f8b"),
  logoUrl: z.string().url().optional().nullable(),
});

export async function saveBrand(slug: string, input: unknown): Promise<ActionResult> {
  const tenant = await adminTenant(slug);
  const p = parseInput(brandSchema, input);
  if (!p.ok) return p;
  const supabase = await createClient();
  const theme = { ...tenant.theme, accent: p.data.accent, ...(p.data.logoUrl ? { logoUrl: p.data.logoUrl } : {}) };
  const { error } = await supabase
    .from("workspaces")
    .update({ theme, onboarding: { ...(tenant.workspace.onboarding as object), step: "services" } })
    .eq("id", tenant.workspace.id);
  if (error) return fail("Couldn't save. Try again.");
  return ok(undefined);
}

const servicesSchema = z.object({ addons: z.array(z.string()).max(20), automations: z.array(z.string()).max(20) });

/**
 * Step: add-ons and automations. Idempotent: the rows are keyed by
 * (workspace, key), so saving twice changes nothing. New picks start as a
 * 14-day trial; the billing module turns a trial into a Stripe item.
 */
export async function saveServices(slug: string, input: unknown): Promise<ActionResult<{ wantsRetainer: boolean }>> {
  const tenant = await adminTenant(slug);
  const p = parseInput(servicesSchema, input);
  if (!p.ok) return p;
  const supabase = await createClient();
  const ws = tenant.workspace.id;

  const { data: catalog } = await supabase.from("modules").select("key").eq("kind", "addon").eq("active", true);
  const { data: autos } = await supabase.from("automations").select("key, included").eq("active", true);
  const validAddons = new Set((catalog ?? []).map((m) => m.key));
  const validAutos = new Map((autos ?? []).map((a) => [a.key, a.included]));
  const wantAddons = p.data.addons.filter((k) => validAddons.has(k));
  const wantAutos = p.data.automations.filter((k) => validAutos.has(k) && !validAutos.get(k));

  const existingMods = new Map(tenant.moduleRows.map((r) => [r.module_key, r]));
  const trialEnds = new Date(Date.now() + 14 * 864e5).toISOString();
  const addRows = wantAddons.filter((k) => !existingMods.has(k)).map((k) => ({ workspace_id: ws, module_key: k, status: "trial" as const, trial_ends_at: trialEnds }));
  if (addRows.length) {
    const { error } = await supabase.from("workspace_modules").upsert(addRows, { onConflict: "workspace_id,module_key", ignoreDuplicates: true });
    if (error) return fail("Couldn't save your choices. Try again.");
  }
  const autoRows = wantAutos.map((k) => ({ workspace_id: ws, automation_key: k, status: "active" as const }));
  if (autoRows.length) {
    const { error } = await supabase.from("workspace_automations").upsert(autoRows, { onConflict: "workspace_id,automation_key", ignoreDuplicates: true });
    if (error) return fail("Couldn't save your choices. Try again.");
  }
  const wantsRetainer = wantAutos.includes("review_retainer");
  await supabase
    .from("workspaces")
    .update({ onboarding: { ...(tenant.workspace.onboarding as object), step: wantsRetainer ? "retainer" : "done", answers: { wantsRetainer } } })
    .eq("id", ws);
  await audit(ws, "onboarding.services", "workspace", ws, { addons: wantAddons, automations: wantAutos });
  return ok({ wantsRetainer });
}

const smsSchema = z.object({
  hasEin: z.boolean(),
  legalName: z.string().trim().min(1, "Enter the legal name exactly as on your IRS letter").max(120),
  ein: z.string().trim().regex(/^(\d{2}-?\d{7})?$/, "EIN looks like 12-3456789").optional().default(""),
  entityType: z.string().min(1),
  industry: z.string().trim().min(1, "Choose an industry").max(60),
  website: z.string().trim().url("Enter your full website address, starting with https://"),
  line1: z.string().trim().min(1, "Required").max(120),
  city: z.string().trim().min(1, "Required").max(60),
  state: z.string().trim().min(2, "Required").max(30),
  zip: z.string().trim().min(3, "Required").max(12),
  contactName: z.string().trim().min(1, "Required").max(80),
  contactTitle: z.string().trim().min(1, "Required").max(60),
  contactEmail: z.string().trim().email("Use a business email, like you@yourcompany.com"),
  contactPhone: z.string().trim().min(7, "Required").max(30),
  useCase: z.string().min(1),
  description: z.string().trim().min(40, "A sentence or two, at least 40 characters").max(500),
  optInFlow: z.string().trim().min(40, "Describe how customers say yes to texts, at least 40 characters").max(800),
  sample1: z.string().trim().min(20, "Write a real example message").max(320),
  sample2: z.string().trim().max(320).optional().default(""),
  privacyUrl: z.string().trim().url("Enter the full link to your privacy policy"),
  termsUrl: z.string().trim().url("Enter the full link to your SMS terms"),
});

export type SmsInput = z.infer<typeof smsSchema>;

/** Save the retainer details as a draft (no authorization yet). */
export async function saveSmsDraft(slug: string, input: unknown): Promise<ActionResult> {
  const tenant = await adminTenant(slug);
  const p = parseInput(smsSchema.partial(), input);
  if (!p.ok) return p;
  const d = p.data;
  const supabase = await createClient();
  const { data: existing } = await supabase.from("sms_registrations").select("id, status").eq("workspace_id", tenant.workspace.id).maybeSingle();
  if (existing && existing.status !== "draft" && existing.status !== "rejected") return fail("This registration was already submitted.");
  const row = {
    workspace_id: tenant.workspace.id,
    business: { legalName: d.legalName, ein: d.ein, hasEin: d.hasEin, entityType: d.entityType, industry: d.industry, website: d.website, address: { line1: d.line1, city: d.city, state: d.state, zip: d.zip } },
    contact: { name: d.contactName, title: d.contactTitle, email: d.contactEmail, phone: d.contactPhone },
    campaign: { useCase: d.useCase, description: d.description, optInFlow: d.optInFlow, sampleMessages: [d.sample1, d.sample2].filter(Boolean), privacyUrl: d.privacyUrl, termsUrl: d.termsUrl },
  };
  const { error } = await supabase.from("sms_registrations").upsert(row as never, { onConflict: "workspace_id" });
  if (error) return fail("Couldn't save your progress.");
  return ok(undefined);
}

const authorizeSchema = z.object({
  agree: z.literal(true, { message: "Tick the box to authorize" }),
  signedName: z.string().trim().min(3, "Type your full name"),
  signedTitle: z.string().trim().min(2, "Type your title"),
});

/**
 * The authorization. Validates everything again server-side, stores the
 * exact wording, who signed, when, from where, and moves the registration to
 * "submitted". A signed authorization is never overwritten.
 */
export async function authorizeSms(slug: string, details: unknown, signature: unknown): Promise<ActionResult> {
  const tenant = await adminTenant(slug);
  const full = parseInput(smsSchema, details);
  if (!full.ok) return full;
  const sig = parseInput(authorizeSchema, signature);
  if (!sig.ok) return sig;
  const d = full.data;

  const supabase = await createClient();
  const { data: existing } = await supabase.from("sms_registrations").select("consent, status").eq("workspace_id", tenant.workspace.id).maybeSingle();
  if ((existing?.consent as { authorized?: boolean } | undefined)?.authorized) return fail("This registration was already authorized.");

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
  const text = consentText(d.legalName);
  const now = new Date().toISOString();
  const row = {
    workspace_id: tenant.workspace.id,
    status: "submitted" as const,
    business: { legalName: d.legalName, ein: d.ein, hasEin: d.hasEin, entityType: d.entityType, industry: d.industry, website: d.website, address: { line1: d.line1, city: d.city, state: d.state, zip: d.zip } },
    contact: { name: d.contactName, title: d.contactTitle, email: d.contactEmail, phone: d.contactPhone },
    campaign: { useCase: d.useCase, description: d.description, optInFlow: d.optInFlow, sampleMessages: [d.sample1, d.sample2].filter(Boolean), privacyUrl: d.privacyUrl, termsUrl: d.termsUrl },
    consent: { authorized: true, name: sig.data.signedName, title: sig.data.signedTitle, at: now, ip, userAgent: h.get("user-agent") ?? "", version: CONSENT_VERSION, text, userId: tenant.user.id },
    submitted_at: now,
  };
  const { error } = await supabase.from("sms_registrations").upsert(row as never, { onConflict: "workspace_id" });
  if (error) return fail("Couldn't submit the registration. Nothing was sent; try again.");

  await supabase.from("notifications").insert({ workspace_id: tenant.workspace.id, user_id: null, kind: "sms", title: "Text messaging registration submitted", body: "We'll update you as carriers review it.", href: `/w/${slug}/automations` });
  await audit(tenant.workspace.id, "sms.authorized", "sms_registration", tenant.workspace.id, { signedBy: sig.data.signedName });
  await supabase.from("workspaces").update({ onboarding: { ...(tenant.workspace.onboarding as object), step: "done" } }).eq("id", tenant.workspace.id);
  return ok(undefined);
}

/** Finish: the workspace opens. Safe to call twice. */
export async function completeOnboarding(slug: string): Promise<ActionResult> {
  const tenant = await adminTenant(slug);
  if (tenant.workspace.onboarding_completed_at) return ok(undefined);
  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").update({ onboarding_completed_at: new Date().toISOString() }).eq("id", tenant.workspace.id);
  if (error) return fail("Couldn't finish. Try again.");
  await audit(tenant.workspace.id, "onboarding.completed", "workspace", tenant.workspace.id);
  revalidatePath(`/w/${slug}`, "layout");
  return ok(undefined);
}
