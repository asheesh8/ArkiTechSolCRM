/**
 * The module registry: one entry per thing the portal can do.
 *
 * A module is a folder under src/modules/<key>/ with:
 *   manifest.ts   this entry (key, label, icon, nav placement, permission key)
 *   pages         rendered by src/app/w/[slug]/(portal)/<path>/page.tsx, which
 *                 imports from the module folder and calls requireModule()
 *   actions.ts    server actions, each starting with requireModule()
 *   queries.ts    reads, each taking the ServerClient so RLS applies
 *
 * Whether a workspace *has* a module is decided by the workspace_modules
 * table (entitlements), never by the code. The sidebar shows only modules the
 * workspace has; add-ons it doesn't have appear once, on the Billing page, as
 * cards. Staff always see everything.
 */
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bot,
  CalendarDays,
  CreditCard,
  Home,
  Inbox,
  MapPinned,
  MessageSquareText,
  Sparkles,
  Star,
  Wallet,
  Workflow,
} from "lucide-react";

export type ModuleKey =
  | "overview"
  | "requests"
  | "crm"
  | "gbp"
  | "automations"
  | "billing"
  | "calendar"
  | "analytics"
  | "finance"
  | "assistant"
  | "chatbot";

export type ModuleManifest = {
  key: ModuleKey;
  label: string;
  /** Short line under the label on the add-on shelf and in onboarding. */
  blurb: string;
  icon: LucideIcon;
  /** Path under the workspace root. */
  path: string;
  /** core modules come with the plan; add-ons are bought on Billing. */
  kind: "core" | "addon";
  /** Where it sits in the sidebar; "more" lands behind the phone's More tab. */
  nav: "primary" | "secondary" | "hidden";
  /** Permission key checked by can_write() in Postgres and by requireModule(). */
  permission: string;
};

export const MODULES: readonly ModuleManifest[] = [
  { key: "overview", label: "Overview", blurb: "What needs you, and how the business is doing.", icon: Home, path: "", kind: "core", nav: "primary", permission: "overview" },
  { key: "requests", label: "Requests", blurb: "Send work and change requests, upload files, follow progress.", icon: Inbox, path: "/requests", kind: "core", nav: "primary", permission: "requests" },
  { key: "crm", label: "CRM & Map", blurb: "Your customers and leads on a board, a list and a map.", icon: MapPinned, path: "/crm", kind: "core", nav: "primary", permission: "crm" },
  { key: "gbp", label: "Google Profile", blurb: "Reviews, visibility and review requests, managed by ArkiTech.", icon: Star, path: "/google", kind: "core", nav: "primary", permission: "gbp" },
  { key: "calendar", label: "Scheduling", blurb: "Every calendar you use, synced into one.", icon: CalendarDays, path: "/calendar", kind: "addon", nav: "primary", permission: "calendar" },
  { key: "analytics", label: "Analytics", blurb: "Google Analytics, Meta and your socials in one view.", icon: BarChart3, path: "/analytics", kind: "addon", nav: "secondary", permission: "analytics" },
  { key: "finance", label: "Finance", blurb: "Quotes, and the money coming in and going out.", icon: Wallet, path: "/finance", kind: "addon", nav: "secondary", permission: "finance" },
  { key: "assistant", label: "AI Assistant", blurb: "Ask about your business; get answers with live charts.", icon: Sparkles, path: "/assistant", kind: "addon", nav: "secondary", permission: "assistant" },
  { key: "chatbot", label: "Website Chatbot", blurb: "Answers visitors on your site and captures leads.", icon: Bot, path: "/chatbot", kind: "addon", nav: "secondary", permission: "chatbot" },
  { key: "automations", label: "Automations", blurb: "Speed-to-lead, missed-call text-back, follow-ups and more.", icon: Workflow, path: "/automations", kind: "core", nav: "secondary", permission: "automations" },
  { key: "billing", label: "Billing", blurb: "Your plan, add-ons and invoices.", icon: CreditCard, path: "/billing", kind: "core", nav: "secondary", permission: "billing" },
] as const;

export const MODULE_BY_KEY: Record<ModuleKey, ModuleManifest> = Object.fromEntries(
  MODULES.map((m) => [m.key, m]),
) as Record<ModuleKey, ModuleManifest>;

export function moduleHref(slug: string, key: ModuleKey, sub = "") {
  return `/w/${slug}${MODULE_BY_KEY[key].path}${sub}`;
}

/** Keep the icon for "Messages"-style secondary surfaces consistent. */
export const ICONS = { comment: MessageSquareText };
