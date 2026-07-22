import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeStaffSession, STAFF_SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  await revokeStaffSession(cookieStore.get(STAFF_SESSION_COOKIE)?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(STAFF_SESSION_COOKIE);
  return response;
}
