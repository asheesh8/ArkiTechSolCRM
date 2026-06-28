import { NextResponse } from "next/server";

// Clients now log in with email + password at /api/auth/client-login.
// This endpoint is kept as a stub so old requests don't 404.
export async function POST() {
  return NextResponse.json({ ok: true, message: "Please use email and password to sign in." });
}
