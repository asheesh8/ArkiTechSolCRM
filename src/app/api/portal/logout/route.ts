import { NextResponse } from "next/server";
import { clearPortalCookie } from "@/lib/portal-auth";

export async function POST() {
  await clearPortalCookie();
  return NextResponse.redirect(new URL("/portal/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
}
