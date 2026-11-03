import { redirect } from "next/navigation";
import { getTenant } from "@/lib/tenant/context";
import { Onboarding } from "@/modules/onboarding/onboarding";
import { loadOnboarding } from "@/modules/onboarding/queries";

export const metadata = { title: "Welcome" };

export default async function OnboardingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = await getTenant(slug);
  if (tenant.workspace.onboarding_completed_at) redirect(`/w/${slug}`);
  const state = await loadOnboarding(tenant);
  return <Onboarding slug={slug} initial={state} userName={tenant.user.name} />;
}
