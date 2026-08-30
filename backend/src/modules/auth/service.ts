import { hash, verify } from "argon2";
import crypto from "node:crypto";

import { prisma } from "#/lib/prisma";
import { generateTokenPair, verifyRefreshToken } from "#/lib/jwt";
import {
  ConflictError,
  UnauthorizedError,
  ValidationError,
} from "#/shared/errors";
import type {
  RegisterInput,
  LoginInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from "#/modules/auth/schema";

// ──────────────────────────────────────
// Helpers
// ──────────────────────────────────────

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

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ──────────────────────────────────────
// Auth Service
// ──────────────────────────────────────

export class AuthService {
  // ──────────────────────────────────
  // Register
  // ──────────────────────────────────
  async register(input: RegisterInput) {
    const dateOfBirth = new Date(input.dateOfBirth);
    const age = calculateAge(dateOfBirth);

    // Adult registration only — age must be 18+
    if (age < 18) {
      throw new ValidationError(
        "You must be at least 18 years old to create an account",
      );
    }

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await hash(input.password);
    const emailVerifyToken = generateToken();
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Get Account Holder role
    const role = await prisma.role.findUnique({
      where: { name: "Account Holder" },
    });

    if (!role) {
      throw new Error("Default role not found — run seed");
    }

    const user = await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        passwordHash,
        dateOfBirth,
        locale: input.locale,
        accountType: "ADULT",
        emailVerified: false,
        emailVerifyToken,
        emailVerifyExpires,
        roleId: role.id,
      },
    });

    // TODO: Send verification email with emailVerifyToken

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        locale: user.locale,
        emailVerified: user.emailVerified,
        role: role.name,
      },
    };
  }

  // ──────────────────────────────────
  // Login
  // ──────────────────────────────────
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Check account lockout (FR-AUTH-09)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedError(
        `Account is locked. Try again in ${remainingMinutes} minutes.`,
      );
    }

    // Verify password
    const isValid = await verify(user.passwordHash, input.password);

    if (!isValid) {
      const failedAttempts = user.failedLoginAttempts + 1;

      // Lock after 5 failed attempts
      if (failedAttempts >= 5) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: failedAttempts,
            lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
          },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: failedAttempts },
        });
      }

      throw new UnauthorizedError("Invalid email or password");
    }

    // Reset failed attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    const permissions = user.role.permissions.map(
      (rp: { permission: { key: string } }) => rp.permission.key,
    );

    const tokens = generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await hash(tokens.refreshToken),
        deviceInfo: null,
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

  // ──────────────────────────────────
  // Refresh tokens
  // ──────────────────────────────────
  async refreshTokens(refreshToken: string) {
    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    // Find the stored token by comparing hashes
    const storedTokens = await prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    let matchingToken = null;
    for (const stored of storedTokens) {
      const matches = await verify(stored.tokenHash, refreshToken);
      if (matches) {
        matchingToken = stored;
        break;
      }
    }

    if (!matchingToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: matchingToken.id },
      data: { revokedAt: new Date() },
    });

    // Get user with permissions
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
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
      throw new UnauthorizedError("User not found");
    }

    const permissions = user.role.permissions.map(
      (rp: { permission: { key: string } }) => rp.permission.key,
    );

    const tokens = generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions,
    });

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await hash(tokens.refreshToken),
        deviceInfo: null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  // ──────────────────────────────────
  // Logout
  // ──────────────────────────────────
  async logout(userId: string) {
    // Revoke all refresh tokens for this user
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  // ──────────────────────────────────
  // Verify email
  // ──────────────────────────────────
  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new ValidationError("Invalid or expired verification token");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });
  }

  // ──────────────────────────────────
  // Forgot password (generates reset token)
  // ──────────────────────────────────
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return;
    }

    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: resetToken, // Reusing emailVerifyToken field for password reset
        emailVerifyExpires: resetExpires,
      },
    });

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetToken);
  }

  // ──────────────────────────────────
  // Reset password
  // ──────────────────────────────────
  async resetPassword(input: ResetPasswordInput) {
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: input.token,
        emailVerifyExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new ValidationError("Invalid or expired reset token");
    }

    const passwordHash = await hash(input.password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerifyToken: null,
        emailVerifyExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Revoke all existing refresh tokens (force re-login everywhere)
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ──────────────────────────────────
  // Change password (authenticated)
  // ──────────────────────────────────
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const isValid = await verify(user.passwordHash, input.currentPassword);

    if (!isValid) {
      throw new ValidationError("Current password is incorrect");
    }

    const passwordHash = await hash(input.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success to prevent email enumeration
      return {
        message:
          "If an account with that email exists, a verification email has been sent.",
      };
    }

    if (user.emailVerified) {
      return { message: "Email is already verified. You can log in." };
    }

    // Generate new token
    const emailVerifyToken = generateToken();
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken,
        emailVerifyExpires,
      },
    });

    // TODO: Send verification email with new token

    return { message: "Verification email sent." };
  }
}

export const authService = new AuthService();
