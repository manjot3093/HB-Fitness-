import { ALLOWED_DOMAIN } from './config';

/** Exact-match domain check. Rejects look-alikes (evilhbplus.fit, hbplus.fit.evil.com, a@b.hbplus.fit)
 *  and unverified emails. */
export function isAllowedEmail(email?: string | null, emailVerified = false): boolean {
  if (!email || !emailVerified) return false;
  const parts = email.trim().toLowerCase().split('@');
  return parts.length === 2 && parts[0].length > 0 && parts[1] === ALLOWED_DOMAIN;
}
