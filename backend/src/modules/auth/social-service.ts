import crypto from "node:crypto";
import { hash } from "argon2";
import { prisma } from "#/lib/prisma";
import { generateTokenPair } from "#/lib/jwt";
import { verifyGoogleToken, verifyAppleToken } from "#/lib/social-auth";
import { UnauthorizedError, ValidationError } from "#/shared/errors";
import type {
  GoogleLoginInput,
  AppleLoginInput,
} from "#/modules/auth/social-schema";

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

function generateRandomPassword(): string {
  return crypto.randomBytes(32).toString("hex");
}

export class SocialAuthService {
  async googleLogin(input: GoogleLoginInput) {
    const googleUser = await verifyGoogleToken(input.idToken);

    if (!googleUser.email) {
      throw new UnauthorizedError("Invalid Google token");
    }

    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      if (!input.dateOfBirth) {
        throw new ValidationError(
          "Date of birth is required for first-time social login",
        );
      }

      const dateOfBirth = new Date(input.dateOfBirth);
      const age = calculateAge(dateOfBirth);

      if (age < 13) {
        throw new ValidationError("Unable to process registration");
      }

      const accountType = age >= 18 ? "ADULT" : "STANDALONE_MINOR";

      const role = await prisma.role.findUnique({
        where: { name: "Account Holder" },
      });

      if (!role) {
        throw new Error("Default role not found — run seed");
      }

      user = await prisma.user.create({
        data: {
          firstName: googleUser.firstName || "Google",
          lastName: googleUser.lastName || "User",
          email: googleUser.email,
          passwordHash: await hash(generateRandomPassword()),
          dateOfBirth,
          locale: input.locale ?? "en",
          accountType,
          emailVerified: googleUser.emailVerified,
          roleId: role.id,
        },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      });
    } else {
      if (!user.emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });
        user.emailVerified = true;
      }
    }

    return this.generateTokens(user);
  }

  async appleLogin(input: AppleLoginInput) {
    const appleUser = await verifyAppleToken(
      input.identityToken,
      input.authorizationCode,
    );

    if (!appleUser.email) {
      throw new UnauthorizedError("Invalid Apple token");
    }

    let user = await prisma.user.findUnique({
      where: { email: appleUser.email },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user) {
      if (!input.dateOfBirth) {
        throw new ValidationError(
          "Date of birth is required for first-time social login",
        );
      }

      const dateOfBirth = new Date(input.dateOfBirth);
      const age = calculateAge(dateOfBirth);

      if (age < 13) {
        throw new ValidationError("Unable to process registration");
      }

      const accountType = age >= 18 ? "ADULT" : "STANDALONE_MINOR";

      const role = await prisma.role.findUnique({
        where: { name: "Account Holder" },
      });

      if (!role) {
        throw new Error("Default role not found — run seed");
      }

      user = await prisma.user.create({
        data: {
          firstName: input.firstName ?? "Apple",
          lastName: input.lastName ?? "User",
          email: appleUser.email,
          passwordHash: await hash(generateRandomPassword()),
          dateOfBirth,
          locale: input.locale ?? "en",
          accountType,
          emailVerified: appleUser.emailVerified,
          roleId: role.id,
        },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      });
    } else {
      if (!user.emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });
        user.emailVerified = true;
      }
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: any) {
    const permissions = user.role.permissions.map(
      (rp: any) => rp.permission.key,
    );

    const tokens = generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions,
    });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await hash(tokens.refreshToken),
        deviceInfo: "social-login",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        locale: user.locale,
        emailVerified: user.emailVerified,
        role: user.role.name,
      },
      tokens,
    };
  }
}

export const socialAuthService = new SocialAuthService();
