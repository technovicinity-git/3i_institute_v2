import crypto from "node:crypto";
import { verify } from "argon2";
import { prisma } from "#/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "#/shared/errors";
import type { UpdateProfileInput } from "#/modules/user/schema";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        locale: true,
        accountType: true,
        emailVerified: true,
        dateOfBirth: true,
        bio: true,
        guardianName: true,
        guardianEmail: true,
        billingContactName: true,
        billingContactEmail: true,
        stripeCustomerId: true,
        avatarUrl: true,
        createdAt: true,
        role: {
          select: {
            name: true,
          },
        },
        learnerProfiles: {
          where: { deletedAt: null },
          select: {
            id: true,
            displayName: true,
            dateOfBirth: true,
            avatarUrl: true,
            chatEnabled: true,
            nameLocked: true,
          },
        },
        devices: {
          select: {
            id: true,
            deviceName: true,
            platform: true,
            lastUsedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        locale: true,
        accountType: true,
        emailVerified: true,
        billingContactName: true,
        billingContactEmail: true,
      },
    });

    return updated;
  }

  async changeEmail(userId: string, newEmail: string, currentPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify current password
    const isValid = await verify(user.passwordHash, currentPassword);

    if (!isValid) {
      throw new ValidationError("Current password is incorrect");
    }

    // Check if email is already taken
    const existingEmail = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingEmail && existingEmail.id !== userId) {
      throw new ConflictError("This email is already in use");
    }

    // Generate verification token
    const emailVerifyToken = generateToken();
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        emailVerified: false,
        emailVerifyToken,
        emailVerifyExpires,
      },
    });

    // TODO: Send verification email to new email

    return {
      message: "Email updated. Please verify your new email.",
      email: newEmail,
      emailVerified: false,
    };
  }
}

export const userService = new UserService();
