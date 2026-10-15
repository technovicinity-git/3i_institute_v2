import type { Prisma } from "#/generated/prisma/client";
import { prisma } from "#/lib/prisma";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";
import { calculateAge } from "#/shared/course-eligibility";
import { emailService } from "#/modules/email/service";
import { emailLinks } from "#/modules/email/links";
import { notificationEvents } from "#/modules/notification/events";
import type { CreateWaiverInput } from "#/modules/waiver/schema";

const DAY_MS = 24 * 60 * 60 * 1000;

/** An approved waiver must be used on a subscription within this time. */
export const WAIVER_VALID_DAYS = 30;
/** Applications allowed per learner profile in a rolling 12 months. */
export const WAIVER_APPLICATIONS_PER_YEAR = 3;

const waiverInclude = {
  account: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      timezone: true,
    },
  },
  learnerProfile: {
    select: { id: true, displayName: true, dateOfBirth: true, avatarUrl: true },
  },
  // The subscription request that used (or is about to use) the waiver
  subscriptionRequests: {
    where: { status: { in: ["PENDING", "APPROVED"] } },
    select: { id: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 1,
  },
} satisfies Prisma.WaiverInclude;

type WaiverWithRelations = Prisma.WaiverGetPayload<{
  include: typeof waiverInclude;
}>;

function formatWaiver(waiver: WaiverWithRelations) {
  const request = waiver.subscriptionRequests[0] ?? null;
  return {
    id: waiver.id,
    status: waiver.status,
    percent: waiver.tier,
    explanation: waiver.explanation,
    evidenceFiles: waiver.evidenceFiles,
    reviewedAt: waiver.reviewedAt,
    rejectionReason: waiver.rejectionReason,
    expiresAt: waiver.expiresAt,
    usedAt: waiver.usedAt,
    revokedAt: waiver.revokedAt,
    revokeReason: waiver.revokeReason,
    createdAt: waiver.createdAt,
    /** Set while a pending subscription request is holding this waiver. */
    reservedByRequestId: request?.status === "PENDING" ? request.id : null,
    account: {
      id: waiver.account.id,
      firstName: waiver.account.firstName,
      lastName: waiver.account.lastName,
      email: waiver.account.email,
    },
    learnerProfile: waiver.learnerProfile
      ? {
          id: waiver.learnerProfile.id,
          displayName: waiver.learnerProfile.displayName,
          avatarUrl: waiver.learnerProfile.avatarUrl,
          age: calculateAge(waiver.learnerProfile.dateOfBirth),
        }
      : null,
  };
}

/**
 * The profile's approved, unused, unexpired waiver, if any. Used by the
 * subscription request flow to discount the price.
 */
export async function findUsableWaiver(
  db: Prisma.TransactionClient | typeof prisma,
  learnerProfileId: string,
) {
  return db.waiver.findFirst({
    where: {
      learnerProfileId,
      status: "APPROVED",
      expiresAt: { gt: new Date() },
    },
    orderBy: { tier: "desc" },
  });
}

function sendDecisionEmail(waiver: WaiverWithRelations) {
  const learnerName = waiver.learnerProfile?.displayName ?? "your learner";
  const base = { to: waiver.account.email };
  const firstName = waiver.account.firstName;

  if (waiver.status === "APPROVED" && waiver.tier && waiver.expiresAt) {
    emailService.sendInBackground({
      ...base,
      template: "billing.waiver-approved",
      data: {
        firstName,
        learnerName,
        percent: waiver.tier,
        expiresAt: waiver.expiresAt,
        timeZone: waiver.account.timezone || "UTC",
        subscriptionUrl: emailLinks.subscription(),
      },
    });
  } else if (waiver.status === "REJECTED") {
    emailService.sendInBackground({
      ...base,
      template: "billing.waiver-rejected",
      data: {
        firstName,
        learnerName,
        reason: waiver.rejectionReason ?? "Not provided",
        contactUrl: emailLinks.contact(),
      },
    });
  } else if (waiver.status === "REVOKED") {
    emailService.sendInBackground({
      ...base,
      template: "billing.waiver-revoked",
      data: {
        firstName,
        learnerName,
        reason: waiver.revokeReason ?? "Not provided",
        contactUrl: emailLinks.contact(),
      },
    });
  }
}

export class WaiverService {
  // ─── Account holder ───

  async listMine(accountId: string) {
    const waivers = await prisma.waiver.findMany({
      where: { accountId, learnerProfile: { deletedAt: null } },
      include: waiverInclude,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return waivers.map(formatWaiver);
  }

  /**
   * How many more times the profile can apply, and when the next slot opens
   * once the yearly limit is reached.
   */
  async applicationAllowance(learnerProfileId: string) {
    const since = new Date(Date.now() - 365 * DAY_MS);
    const recent = await prisma.waiver.findMany({
      where: { learnerProfileId, createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const remaining = Math.max(0, WAIVER_APPLICATIONS_PER_YEAR - recent.length);
    const nextAvailableAt =
      remaining === 0 && recent[0]
        ? new Date(recent[0].createdAt.getTime() + 365 * DAY_MS)
        : null;
    return { remaining, nextAvailableAt };
  }

  async apply(accountId: string, input: CreateWaiverInput) {
    const profile = await prisma.learnerProfile.findFirst({
      where: { id: input.learnerProfileId, accountId, deletedAt: null },
    });
    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // One open waiver per profile: pending, or approved and still usable
    const open = await prisma.waiver.findFirst({
      where: {
        learnerProfileId: profile.id,
        OR: [
          { status: "PENDING" },
          { status: "APPROVED", expiresAt: { gt: new Date() } },
        ],
      },
    });
    if (open) {
      throw new ConflictError(
        open.status === "PENDING"
          ? `${profile.displayName} already has a waiver request waiting for review`
          : `${profile.displayName} already has an approved waiver to use`,
      );
    }

    const allowance = await this.applicationAllowance(profile.id);
    if (allowance.remaining === 0) {
      const next = allowance.nextAvailableAt
        ? ` You can apply again on ${allowance.nextAvailableAt.toDateString()}.`
        : "";
      throw new ValidationError(
        `${profile.displayName} has reached the limit of ${WAIVER_APPLICATIONS_PER_YEAR} waiver requests in 12 months.${next}`,
      );
    }

    const waiver = await prisma.waiver.create({
      data: {
        accountId,
        learnerProfileId: profile.id,
        explanation: input.explanation,
        evidenceFiles: input.evidenceFiles,
      },
      include: waiverInclude,
    });

    notificationEvents.waiverRequested(waiver.id);
    return formatWaiver(waiver);
  }

  // ─── Admin ───

  async list(
    page: number,
    limit: number,
    filters: { status?: string; search?: string } = {},
  ) {
    const statuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "REVOKED",
      "USED",
      "EXPIRED",
    ] as const;
    const status = statuses.find((s) => s === filters.status);
    const search = filters.search?.trim();

    const where: Prisma.WaiverWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              {
                learnerProfile: {
                  displayName: { contains: search, mode: "insensitive" },
                },
              },
              { account: { email: { contains: search, mode: "insensitive" } } },
              {
                account: { firstName: { contains: search, mode: "insensitive" } },
              },
              {
                account: { lastName: { contains: search, mode: "insensitive" } },
              },
            ],
          }
        : {}),
    };

    const [total, pendingCount, waivers] = await Promise.all([
      prisma.waiver.count({ where }),
      prisma.waiver.count({ where: { status: "PENDING" } }),
      prisma.waiver.findMany({
        where,
        include: waiverInclude,
        orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { total, pendingCount, waivers: waivers.map(formatWaiver) };
  }

  async approve(adminId: string, waiverId: string, tier: number) {
    const waiver = await prisma.waiver.findUnique({ where: { id: waiverId } });
    if (!waiver) throw new NotFoundError("Waiver request not found");
    if (waiver.status !== "PENDING") {
      throw new ValidationError("This waiver request has already been reviewed");
    }
    if (!waiver.learnerProfileId) {
      throw new ValidationError(
        "This is an old waiver with no learner profile and can't be approved",
      );
    }

    const now = new Date();
    const updated = await prisma.waiver.update({
      where: { id: waiverId },
      data: {
        status: "APPROVED",
        tier,
        reviewedBy: adminId,
        reviewedAt: now,
        expiresAt: new Date(now.getTime() + WAIVER_VALID_DAYS * DAY_MS),
      },
      include: waiverInclude,
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "WAIVER_APPROVED",
        resource: "waiver",
        resourceId: waiverId,
        details: { tier },
      },
    });

    notificationEvents.waiverDecided(updated.id);
    sendDecisionEmail(updated);
    return formatWaiver(updated);
  }

  async reject(adminId: string, waiverId: string, reason: string) {
    const waiver = await prisma.waiver.findUnique({ where: { id: waiverId } });
    if (!waiver) throw new NotFoundError("Waiver request not found");
    if (waiver.status !== "PENDING") {
      throw new ValidationError("This waiver request has already been reviewed");
    }

    const updated = await prisma.waiver.update({
      where: { id: waiverId },
      data: {
        status: "REJECTED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
      include: waiverInclude,
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "WAIVER_REJECTED",
        resource: "waiver",
        resourceId: waiverId,
        details: { reason },
      },
    });

    notificationEvents.waiverDecided(updated.id);
    sendDecisionEmail(updated);
    return formatWaiver(updated);
  }

  /** Withdraws an approved waiver that hasn't been used yet. */
  async revoke(adminId: string, waiverId: string, reason: string) {
    const waiver = await prisma.waiver.findUnique({
      where: { id: waiverId },
      include: waiverInclude,
    });
    if (!waiver) throw new NotFoundError("Waiver not found");
    if (waiver.status !== "APPROVED") {
      throw new ValidationError("Only approved, unused waivers can be revoked");
    }
    if (formatWaiver(waiver).reservedByRequestId) {
      throw new ValidationError(
        "This waiver is on a subscription request waiting for review. Reject that request first.",
      );
    }

    const updated = await prisma.waiver.update({
      where: { id: waiverId },
      data: { status: "REVOKED", revokedAt: new Date(), revokeReason: reason },
      include: waiverInclude,
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "WAIVER_REVOKED",
        resource: "waiver",
        resourceId: waiverId,
        details: { reason },
      },
    });

    notificationEvents.waiverDecided(updated.id, reason);
    sendDecisionEmail(updated);
    return formatWaiver(updated);
  }

  // ─── Expiry ───

  /**
   * Expires approved waivers past their use-by date. A waiver already on a
   * pending subscription request is honoured, so it's skipped.
   */
  async expireDueWaivers(): Promise<number> {
    const result = await prisma.waiver.updateMany({
      where: {
        status: "APPROVED",
        expiresAt: { lte: new Date() },
        subscriptionRequests: { none: { status: "PENDING" } },
      },
      data: { status: "EXPIRED" },
    });
    return result.count;
  }
}

export const waiverService = new WaiverService();
