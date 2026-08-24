import type { DemoSubmission, User } from "@prisma/client";
import { PAGESPEED_FLOOR } from "@/lib/demo-briefs";

/**
 * Shared shape and rules for demo submissions.
 *
 * Kept out of the route handlers because the same two questions — "can this
 * person touch this row" and "is this row ready to move on" — are asked by five
 * different endpoints, and answering them inconsistently is how a developer
 * ends up able to edit somebody else's build.
 */

export type DemoWithDev = DemoSubmission & { developer: Pick<User, "id" | "name" | "email"> };

/** BigInt does not survive JSON.stringify, so zipSize goes out as a string. */
export function serializeDemo(demo: DemoWithDev) {
  return {
    ...demo,
    zipSize: demo.zipSize == null ? null : demo.zipSize.toString(),
  };
}

/** A developer sees only their own builds; an owner sees every one. */
export function canView(demo: { developerId: string }, user: { id: string; role?: string | null }) {
  return user.role === "OWNER" || demo.developerId === user.id;
}

/**
 * Editing is the developer's own, and only while it is theirs to change.
 * Once approved or shipped the build is a record, not a draft — including for
 * the owner, who should ship a new version rather than rewrite history.
 */
export function canEdit(
  demo: { developerId: string; status: string },
  user: { id: string; role?: string | null },
) {
  if (demo.status === "APPROVED" || demo.status === "SHIPPED") return false;
  return user.role === "OWNER" || demo.developerId === user.id;
}

/** What is still missing before this can be submitted for review. */
export function blockersFor(demo: {
  previewUrl: string | null;
  zipKey: string | null;
  title: string;
}): string[] {
  const missing: string[] = [];
  if (!demo.title.trim()) missing.push("a name");
  if (!demo.zipKey) missing.push("the codebase zip");
  if (!demo.previewUrl) missing.push("a live preview link");
  return missing;
}

/** Whether the recorded scores clear the bar the public site promises. */
export function meetsPageSpeedFloor(demo: { mobileScore: number | null; desktopScore: number | null }) {
  if (demo.mobileScore == null) return false;
  return demo.mobileScore >= PAGESPEED_FLOOR;
}

export const DEMO_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "In review",
  CHANGES_REQUESTED: "Changes requested",
  APPROVED: "Approved",
  SHIPPED: "Shipped",
};
