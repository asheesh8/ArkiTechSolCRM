import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOwner } from "@/lib/auth";

const ROLES = ["OWNER", "DEV", "MEMBER"] as const;

// A short, hand-off-able temporary password the owner reads out once.
export function generatePassword() {
  return randomBytes(9).toString("base64url");
}

// Team roster: populates "Assigned to" pickers across the CRM and the Team page.
export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isOwner(currentUser)) return NextResponse.json({ error: "Owner access is required." }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });
  return NextResponse.json({ users });
}

// Onboard a teammate (e.g. an outsourced developer). Owner-only.
export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isOwner(currentUser)) return NextResponse.json({ error: "Owner access is required." }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const name = (body.name as string | undefined)?.trim();
  const email = (body.email as string | undefined)?.trim().toLowerCase();
  const role: Role = (ROLES as readonly string[]).includes(body.role) ? (body.role as Role) : Role.DEV;

  if (!name || !email) return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "A teammate with this email already exists." }, { status: 409 });

  const tempPassword = generatePassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const user = await prisma.user.create({
    data: { name, email, role, passwordHash },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });

  // Returned once so the owner can hand it to the new teammate.
  return NextResponse.json({ user, tempPassword }, { status: 201 });
}
