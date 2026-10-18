import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/features/data/db";
import { verifyPassword } from "@/features/data/admin-users";
import { createSession, SESSION_COOKIE } from "@/features/data/sessions";
export const dynamic = "force-dynamic";


export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { username, password } = body;
  if (!username || !password) {
    return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
  }

  const db = getDb();
  const user = db.prepare("SELECT * FROM admin_users WHERE username = ?").get(username) as {
    id: number;
    username: string;
    password_hash: string;
  } | undefined;

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (!verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const { token, expiresAt } = createSession(user.id);

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isHttps = forwardedProto
    ? forwardedProto.split(",")[0].trim() === "https"
    : request.nextUrl.protocol === "https:";

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });

  return response;
}
