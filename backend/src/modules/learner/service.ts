import { hash, verify } from "argon2";
import { prisma } from "#/lib/prisma";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";
import type {
  CreateLearnerInput,
  UpdateLearnerInput,
} from "#/modules/learner/schema";

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }
  return age;
}

export class LearnerService {
  /**
   * Create learner profile
   *
   * Rules:
   * - Only adult account holders can create profiles
   * - Max 6 profiles per account
   * - PIN mandatory when parent creates profile for child (under 13)
   * - PIN optional when creating profile for self (adult studying alone)
   * - Under 13: chat always off
   * - 13-17: chat is guardian toggle
   */
  async create(userId: string, input: CreateLearnerInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        learnerProfiles: {
          where: { deletedAt: null },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // FR-FAM-01: Only adult account holders can create profiles
    if (user.accountType !== "ADULT") {
      throw new ForbiddenError(
        "Only adult account holders can create learner profiles",
      );
    }

    // FR-FAM-02: Max 6 profiles
    if (user.learnerProfiles.length >= 6) {
      throw new ConflictError("Maximum of 6 learner profiles reached");
    }

    const dateOfBirth = new Date(input.dateOfBirth);
    const age = calculateAge(dateOfBirth);

    // PIN enforcement:
    // - Child profile (under 13): PIN mandatory
    // - Self profile (adult): PIN optional
    if (age < 13 && !input.pin) {
      throw new ValidationError(
        "PIN is required when creating a profile for a child under 13",
      );
    }

    const pinHash = input.pin ? await hash(input.pin) : null;

    // Chat access rules
    let chatEnabled = false;
    if (age >= 13) {
      chatEnabled = input.chatEnabled ?? false;
    }
    // Under 13: always off (FR-FAM-08)

    // New profiles are inactive until a seat is assigned
    const profile = await prisma.learnerProfile.create({
      data: {
        accountId: userId,
        displayName: input.displayName,
        dateOfBirth,
        avatarUrl: input.avatarUrl ?? null,
        pinHash,
        chatEnabled,
        isActive: false,
      },
    });

    return profile;
  }

  async getAll(userId: string) {
    const profiles = await prisma.learnerProfile.findMany({
      where: {
        accountId: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        displayName: true,
        dateOfBirth: true,
        avatarUrl: true,
        chatEnabled: true,
        nameLocked: true,
        isActive: true,
        pinHash: true,
        createdAt: true,
        seats: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            assignedAt: true,
          },
          take: 1,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return profiles.map((profile) => ({
      id: profile.id,
      displayName: profile.displayName,
      dateOfBirth: profile.dateOfBirth,
      avatarUrl: profile.avatarUrl,
      chatEnabled: profile.chatEnabled,
      nameLocked: profile.nameLocked,
      isActive: profile.isActive,
      hasPin: profile.pinHash !== null,
      hasSeat: profile.seats.length > 0,
      createdAt: profile.createdAt,
    }));
  }

  async getById(userId: string, profileId: string) {
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: profileId,
        accountId: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        displayName: true,
        dateOfBirth: true,
        avatarUrl: true,
        chatEnabled: true,
        nameLocked: true,
        isActive: true,
        pinHash: true,
        createdAt: true,
        seats: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            assignedAt: true,
          },
          take: 1,
        },
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    return {
      ...profile,
      hasPin: profile.pinHash !== null,
      pinHash: undefined, // Never expose hash
    };
  }

  async update(userId: string, profileId: string, input: UpdateLearnerInput) {
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: profileId,
        accountId: userId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // FR-FAM-05: Name locked if certificate issued
    if (input.displayName && profile.nameLocked) {
      throw new ConflictError(
        "Name cannot be changed after a certificate has been issued. Contact support.",
      );
    }

    const pinHash =
      input.pin !== undefined
        ? input.pin
          ? await hash(input.pin)
          : null
        : undefined;

    const updated = await prisma.learnerProfile.update({
      where: { id: profileId },
      data: {
        ...(input.displayName !== undefined && {
          displayName: input.displayName,
        }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
        ...(pinHash !== undefined && { pinHash }),
        ...(input.chatEnabled !== undefined && {
          chatEnabled: input.chatEnabled,
        }),
      },
    });

    return {
      id: updated.id,
      displayName: updated.displayName,
      dateOfBirth: updated.dateOfBirth,
      avatarUrl: updated.avatarUrl,
      chatEnabled: updated.chatEnabled,
      nameLocked: updated.nameLocked,
      isActive: updated.isActive,
    };
  }

  /**
   * Verify PIN for profile switching
   */
  async verifyPin(userId: string, profileId: string, pin: string) {
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: profileId,
        accountId: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        pinHash: true,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    if (!profile.pinHash) {
      // No PIN set — allow access
      return { valid: true, requiresPin: false };
    }

    const isValid = await verify(profile.pinHash, pin);

    if (!isValid) {
      throw new ValidationError("Incorrect PIN");
    }

    return { valid: true, requiresPin: true };
  }

  /**
   * Delete profile
   *
   * Data retention rules:
   * - Removed: progress, enrolments, exam results
   * - Kept: certificates (remain valid and verifiable)
   * - Kept: safety report records (message content removed)
   */
  async delete(userId: string, profileId: string) {
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: profileId,
        accountId: userId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // Check if profile has active seat — must cancel first
    const activeSeat = await prisma.seat.findFirst({
      where: {
        learnerProfileId: profileId,
        status: "ACTIVE",
      },
    });

    if (activeSeat) {
      throw new ValidationError(
        "Profile has an active seat. Cancel the seat before deleting the profile.",
      );
    }

    // Soft delete profile
    // Certificates have onDelete: SetNull — they survive
    // Progress, enrolments, exam results have onDelete: Cascade — they're removed
    await prisma.learnerProfile.update({
      where: { id: profileId },
      data: { deletedAt: new Date() },
    });

    // Preserve safety report records but remove message content
    // Chat reports are in audit logs with action CHAT_REPORT
    // We update the details to remove message content but keep report metadata
    const chatReports = await prisma.auditLog.findMany({
      where: {
        action: "CHAT_REPORT",
        details: {
          path: ["profileId"],
          equals: profileId,
        },
      },
    });

    for (const report of chatReports) {
      const details = (report.details as any) ?? {};
      // Remove message content, keep report metadata
      const sanitizedDetails = {
        reportId: details.reportId ?? report.id,
        reason: details.reason ?? "Reported",
        reportedAt: details.reportedAt ?? report.createdAt,
        profileDeleted: true,
        profileId: profileId,
        // messageContent is deliberately excluded
      };

      await prisma.auditLog.update({
        where: { id: report.id },
        data: {
          details: JSON.parse(JSON.stringify(sanitizedDetails)),
        },
      });
    }
  }

  /**
   * Reset PIN (parent forgets PIN)
   */
  async resetPin(userId: string, profileId: string, newPin: string) {
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: profileId,
        accountId: userId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    const pinHash = await hash(newPin);

    await prisma.learnerProfile.update({
      where: { id: profileId },
      data: { pinHash },
    });
  }
}

export const learnerService = new LearnerService();
