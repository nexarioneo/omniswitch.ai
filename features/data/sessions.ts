import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDb } from "./db";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const SESSION_COOKIE = "session";

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createSession(userId: number): { token: string; expiresAt: string } {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  getDb()
    .prepare("INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)")
    .run(userId, hashSessionToken(token), expiresAt);
  getDb().prepare("DELETE FROM sessions WHERE expires_at <= ?").run(new Date().toISOString());

  return { token, expiresAt };
}

export function getSessionUser(token: string | undefined | null): { id: number; username: string } | null {
  if (!token) return null;

  const user = getDb()
    .prepare(
      `SELECT u.id, u.username
       FROM sessions s
       JOIN admin_users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`
    )
    .get(hashSessionToken(token), new Date().toISOString()) as { id: number; username: string } | undefined;

  return user ?? null;
}

export function deleteSession(token: string): void {
  getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashSessionToken(token));
}

/** Returns a 401 response when the request has no valid admin session. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!getSessionUser(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
