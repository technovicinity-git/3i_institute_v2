import { prisma } from "#/lib/prisma";
import {
  AppError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";

/**
 * Subscriptions created by approving a manually-paid subscription request
 * are tagged with this prefix in place of a Stripe subscription id.
 */
export const MANUAL_SUBSCRIPTION_PREFIX = "manual_";

export function isManualSubscription(sub: { stripeSubscriptionId: string }) {
  return sub.stripeSubscriptionId.startsWith(MANUAL_SUBSCRIPTION_PREFIX);
}

/**
 * Days a learner keeps full access after their subscription period ends.
 * Payments are manual and reviewed by an admin, so a family that pays on
 * the last day shouldn't be locked out while the renewal is approved.
 */
export const SUBSCRIPTION_GRACE_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whether a learner can use their enrolled courses.
 *   SUBSCRIBED — paid-up period running
 *   GRACE      — period ended less than SUBSCRIPTION_GRACE_DAYS ago
 *   EXPIRED    — had a subscription, grace is over
 *   NONE       — never subscribed
 * After the grace period lessons, live classes, assignments and chat are
 * locked; exams, results and certificates stay open (a learner shouldn't
 * miss an exam while a manual renewal is reviewed). New enrolments need an
 * active subscription, with no grace period.
 */
export interface LearningAccess {
  status: "SUBSCRIBED" | "GRACE" | "EXPIRED" | "NONE";
  hasAccess: boolean;
  /** End of the latest subscription period, if any. */
  periodEnd: Date | null;
  /** When access stops (period end + grace); null while subscribed or never. */
  graceEndsAt: Date | null;
}

export const SUBSCRIPTION_EXPIRED = "SUBSCRIPTION_EXPIRED";

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

    // Check if seats available. Not atomic with the upsert below, so two
    // assignments at the same moment could both take the last seat.
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

  /** See LearningAccess. */
  async getLearningAccess(learnerProfileId: string): Promise<LearningAccess> {
    if (await this.isProfileSubscribed(learnerProfileId)) {
      const seat = await prisma.seat.findFirst({
        where: { learnerProfileId, status: "ACTIVE", subscription: { status: "ACTIVE" } },
        select: { subscription: { select: { currentPeriodEnd: true } } },
        orderBy: { subscription: { currentPeriodEnd: "desc" } },
      });
      return {
        status: "SUBSCRIBED",
        hasAccess: true,
        periodEnd: seat?.subscription.currentPeriodEnd ?? null,
        graceEndsAt: null,
      };
    }

    // Seats the family gave up (CANCELLED) don't earn a grace period.
    const last = await prisma.seat.findFirst({
      where: { learnerProfileId, status: { in: ["ACTIVE", "EXPIRED"] } },
      select: { subscription: { select: { currentPeriodEnd: true } } },
      orderBy: { subscription: { currentPeriodEnd: "desc" } },
    });
    if (!last) {
      return { status: "NONE", hasAccess: false, periodEnd: null, graceEndsAt: null };
    }

    const periodEnd = last.subscription.currentPeriodEnd;
    const graceEndsAt = new Date(periodEnd.getTime() + SUBSCRIPTION_GRACE_DAYS * DAY_MS);
    const inGrace = Date.now() < graceEndsAt.getTime();
    return {
      status: inGrace ? "GRACE" : "EXPIRED",
      hasAccess: inGrace,
      periodEnd,
      graceEndsAt,
    };
  }

  /** getLearningAccess for one of the caller's own profiles. */
  async getOwnLearningAccess(accountId: string, learnerProfileId: string) {
    const profile = await prisma.learnerProfile.findFirst({
      where: { id: learnerProfileId, accountId, deletedAt: null },
      select: { id: true },
    });
    if (!profile) throw new NotFoundError("Learner profile not found");
    return {
      ...(await this.getLearningAccess(profile.id)),
      graceDays: SUBSCRIPTION_GRACE_DAYS,
    };
  }

  /** Throws SUBSCRIPTION_EXPIRED (403) when lessons etc. are locked. */
  async assertLearningAccess(learnerProfileId: string): Promise<void> {
    const access = await this.getLearningAccess(learnerProfileId);
    if (access.hasAccess) return;
    throw new AppError(
      403,
      SUBSCRIPTION_EXPIRED,
      access.status === "NONE"
        ? "This learner needs a subscription to use their courses."
        : "This learner's subscription has ended. Renew it to continue lessons and live classes. Exams stay open.",
    );
  }

  /**
   * True when the profile holds an active seat on a subscription whose
   * period hasn't ended. Only subscribed profiles can enrol in courses.
   */
  async isProfileSubscribed(learnerProfileId: string): Promise<boolean> {
    const seat = await prisma.seat.findFirst({
      where: {
        learnerProfileId,
        status: "ACTIVE",
        // Period end is checked as well as status: status only flips to
        // EXPIRED when the expiry job runs, which can lag behind.
        subscription: { status: "ACTIVE", currentPeriodEnd: { gt: new Date() } },
      },
      select: { id: true },
    });
    return seat !== null;
  }
}

export const seatService = new SeatService();
