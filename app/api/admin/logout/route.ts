import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession, SESSION_COOKIE } from "@/features/data/sessions";

export const dynamic = "force-dynamic";

export async function POST() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) deleteSession(token);

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
