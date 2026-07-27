import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";
import { generatePassword } from "@/app/api/users/route";

const ROLES = ["OWNER", "DEV", "MEMBER"] as const;

// Change a teammate's role, activate/deactivate them, or reset their password.
// Owner-only, with guards so the workspace can never be left without an owner.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isOwner(currentUser)) return NextResponse.json({ error: "Owner access is required." }, { status: 403 });

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, isActive: true } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const data: { role?: Role; isActive?: boolean; passwordHash?: string } = {};
  let tempPassword: string | undefined;

  const activeOwners = () => prisma.user.count({ where: { role: "OWNER", isActive: true } });

  if (typeof body.role === "string" && (ROLES as readonly string[]).includes(body.role)) {
    if (target.role === "OWNER" && body.role !== "OWNER" && (await activeOwners()) <= 1) {
      return NextResponse.json({ error: "You can't remove the last owner." }, { status: 400 });
    }
    data.role = body.role as Role;
  }

  if (typeof body.isActive === "boolean") {
    if (!body.isActive) {
      if (target.id === currentUser.id) return NextResponse.json({ error: "You can't deactivate yourself." }, { status: 400 });
      if (target.role === "OWNER" && (await activeOwners()) <= 1) {
        return NextResponse.json({ error: "You can't deactivate the last owner." }, { status: 400 });
      }
    }
    data.isActive = body.isActive;
  }

  if (body.resetPassword) {
    tempPassword = generatePassword();
    data.passwordHash = await bcrypt.hash(tempPassword, 10);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });

  // Deactivating or resetting a password should end any live sessions.
  if (data.isActive === false || data.passwordHash) {
    await prisma.staffSession.deleteMany({ where: { userId: id } });
  }

  return NextResponse.json({ user, ...(tempPassword ? { tempPassword } : {}) });
}
