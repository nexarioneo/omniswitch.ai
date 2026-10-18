import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  deleteOtherSessions,
  getAdminUserByName,
  setPassword,
  verifyPassword,
} from "@/features/data/admin-users";
import { getSessionUser, hashSessionToken, SESSION_COOKIE } from "@/features/data/sessions";
import { passwordChangeSchema } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const sessionUser = getSessionUser(token);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = passwordChangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const user = getAdminUserByName(sessionUser.username);
  if (!user || !verifyPassword(parsed.data.current_password, user.password_hash)) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  setPassword(user.id, parsed.data.new_password);
  deleteOtherSessions(user.id, hashSessionToken(token!));

  return NextResponse.json({ success: true });
}
