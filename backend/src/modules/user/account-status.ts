import { prisma } from "#/lib/prisma";
import { emitToUser, disconnectUser } from "#/modules/notification/realtime";
import { AccountInactiveError } from "#/shared/errors";

// Access tokens are stateless JWTs, so every authenticated request has to
// confirm the account is still active. A short-lived in-memory cache keeps
// that from costing a DB query per request; status changes made through
// this module update the cache immediately.
const CACHE_TTL_MS = 30 * 1000;
const statusCache = new Map<string, { active: boolean; expiresAt: number }>();

async function isAccountActive(userId: string): Promise<boolean> {
  const cached = statusCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.active;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });
  // A deleted user is treated as inactive.
  const active = user?.isActive ?? false;
  statusCache.set(userId, { active, expiresAt: Date.now() + CACHE_TTL_MS });
  return active;
}

async function assertAccountActive(userId: string): Promise<void> {
  if (!(await isAccountActive(userId))) throw new AccountInactiveError();
}

function setCachedStatus(userId: string, active: boolean): void {
  statusCache.set(userId, { active, expiresAt: Date.now() + CACHE_TTL_MS });
}

// Revokes every session the user has: refresh tokens can no longer be
// exchanged, access tokens are rejected by `authenticate`, and connected
// clients are told to log out before their sockets are closed.
async function terminateUserSessions(
  userId: string,
  reason: "deactivated" | "deleted",
): Promise<void> {
  setCachedStatus(userId, false);
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  emitToUser(userId, "account:deactivated", { reason });
  // Give the event a moment to flush before the sockets are closed.
  setTimeout(() => disconnectUser(userId), 1000);
}

export {
  isAccountActive,
  assertAccountActive,
  setCachedStatus,
  terminateUserSessions,
};
