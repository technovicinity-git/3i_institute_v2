import type { Prisma } from "#/generated/prisma/client";
import { prisma } from "#/lib/prisma";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";
import { calculateAge } from "#/shared/course-eligibility";
import { isValidTimeZone, oneMonthPeriodEnd } from "#/shared/zoned-time";
import { notificationEvents } from "#/modules/notification/events";
import {
  isManualSubscription,
  MANUAL_SUBSCRIPTION_PREFIX,
} from "#/modules/seat/service";
import {
  paymentSettingsSchema,
  type CreateSubscriptionRequestInput,
  type PaymentSettings,
} from "#/modules/subscription/schema";

const PAYMENT_SETTINGS_KEY = "payment";

const requestInclude = {
  account: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  learnerProfile: {
    select: { id: true, displayName: true, dateOfBirth: true, avatarUrl: true },
  },
} satisfies Prisma.SubscriptionRequestInclude;

type RequestWithRelations = Prisma.SubscriptionRequestGetPayload<{
  include: typeof requestInclude;
}>;

function formatRequest(request: RequestWithRelations) {
  return {
    id: request.id,
    status: request.status,
    paymentMethod: request.paymentMethod,
    amount: Number(request.amount),
    currency: request.currency,
    transactionId: request.transactionId,
    senderAccount: request.senderAccount,
    paidAt: request.paidAt,
    note: request.note,
    proofImageUrl: request.proofImageUrl,
    reviewedAt: request.reviewedAt,
    rejectionReason: request.rejectionReason,
    periodStart: request.periodStart,
    periodEnd: request.periodEnd,
    createdAt: request.createdAt,
    account: request.account,
    learnerProfile: {
      id: request.learnerProfile.id,
      displayName: request.learnerProfile.displayName,
      avatarUrl: request.learnerProfile.avatarUrl,
      age: calculateAge(request.learnerProfile.dateOfBirth),
    },
  };
}

/** The profile's current paid-up period, if any. */
async function activeSeatFor(
  db: Prisma.TransactionClient | typeof prisma,
  learnerProfileId: string,
) {
  return db.seat.findFirst({
    where: {
      learnerProfileId,
      status: "ACTIVE",
      subscription: { status: "ACTIVE", currentPeriodEnd: { gt: new Date() } },
    },
    include: { subscription: true },
    orderBy: { subscription: { currentPeriodEnd: "desc" } },
  });
}

export class SubscriptionService {
  // ─── Payment settings ───

  async getPaymentSettings(): Promise<PaymentSettings> {
    const row = await prisma.siteSetting.findUnique({
      where: { key: PAYMENT_SETTINGS_KEY },
    });
    // Parsing fills in defaults for any fields added since it was saved.
    const parsed = paymentSettingsSchema.safeParse(row?.value ?? {});
    return parsed.success ? parsed.data : paymentSettingsSchema.parse({});
  }

  async savePaymentSettings(settings: PaymentSettings, adminId: string) {
    await prisma.siteSetting.upsert({
      where: { key: PAYMENT_SETTINGS_KEY },
      create: { key: PAYMENT_SETTINGS_KEY, value: settings, updatedById: adminId },
      update: { value: settings, updatedById: adminId },
    });
    return settings;
  }

  // ─── Account holder ───

  /** Payment details, each profile's status and recent requests. */
  async getOverview(accountId: string) {
    const now = new Date();
    const [payment, profiles, requests] = await Promise.all([
      this.getPaymentSettings(),
      prisma.learnerProfile.findMany({
        where: { accountId, deletedAt: null },
        select: {
          id: true,
          displayName: true,
          dateOfBirth: true,
          avatarUrl: true,
          seats: {
            where: {
              status: "ACTIVE",
              subscription: { status: "ACTIVE", currentPeriodEnd: { gt: now } },
            },
            select: { subscription: { select: { currentPeriodEnd: true } } },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.subscriptionRequest.findMany({
        where: { accountId, learnerProfile: { deletedAt: null } },
        include: requestInclude,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return {
      payment,
      profiles: profiles.map((profile) => {
        const subscribedUntil =
          profile.seats
            .map((seat) => seat.subscription.currentPeriodEnd)
            .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
        const latest = requests.find(
          (r) => r.learnerProfileId === profile.id,
        );
        return {
          id: profile.id,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          age: calculateAge(profile.dateOfBirth),
          isSubscribed: subscribedUntil !== null,
          subscribedUntil,
          pendingRequestId:
            requests.find(
              (r) => r.learnerProfileId === profile.id && r.status === "PENDING",
            )?.id ?? null,
          lastRejection:
            latest?.status === "REJECTED"
              ? {
                  reason: latest.rejectionReason,
                  reviewedAt: latest.reviewedAt,
                }
              : null,
        };
      }),
      requests: requests.map(formatRequest),
    };
  }

  async createRequest(accountId: string, input: CreateSubscriptionRequestInput) {
    const profile = await prisma.learnerProfile.findFirst({
      where: { id: input.learnerProfileId, accountId, deletedAt: null },
    });
    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    const pending = await prisma.subscriptionRequest.findFirst({
      where: { learnerProfileId: profile.id, status: "PENDING" },
    });
    if (pending) {
      throw new ConflictError(
        `${profile.displayName} already has a payment waiting for review`,
      );
    }

    // The same payment can't be used twice
    const duplicate = await prisma.subscriptionRequest.findFirst({
      where: {
        transactionId: { equals: input.transactionId, mode: "insensitive" },
        status: { in: ["PENDING", "APPROVED"] },
      },
    });
    if (duplicate) {
      throw new ConflictError("This transaction ID has already been submitted");
    }

    const { currency } = await this.getPaymentSettings();

    const request = await prisma.subscriptionRequest.create({
      data: {
        accountId,
        learnerProfileId: profile.id,
        paymentMethod: input.paymentMethod,
        amount: input.amount,
        currency,
        transactionId: input.transactionId,
        senderAccount: input.senderAccount || null,
        paidAt: input.paidAt,
        note: input.note || null,
        proofImageUrl: input.proofImageUrl || null,
      },
      include: requestInclude,
    });

    notificationEvents.subscriptionRequested(request.id);

    return formatRequest(request);
  }

  async cancelRequest(accountId: string, requestId: string) {
    const request = await prisma.subscriptionRequest.findFirst({
      where: { id: requestId, accountId },
    });
    if (!request) {
      throw new NotFoundError("Subscription request not found");
    }
    if (request.status !== "PENDING") {
      throw new ValidationError("Only pending requests can be cancelled");
    }

    const updated = await prisma.subscriptionRequest.update({
      where: { id: requestId },
      data: { status: "CANCELLED" },
      include: requestInclude,
    });
    return formatRequest(updated);
  }

  // ─── Admin ───

  async listRequests(
    page: number,
    limit: number,
    filters: { status?: string; search?: string } = {},
  ) {
    const status = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"].includes(
      filters.status ?? "",
    )
      ? (filters.status as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED")
      : undefined;
    const search = filters.search?.trim();

    const where: Prisma.SubscriptionRequestWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { transactionId: { contains: search, mode: "insensitive" } },
              { senderAccount: { contains: search, mode: "insensitive" } },
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

    const [total, pendingCount, requests] = await Promise.all([
      prisma.subscriptionRequest.count({ where }),
      prisma.subscriptionRequest.count({ where: { status: "PENDING" } }),
      prisma.subscriptionRequest.findMany({
        where,
        include: requestInclude,
        // Oldest pending first so nobody waits; otherwise newest first
        orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Show each profile's current period so renewals are easy to spot
    const profileIds = [...new Set(requests.map((r) => r.learnerProfileId))];
    const seats = await prisma.seat.findMany({
      where: {
        learnerProfileId: { in: profileIds },
        status: "ACTIVE",
        subscription: { status: "ACTIVE", currentPeriodEnd: { gt: new Date() } },
      },
      select: {
        learnerProfileId: true,
        subscription: { select: { currentPeriodEnd: true } },
      },
    });
    const subscribedUntil = new Map(
      seats.map((s) => [s.learnerProfileId, s.subscription.currentPeriodEnd]),
    );

    return {
      total,
      pendingCount,
      requests: requests.map((request) => ({
        ...formatRequest(request),
        profileSubscribedUntil:
          subscribedUntil.get(request.learnerProfileId) ?? null,
      })),
    };
  }

  /**
   * Subscribes the profile for one month, ending at the first 12am (in the
   * account holder's timezone) after that. If the profile is already
   * subscribed, the new month starts when the current one ends.
   */
  async approveRequest(adminId: string, requestId: string) {
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.subscriptionRequest.findUnique({
        where: { id: requestId },
        include: {
          account: { select: { timezone: true } },
          learnerProfile: { select: { id: true, deletedAt: true } },
        },
      });
      if (!request) {
        throw new NotFoundError("Subscription request not found");
      }
      if (request.status !== "PENDING") {
        throw new ValidationError("This request has already been reviewed");
      }
      if (request.learnerProfile.deletedAt) {
        throw new ValidationError("This learner profile has been deleted");
      }

      const timeZone = isValidTimeZone(request.account.timezone)
        ? request.account.timezone
        : "UTC";
      const now = new Date();
      const current = await activeSeatFor(tx, request.learnerProfileId);

      let subscriptionId: string;
      let periodStart: Date;
      let periodEnd: Date;

      if (current && isManualSubscription(current.subscription)) {
        // Renewal: extend the running period
        periodStart = current.subscription.currentPeriodEnd;
        periodEnd = oneMonthPeriodEnd(periodStart, timeZone);
        subscriptionId = current.subscriptionId;
        await tx.subscription.update({
          where: { id: subscriptionId },
          data: { currentPeriodEnd: periodEnd },
        });
      } else {
        periodStart = now;
        periodEnd = oneMonthPeriodEnd(now, timeZone);

        // Drop any seat left over from an ended subscription
        await tx.seat.updateMany({
          where: { learnerProfileId: request.learnerProfileId, status: "ACTIVE" },
          data: { status: "EXPIRED", cancelledAt: now },
        });

        const subscription = await tx.subscription.create({
          data: {
            accountId: request.accountId,
            stripeSubscriptionId: `${MANUAL_SUBSCRIPTION_PREFIX}${request.id}`,
            status: "ACTIVE",
            seats: 1,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
          },
        });
        subscriptionId = subscription.id;

        await tx.seat.create({
          data: {
            subscriptionId,
            learnerProfileId: request.learnerProfileId,
            status: "ACTIVE",
          },
        });
        await tx.learnerProfile.update({
          where: { id: request.learnerProfileId },
          data: { isActive: true },
        });
      }

      const updated = await tx.subscriptionRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          reviewedById: adminId,
          reviewedAt: now,
          subscriptionId,
          periodStart,
          periodEnd,
        },
        include: requestInclude,
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: "SUBSCRIPTION_REQUEST_APPROVED",
          resource: "subscription_request",
          resourceId: requestId,
          details: {
            learnerProfileId: request.learnerProfileId,
            subscriptionId,
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString(),
          },
        },
      });

      return updated;
    });

    notificationEvents.subscriptionRequestDecided(result.id);
    return formatRequest(result);
  }

  async rejectRequest(adminId: string, requestId: string, reason: string) {
    const request = await prisma.subscriptionRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundError("Subscription request not found");
    }
    if (request.status !== "PENDING") {
      throw new ValidationError("This request has already been reviewed");
    }

    const updated = await prisma.subscriptionRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        reviewedById: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
      include: requestInclude,
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "SUBSCRIPTION_REQUEST_REJECTED",
        resource: "subscription_request",
        resourceId: requestId,
        details: { reason },
      },
    });

    notificationEvents.subscriptionRequestDecided(updated.id);
    return formatRequest(updated);
  }

  // ─── Expiry ───

  /**
   * Ends manual subscriptions whose period is over. Access already stops at
   * `currentPeriodEnd` (enrolment checks the time), so this just tidies up
   * statuses and tells the account holder.
   */
  async expireDueSubscriptions(): Promise<number> {
    const due = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        stripeSubscriptionId: { startsWith: MANUAL_SUBSCRIPTION_PREFIX },
        currentPeriodEnd: { lte: new Date() },
      },
      include: {
        assignedSeats: {
          where: { status: "ACTIVE" },
          include: { learnerProfile: { select: { id: true, displayName: true } } },
        },
      },
    });

    for (const subscription of due) {
      const now = new Date();
      await prisma.$transaction(async (tx) => {
        // Re-check inside the transaction in case it was just renewed
        const fresh = await tx.subscription.updateMany({
          where: {
            id: subscription.id,
            status: "ACTIVE",
            currentPeriodEnd: { lte: now },
          },
          data: { status: "EXPIRED" },
        });
        if (fresh.count === 0) return;

        await tx.seat.updateMany({
          where: { subscriptionId: subscription.id, status: "ACTIVE" },
          data: { status: "EXPIRED", cancelledAt: now },
        });

        for (const seat of subscription.assignedSeats) {
          const stillActive = await activeSeatFor(tx, seat.learnerProfileId);
          if (!stillActive) {
            await tx.learnerProfile.update({
              where: { id: seat.learnerProfileId },
              data: { isActive: false },
            });
          }
        }
      });

      notificationEvents.subscriptionExpired(
        subscription.id,
        subscription.accountId,
        subscription.assignedSeats.map((seat) => seat.learnerProfile.displayName),
      );
    }

    return due.length;
  }
}

export const subscriptionService = new SubscriptionService();
