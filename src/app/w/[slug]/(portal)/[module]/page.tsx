import { notFound } from "next/navigation";
import { Hammer } from "lucide-react";
import { MODULES } from "@/modules/registry";
import { requireModule } from "@/lib/tenant/context";
import { Empty, PageHeader } from "@/components/ui";

/**
 * Fallback for a module whose pages haven't been built yet. A real module
 * adds src/app/w/[slug]/(portal)/<path>/page.tsx, which wins over this.
 */
export default async function ModulePlaceholder({ params }: { params: Promise<{ slug: string; module: string }> }) {
  const { slug, module } = await params;
  const m = MODULES.find((x) => x.path === `/${module}`);
  if (!m) notFound();
  await requireModule(slug, m.key);
  return (
    <>
      <PageHeader title={m.label} description={m.blurb} />
      <Empty icon={Hammer} title="This module is being built." body="It will appear here as soon as it ships." />
    </>
  );
}
