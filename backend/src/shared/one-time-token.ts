import crypto from "node:crypto";

// One-time tokens for email links (verification, password reset).
// The raw token only ever goes into the email; the database stores its
// SHA-256 hash, so a leaked database can't be used to verify or reset.
// (SHA-256 is enough here: the token is 256 random bits, not a password.)

export const EMAIL_VERIFY_TTL_HOURS = 24;
export const PASSWORD_RESET_TTL_MINUTES = 30;

export function hashOneTimeToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createOneTimeToken(ttlMs: number) {
  const token = crypto.randomBytes(32).toString("hex");
  return {
    token,
    hash: hashOneTimeToken(token),
    expiresAt: new Date(Date.now() + ttlMs),
  };
}

export const createEmailVerifyToken = () =>
  createOneTimeToken(EMAIL_VERIFY_TTL_HOURS * 60 * 60 * 1000);

export const createPasswordResetToken = () =>
  createOneTimeToken(PASSWORD_RESET_TTL_MINUTES * 60 * 1000);
