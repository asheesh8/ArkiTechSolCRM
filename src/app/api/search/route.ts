import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** ⌘K search across a workspace. RLS keeps it to the caller's rows. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const slug = request.nextUrl.searchParams.get("ws") ?? "";
  if (q.length < 2 || !slug) return NextResponse.json({ items: [] });
  const supabase = await createClient();
  const { data: ws } = await supabase.from("workspaces").select("id").eq("slug", slug).maybeSingle();
  if (!ws) return NextResponse.json({ items: [] });
  const like = `%${q.replace(/[%_]/g, "")}%`;
  const [contacts, requests, invoices] = await Promise.all([
    supabase.from("contacts").select("id, first_name, last_name, company").eq("workspace_id", ws.id).or(`first_name.ilike.${like},last_name.ilike.${like},company.ilike.${like},email.ilike.${like}`).limit(5),
    supabase.from("requests").select("id, number, title").eq("workspace_id", ws.id).ilike("title", like).limit(5),
    supabase.from("invoices").select("id, number, description").eq("workspace_id", ws.id).ilike("description", like).limit(3),
  ]);
  const items = [
    ...(contacts.data ?? []).map((c) => ({ key: `c-${c.id}`, label: [c.first_name, c.last_name].filter(Boolean).join(" ") || c.company || "Contact", hint: c.company ?? "Contact", href: `/w/${slug}/crm/${c.id}`, group: "Go to" })),
    ...(requests.data ?? []).map((r) => ({ key: `r-${r.id}`, label: r.title, hint: `Request #${r.number}`, href: `/w/${slug}/requests/${r.id}`, group: "Go to" })),
    ...(invoices.data ?? []).map((i) => ({ key: `i-${i.id}`, label: i.description ?? `Invoice #${i.number}`, hint: `Invoice #${i.number}`, href: `/w/${slug}/billing?invoice=${i.id}`, group: "Go to" })),
  ];
  return NextResponse.json({ items });
}
