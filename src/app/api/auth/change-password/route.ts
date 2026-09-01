import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { changeStaffPassword, getCurrentUser, STAFF_SESSION_COOKIE } from "@/lib/auth";
import { staffPasswordChangeSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const currentToken = request.cookies.get(STAFF_SESSION_COOKIE)?.value;
  if (!user || !currentToken) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  const parsed = staffPasswordChangeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the password fields." },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword } = parsed.data;
  if (Buffer.byteLength(newPassword, "utf8") > 72) {
    return NextResponse.json({ error: "Use a password no longer than 72 bytes." }, { status: 400 });
  }
  if (!user.passwordHash || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });
  }
  if (await bcrypt.compare(newPassword, user.passwordHash)) {
    return NextResponse.json({ error: "Choose a password you are not already using." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await changeStaffPassword(user.id, passwordHash, currentToken);

  return NextResponse.json({ ok: true });
}
