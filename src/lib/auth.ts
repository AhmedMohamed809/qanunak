import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_COOKIE = 'qanunak_admin';

function secret(): string {
  return process.env.ADMIN_SECRET ?? 'dev-secret-change-me';
}

export function sessionToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? '';
  return createHmac('sha256', secret()).update(`admin:${password}`).digest('hex');
}

export function passwordIsCorrect(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? '';
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function tokenIsValid(token: string | undefined): boolean {
  if (!token) return false;
  const expected = sessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
