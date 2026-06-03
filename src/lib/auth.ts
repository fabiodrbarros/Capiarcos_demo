import 'server-only';
import crypto from 'node:crypto';
import { cookies } from 'next/headers';

const ADMIN_USER = process.env.ADMIN_USER || 'capiarcos';
const ADMIN_PW = process.env.ADMIN_PASSWORD || 'capiarcos-admin';
const COOKIE = 'cap_admin';
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// In-memory session store. Fine for a single-instance demo / self-hosted run.
const sessions = new Map<string, number>(); // token -> expiresAt

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function verifyCredentials(user: string, password: string): boolean {
  // Compute both (no short-circuit) so timing never reveals which field is wrong.
  const userOk = safeEqual(user, ADMIN_USER);
  const pwOk = safeEqual(password, ADMIN_PW);
  return userOk && pwOk;
}

export async function createSession(): Promise<void> {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, Date.now() + TTL_MS);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: TTL_MS / 1000,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) sessions.delete(token);
  jar.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;
  const exp = sessions.get(token);
  if (!exp) return false;
  if (exp < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}
