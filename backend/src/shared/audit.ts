import type { Prisma } from "#/generated/prisma/client";
import { prisma } from "#/lib/prisma";

export interface AuditEntry {
  /** The user who did it (usually an admin). */
  actorId: string;
  /** e.g. "USER_DEACTIVATED". Add new admin actions to the activity log's catalog. */
  action: string;
  /** What kind of thing it was done to, e.g. "user", "course". */
  resource: string;
  resourceId?: string | null;
  details?: Prisma.InputJsonValue;
}

/** Records an admin or security action for the admin activity log. */
export async function recordAudit(
  entry: AuditEntry,
  db: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<void> {
  await db.auditLog.create({
    data: {
      userId: entry.actorId,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId ?? null,
      ...(entry.details !== undefined && { details: entry.details }),
    },
  });
}
