import { redirect } from "next/navigation";
import { AppShell } from "@/components/crm/app-shell";
import { StaleShiftGate } from "@/components/crm/stale-shift-gate";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { canAccessColdCall } from "@/lib/cold-call-access";
import { prisma } from "@/lib/prisma";

/**
 * A shift still running after this long was forgotten, not worked. Nobody sits
 * at a desk for nine hours without a break in the clock, so past this point we
 * stop trusting the running timer and make them say when they actually stopped.
 */
const STALE_SHIFT_HOURS = 8;

// Reading the clock lives out here rather than in the component body. This is a
// server component so it runs once per request either way, but the purity lint
// cannot tell server from client and flags a bare Date.now() during render.
function staleBefore() {
  return new Date(Date.now() - STALE_SHIFT_HOURS * 60 * 60 * 1000);
}

function describeOpenFor(startedAt: Date) {
  const hours = Math.floor((Date.now() - startedAt.getTime()) / (60 * 60 * 1000));
  return hours < 48 ? `${hours} hours` : `${Math.floor(hours / 24)} days`;
}

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Gate the whole CRM, not just the dashboard, or the clock gets skipped by
  // anyone who lands on /leads first.
  if (isOwner(user)) {
    const staleShift = await prisma.ownerWorkLog.findFirst({
      where: {
        userId: user.id,
        endedAt: null,
        startedAt: { lt: staleBefore() },
      },
      orderBy: { startedAt: "asc" },
      select: { startedAt: true },
    });

    if (staleShift) {
      return (
        <StaleShiftGate
          entryStartedAt={staleShift.startedAt.toISOString()}
          userName={user.name.split(" ")[0]}
          openForLabel={describeOpenFor(staleShift.startedAt)}
        />
      );
    }
  }

  const coldCallAllowed = await canAccessColdCall(user.id, user.role);

  return (
    <AppShell
      user={{ name: user.name, email: user.email, role: user.role }}
      canAccessColdCall={coldCallAllowed}
    >
      {children}
    </AppShell>
  );
}
