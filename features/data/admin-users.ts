import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getDb } from "./db";

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
}

export function getAdminUserByName(username: string): AdminUser | null {
  const row = getDb()
    .prepare("SELECT * FROM admin_users WHERE username = ?")
    .get(username) as AdminUser | undefined;
  return row ?? null;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${hash}:${salt}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [hash, salt] = stored.split(":");
  if (!hash || !salt) return false;

  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;

  return timingSafeEqual(candidate, expected);
}

export function setPassword(userId: number, password: string): void {
  getDb()
    .prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?")
    .run(hashPassword(password), userId);
}

export function deleteOtherSessions(userId: number, keepTokenHash: string): void {
  getDb()
    .prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?")
    .run(userId, keepTokenHash);
}
