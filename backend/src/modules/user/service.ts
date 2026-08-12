import { prisma } from "#/lib/prisma";
import { NotFoundError } from "#/shared/errors";
import type { UpdateProfileInput } from "#/modules/user/schema";

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
        guardianName: true,
        guardianEmail: true,
        billingContactName: true,
        billingContactEmail: true,
        stripeCustomerId: true,
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
}

export const userService = new UserService();
