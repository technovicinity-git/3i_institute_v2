import { randomUUID } from "node:crypto";
import { prisma } from "#/lib/prisma";
import { env } from "#/config/env";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";
import { calculateAge } from "#/shared/course-eligibility";
import { SEAT_MONTHLY_PRICE } from "#/shared/pricing";

/**
 * Subscriptions created by the manual subscribe button (no payment gateway
 * yet) are tagged with this prefix in place of a Stripe subscription id.
 */
export const MANUAL_SUBSCRIPTION_PREFIX = "manual_";

export function isManualSubscription(sub: { stripeSubscriptionId: string }) {
  return sub.stripeSubscriptionId.startsWith(MANUAL_SUBSCRIPTION_PREFIX);
}

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export class SeatService {
  /**
   * Assign a seat to a learner profile
   * - One seat = one profile (permanent while active)
   * - Requires an active subscription with available seats
   */
  async assignSeat(accountId: string, input: { learnerProfileId: string }) {
    // Verify learner profile belongs to account
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: input.learnerProfileId,
        accountId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // Check if profile already has an active seat
    const existingSeat = await prisma.seat.findFirst({
      where: {
        learnerProfileId: input.learnerProfileId,
        status: "ACTIVE",
      },
    });

    if (existingSeat) {
      throw new ConflictError("This profile already has an active seat");
    }

    // Get active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        accountId,
        status: "ACTIVE",
      },
      include: {
        assignedSeats: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!subscription) {
      throw new ValidationError("No active subscription found");
    }

    // Check if seats available
    if (subscription.assignedSeats.length >= subscription.seats) {
      throw new ValidationError(
        `No available seats. You have ${subscription.seats} seat(s) and ${subscription.assignedSeats.length} are assigned.`,
      );
    }

    // Assign seat (reactivates a seat this profile held earlier on the
    // same subscription — the pair is unique)
    const seat = await prisma.seat.upsert({
      where: {
        subscriptionId_learnerProfileId: {
          subscriptionId: subscription.id,
          learnerProfileId: input.learnerProfileId,
        },
      },
      create: {
        subscriptionId: subscription.id,
        learnerProfileId: input.learnerProfileId,
        status: "ACTIVE",
      },
      update: { status: "ACTIVE", assignedAt: new Date(), cancelledAt: null },
    });

    // Activate the profile
    await prisma.learnerProfile.update({
      where: { id: input.learnerProfileId },
      data: { isActive: true },
    });

    return seat;
  }

  /**
   * Cancel a seat
   * - Profile becomes inactive
   * - Progress/results/certificates are preserved
   * - Seat becomes available for another profile
   */
  async cancelSeat(accountId: string, input: { learnerProfileId: string }) {
    // Verify profile belongs to account
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: input.learnerProfileId,
        accountId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // Find active seat
    const seat = await prisma.seat.findFirst({
      where: {
        learnerProfileId: input.learnerProfileId,
        status: "ACTIVE",
      },
    });

    if (!seat) {
      throw new ValidationError("This profile does not have an active seat");
    }

    // Cancel seat
    const cancelledSeat = await prisma.seat.update({
      where: { id: seat.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    // Deactivate profile (data preserved)
    await prisma.learnerProfile.update({
      where: { id: input.learnerProfileId },
      data: { isActive: false },
    });

    return cancelledSeat;
  }

  /**
   * Get all seats for an account
   */
  async getAccountSeats(accountId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        accountId,
        status: "ACTIVE",
      },
      include: {
        assignedSeats: {
          include: {
            learnerProfile: {
              select: {
                id: true,
                displayName: true,
                dateOfBirth: true,
                avatarUrl: true,
                isActive: true,
              },
            },
          },
          orderBy: { assignedAt: "asc" },
        },
      },
    });

    if (!subscription) {
      return {
        totalSeats: 0,
        assignedSeats: [],
        availableSeats: 0,
      };
    }

    const activeSeats = subscription.assignedSeats.filter(
      (seat) => seat.status === "ACTIVE",
    );

    return {
      totalSeats: subscription.seats,
      assignedSeats: activeSeats,
      availableSeats: subscription.seats - activeSeats.length,
    };
  }

  /**
   * Get seat status for a specific profile
   */
  async getProfileSeatStatus(accountId: string, learnerProfileId: string) {
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: learnerProfileId,
        accountId,
        deletedAt: null,
      },
      include: {
        seats: {
          where: { status: "ACTIVE" },
          take: 1,
        },
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    return {
      profileId: profile.id,
      displayName: profile.displayName,
      isActive: profile.isActive,
      hasActiveSeat: profile.seats.length > 0,
      seatId: profile.seats[0]?.id ?? null,
    };
  }

  /**
   * True when the profile holds an active seat on an active subscription.
   * Only subscribed profiles can enrol in courses.
   */
  async isProfileSubscribed(learnerProfileId: string): Promise<boolean> {
    const seat = await prisma.seat.findFirst({
      where: {
        learnerProfileId,
        status: "ACTIVE",
        subscription: { status: "ACTIVE" },
      },
      select: { id: true },
    });
    return seat !== null;
  }

  /** Per-profile subscription status for the learner subscription page. */
  async getSubscriptionOverview(accountId: string) {
    const [profiles, subscription] = await Promise.all([
      prisma.learnerProfile.findMany({
        where: { accountId, deletedAt: null },
        select: {
          id: true,
          displayName: true,
          dateOfBirth: true,
          avatarUrl: true,
          seats: {
            where: { status: "ACTIVE", subscription: { status: "ACTIVE" } },
            select: { id: true, assignedAt: true },
            take: 1,
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.subscription.findFirst({
        where: { accountId, status: "ACTIVE" },
        include: { assignedSeats: { where: { status: "ACTIVE" } } },
      }),
    ]);

    return {
      manualSubscriptionsEnabled: env.MANUAL_SUBSCRIPTIONS_ENABLED,
      pricePerProfile: SEAT_MONTHLY_PRICE,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            isManual: isManualSubscription(subscription),
            seats: subscription.seats,
            activeSeats: subscription.assignedSeats.length,
            currentPeriodEnd: subscription.currentPeriodEnd,
          }
        : null,
      profiles: profiles.map((profile) => ({
        id: profile.id,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        age: calculateAge(profile.dateOfBirth),
        isSubscribed: profile.seats.length > 0,
        subscribedAt: profile.seats[0]?.assignedAt ?? null,
      })),
    };
  }

  /**
   * Manually subscribe a profile (no payment). Uses the account's active
   * subscription, creating a manual one if needed, and grows a manual
   * subscription by one seat when it has none free.
   * TODO: replace with a payment-gateway checkout before production.
   */
  async subscribeProfile(accountId: string, learnerProfileId: string) {
    if (!env.MANUAL_SUBSCRIPTIONS_ENABLED) {
      throw new ForbiddenError("Manual subscriptions are disabled");
    }

    const profile = await prisma.learnerProfile.findFirst({
      where: { id: learnerProfileId, accountId, deletedAt: null },
    });
    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    if (await this.isProfileSubscribed(learnerProfileId)) {
      throw new ConflictError(`${profile.displayName} is already subscribed`);
    }

    return prisma.$transaction(async (tx) => {
      const now = new Date();
      let subscription = await tx.subscription.findFirst({
        where: { accountId, status: "ACTIVE" },
        include: { assignedSeats: { where: { status: "ACTIVE" } } },
      });

      if (!subscription) {
        subscription = await tx.subscription.create({
          data: {
            accountId,
            stripeSubscriptionId: `${MANUAL_SUBSCRIPTION_PREFIX}${randomUUID()}`,
            status: "ACTIVE",
            seats: 0,
            currentPeriodStart: now,
            currentPeriodEnd: new Date(now.getTime() + MONTH_MS),
          },
          include: { assignedSeats: { where: { status: "ACTIVE" } } },
        });
      }

      if (subscription.assignedSeats.length >= subscription.seats) {
        if (!isManualSubscription(subscription)) {
          throw new ValidationError(
            `No available seats. You have ${subscription.seats} seat(s) and ${subscription.assignedSeats.length} are assigned.`,
          );
        }
        await tx.subscription.update({
          where: { id: subscription.id },
          data: { seats: subscription.assignedSeats.length + 1 },
        });
      }

      // Drop any active seat left over on an inactive subscription
      await tx.seat.updateMany({
        where: { learnerProfileId, status: "ACTIVE" },
        data: { status: "CANCELLED", cancelledAt: now },
      });

      const seat = await tx.seat.upsert({
        where: {
          subscriptionId_learnerProfileId: {
            subscriptionId: subscription.id,
            learnerProfileId,
          },
        },
        create: {
          subscriptionId: subscription.id,
          learnerProfileId,
          status: "ACTIVE",
        },
        update: { status: "ACTIVE", assignedAt: now, cancelledAt: null },
      });

      await tx.learnerProfile.update({
        where: { id: learnerProfileId },
        data: { isActive: true },
      });

      await tx.auditLog.create({
        data: {
          userId: accountId,
          action: "PROFILE_SUBSCRIBED",
          resource: "seat",
          resourceId: seat.id,
          details: { learnerProfileId, subscriptionId: subscription.id },
        },
      });

      return seat;
    });
  }

  /**
   * Manually unsubscribe a profile. Its progress and existing enrolments are
   * kept, but it can't enrol in new courses. A manual subscription shrinks by
   * one seat and is cancelled once no seats remain.
   */
  async unsubscribeProfile(accountId: string, learnerProfileId: string) {
    if (!env.MANUAL_SUBSCRIPTIONS_ENABLED) {
      throw new ForbiddenError("Manual subscriptions are disabled");
    }

    const profile = await prisma.learnerProfile.findFirst({
      where: { id: learnerProfileId, accountId, deletedAt: null },
    });
    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    const seat = await prisma.seat.findFirst({
      where: { learnerProfileId, status: "ACTIVE" },
      include: { subscription: true },
    });
    if (!seat) {
      throw new ValidationError(`${profile.displayName} is not subscribed`);
    }

    return prisma.$transaction(async (tx) => {
      const now = new Date();
      const cancelled = await tx.seat.update({
        where: { id: seat.id },
        data: { status: "CANCELLED", cancelledAt: now },
      });

      await tx.learnerProfile.update({
        where: { id: learnerProfileId },
        data: { isActive: false },
      });

      if (isManualSubscription(seat.subscription)) {
        const remaining = await tx.seat.count({
          where: { subscriptionId: seat.subscriptionId, status: "ACTIVE" },
        });
        await tx.subscription.update({
          where: { id: seat.subscriptionId },
          data:
            remaining === 0
              ? { seats: 0, status: "CANCELLED", cancelledAt: now }
              : { seats: remaining },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: accountId,
          action: "PROFILE_UNSUBSCRIBED",
          resource: "seat",
          resourceId: seat.id,
          details: { learnerProfileId, subscriptionId: seat.subscriptionId },
        },
      });

      return cancelled;
    });
  }
}

export const seatService = new SeatService();
