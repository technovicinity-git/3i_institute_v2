import { hash } from "argon2";
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

    // FR-FAM-03: Profiles must have DOB
    const pinHash = input.pin ? await hash(input.pin) : null;

    const profile = await prisma.learnerProfile.create({
      data: {
        accountId: userId,
        displayName: input.displayName,
        dateOfBirth,
        avatarUrl: input.avatarUrl ?? null,
        pinHash,
        chatEnabled: age >= 13 ? (input.chatEnabled ?? false) : false, // Under 13: always off
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
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return profiles;
  }

  async getById(userId: string, profileId: string) {
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

    return profile;
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

    return updated;
  }

  async delete(userId: string, profileId: string) {
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: profileId,
        accountId: userId,
        deletedAt: null,
      },
      include: {
        certificates: {
          where: { revokedAt: null },
          take: 1,
        },
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // FR-FAM-10: Soft delete — progress and enrolments removed,
    // but certificates remain valid (nullable foreign key onDelete: SetNull)
    await prisma.learnerProfile.update({
      where: { id: profileId },
      data: { deletedAt: new Date() },
    });
  }
}

export const learnerService = new LearnerService();
