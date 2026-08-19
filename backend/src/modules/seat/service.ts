import { prisma } from "#/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "#/shared/errors";

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

    // Assign seat
    const seat = await prisma.seat.create({
      data: {
        subscriptionId: subscription.id,
        learnerProfileId: input.learnerProfileId,
        status: "ACTIVE",
      },
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
}

export const seatService = new SeatService();
