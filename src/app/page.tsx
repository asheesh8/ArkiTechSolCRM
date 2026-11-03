import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getStaff, getUser } from "@/lib/tenant/context";
import { Lockup } from "@/components/ui/brand";
import { buttonClass } from "@/components/ui";

/**
 * The root host. A person with one workspace goes straight to it; with
 * several they pick; staff go to the console. Nobody sees a marketing page
 * here; that is arkitech-sol.com's job.
 */
export default async function RootPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  const [{ data: workspaces }, staff] = await Promise.all([
    supabase.from("workspaces").select("slug, name, theme").order("name"),
    getStaff(),
  ]);
  const list = workspaces ?? [];
  if (staff && list.length === 0) redirect("/admin");
  if (!staff && list.length === 1) redirect(`/w/${list[0]!.slug}`);
  if (!staff && list.length === 0) redirect("/new");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12">
      <Lockup className="mb-8" />
      <h1 className="font-serif text-2xl">Where to?</h1>
      <p className="mb-6 mt-1 text-sm text-text-muted">Pick a workspace.</p>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {list.map((w) => (
          <li key={w.slug}>
            <Link href={`/w/${w.slug}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-hover">
              <span className="flex size-7 items-center justify-center rounded-sm bg-accent-subtle text-xs font-semibold text-accent-text">{w.name[0]}</span>
              <span className="flex-1 font-medium">{w.name}</span>
              <ArrowRight className="size-4 text-text-faint" />
            </Link>
          </li>
        ))}
      </ul>
      {staff ? (
        <Link href="/admin" className={buttonClass("secondary", "md", "mt-4 self-start")}>
          ArkiTech console
        </Link>
      ) : null}
    </main>
  );
}
