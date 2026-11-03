import Link from "next/link";
import { ArrowRight, Inbox, Star } from "lucide-react";
import type { TenantContext } from "@/lib/tenant/context";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, CardBody, CardHeader, CardTitle, Empty, Stat, StatGrid, buttonClass } from "@/components/ui";
import { relative } from "@/lib/utils";
import { MODULES } from "@/modules/registry";

/**
 * The home screen. One greeting, a "needs you" strip, four figures, then
 * what moved recently. Everything above the fold on a laptop. The accent
 * only appears where something is waiting on the client.
 */
export async function OverviewPage({ tenant }: { tenant: TenantContext }) {
  const supabase = await createClient();
  const ws = tenant.workspace.id;
  const since30 = new Date(Date.now() - 30 * 864e5).toISOString();

  const [requests, waiting, leads, reviews, snapshot, events, recent] = await Promise.all([
    supabase.from("requests").select("id", { count: "exact", head: true }).eq("workspace_id", ws).in("status", ["submitted", "in_review", "in_progress", "awaiting_client", "delivered"]),
    supabase.from("requests").select("id, number, title, updated_at").eq("workspace_id", ws).eq("status", "awaiting_client").order("updated_at", { ascending: false }).limit(3),
    supabase.from("contacts").select("id", { count: "exact", head: true }).eq("workspace_id", ws).gte("created_at", since30),
    supabase.from("reviews").select("rating", { count: "exact" }).eq("workspace_id", ws).gte("posted_at", since30),
    supabase.from("gbp_snapshots").select("rating, review_count").eq("workspace_id", ws).order("day", { ascending: false }).limit(1).maybeSingle(),
    Promise.resolve({ data: [] as { id: string; title: string; starts_at: string }[] }),
    supabase.from("requests").select("id, number, title, status, updated_at").eq("workspace_id", ws).order("updated_at", { ascending: false }).limit(5),
  ]);

  const needsYou = waiting.data ?? [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = tenant.user.name.split(" ")[0];
  const avg = reviews.data?.length ? reviews.data.reduce((a, r) => a + (r.rating ?? 0), 0) / reviews.data.length : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl">
          {greeting}, {firstName}.
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {needsYou.length === 0 ? "Nothing needs you right now." : `${needsYou.length} thing${needsYou.length === 1 ? "" : "s"} waiting on you.`}
        </p>
      </div>

      {needsYou.length > 0 ? (
        <Card className="border-accent-border bg-accent-subtle/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-accent" /> Waiting on you
            </CardTitle>
          </CardHeader>
          <ul className="divide-y divide-border">
            {needsYou.map((r) => (
              <li key={r.id}>
                <Link href={`/w/${tenant.workspace.slug}/requests/${r.id}`} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover">
                  <span className="font-mono text-xs text-text-faint">#{r.number}</span>
                  <span className="flex-1 truncate">{r.title}</span>
                  <span className="text-xs text-text-muted">{relative(r.updated_at)}</span>
                  <ArrowRight className="size-4 text-text-faint" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <StatGrid>
        <Stat label="Open requests" value={requests.count ?? 0} hint="with ArkiTech" />
        <Stat label="New leads" value={leads.count ?? 0} hint="last 30 days" />
        <Stat label="Google rating" value={snapshot.data?.rating ?? "–"} hint={snapshot.data?.review_count ? `${snapshot.data.review_count} reviews` : "not connected yet"} />
        <Stat label="New reviews" value={reviews.count ?? 0} hint={avg ? `${avg.toFixed(1)} average, 30 days` : "last 30 days"} />
      </StatGrid>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent requests</CardTitle>
            <Link href={`/w/${tenant.workspace.slug}/requests`} className={buttonClass("ghost", "sm")}>
              All requests <ArrowRight />
            </Link>
          </CardHeader>
          {recent.data?.length ? (
            <ul className="divide-y divide-border border-t border-border">
              {recent.data.map((r) => (
                <li key={r.id}>
                  <Link href={`/w/${tenant.workspace.slug}/requests/${r.id}`} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface-hover">
                    <span className="font-mono text-xs text-text-faint">#{r.number}</span>
                    <span className="flex-1 truncate">{r.title}</span>
                    <RequestStatus status={r.status} />
                    <span className="hidden text-xs text-text-muted sm:block">{relative(r.updated_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <CardBody>
              <Empty icon={Inbox} title="No requests yet." body="Send us work, a change, or a question." action={<Link href={`/w/${tenant.workspace.slug}/requests?new=1`} className={buttonClass("primary", "sm")}>New request</Link>} />
            </CardBody>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          {tenant.has("calendar") ? (
            <Card>
              <CardHeader>
                <CardTitle>Coming up</CardTitle>
              </CardHeader>
              <CardBody>
                {events.data?.length ? (
                  <ul className="flex flex-col gap-2 text-sm">
                    {events.data.map((e) => (
                      <li key={e.id} className="flex items-start gap-2">
                        <span className="tnum mt-0.5 font-mono text-xs text-text-muted">{new Date(e.starts_at).toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</span>
                        <span className="truncate">{e.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-muted">Nothing scheduled.</p>
                )}
              </CardBody>
            </Card>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="size-4 text-text-faint" /> Your team at ArkiTech
              </CardTitle>
            </CardHeader>
            <CardBody className="text-sm text-text-muted">
              Terri looks after your account and replies the same day. Ashish builds everything we ship.
              <div className="mt-3">
                <Link href={`/w/${tenant.workspace.slug}/requests?new=1`} className={buttonClass("secondary", "sm")}>
                  Ask for something
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {!tenant.isStaff && MODULES.some((m) => m.kind === "addon" && !tenant.has(m.key)) ? (
        <p className="text-xs text-text-faint">
          Want more?{" "}
          <Link href={`/w/${tenant.workspace.slug}/billing`} className="text-accent-text underline-offset-4 hover:underline">
            See the add-ons
          </Link>
          , $50 a month each.
        </p>
      ) : null}
    </div>
  );
}

export function RequestStatus({ status }: { status: string }) {
  const map: Record<string, { label: string; tone: "neutral" | "accent" | "success" | "warning" | "danger" }> = {
    draft: { label: "Draft", tone: "neutral" },
    submitted: { label: "Received", tone: "neutral" },
    in_review: { label: "Being reviewed", tone: "neutral" },
    in_progress: { label: "We're on it", tone: "neutral" },
    awaiting_client: { label: "Waiting on you", tone: "accent" },
    delivered: { label: "Ready for review", tone: "accent" },
    completed: { label: "Done", tone: "success" },
    on_hold: { label: "On hold", tone: "warning" },
    cancelled: { label: "Cancelled", tone: "neutral" },
  };
  const s = map[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}
