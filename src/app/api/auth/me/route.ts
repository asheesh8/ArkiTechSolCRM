import { NextResponse } from "next/server";
import { getCurrentUser, isManager } from "@/lib/auth";

// Lightweight "who am I" used by client pages to gate manager-only UI
// (bulk assign, assignee pickers, team overview).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    isManager: isManager(user),
  });
}
