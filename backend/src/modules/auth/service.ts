import { hash, verify } from "argon2";

import { prisma } from "#/lib/prisma";
import { generateTokenPair, verifyRefreshToken } from "#/lib/jwt";
import {
  ConflictError,
  UnauthorizedError,
  AccountInactiveError,
  ValidationError,
} from "#/shared/errors";
import type {
  RegisterInput,
  LoginInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from "#/modules/auth/schema";
import { emailLinks } from "#/modules/email/links";
import { emailService } from "#/modules/email/service";
import {
  createEmailVerifyToken,
  createPasswordResetToken,
  EMAIL_VERIFY_TTL_HOURS,
  hashOneTimeToken,
  PASSWORD_RESET_TTL_MINUTES,
} from "#/shared/one-time-token";

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;

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

// Shared with registration.
export function sendVerificationEmail(
  user: { email: string; firstName: string },
  token: string,
): void {
  emailService.sendInBackground({
    to: user.email,
    template: "auth.verify-email",
    data: {
      firstName: user.firstName,
      verifyUrl: emailLinks.verifyEmail(token),
      expiresInHours: EMAIL_VERIFY_TTL_HOURS,
    },
  });
}

function sendPasswordChangedEmail(user: {
  email: string;
  firstName: string;
  timezone: string;
}): void {
  emailService.sendInBackground({
    to: user.email,
    template: "auth.password-changed",
    data: {
      firstName: user.firstName,
      changedAt: new Date(),
      timeZone: user.timezone,
      forgotPasswordUrl: emailLinks.forgotPassword(),
    },
  });
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
    const verification = createEmailVerifyToken();

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
        emailVerifyToken: verification.hash,
        emailVerifyExpires: verification.expiresAt,
        roleId: role.id,
      },
    });

    sendVerificationEmail(user, verification.token);

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

      if (failedAttempts >= MAX_FAILED_LOGINS) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: failedAttempts,
            lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000),
          },
        });
        emailService.sendInBackground({
          to: user.email,
          template: "account.locked",
          data: {
            firstName: user.firstName,
            lockedMinutes: LOCKOUT_MINUTES,
            forgotPasswordUrl: emailLinks.forgotPassword(),
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

    // Checked after the password so account status is not revealed to
    // someone who does not know the credentials.
    if (!user.isActive) {
      throw new AccountInactiveError();
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

    if (!user.isActive) {
      throw new AccountInactiveError();
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
    const user = await prisma.user.findUnique({
      where: { emailVerifyToken: hashOneTimeToken(token) },
    });

    if (
      !user ||
      !user.emailVerifyExpires ||
      user.emailVerifyExpires <= new Date()
    ) {
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

    // Always return success to prevent email enumeration. Deactivated
    // accounts can't sign in, so a reset link would be of no use.
    if (!user || !user.isActive) {
      return;
    }

    // A new request replaces any earlier link.
    const reset = createPasswordResetToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: reset.hash,
        passwordResetExpires: reset.expiresAt,
      },
    });

    emailService.sendInBackground({
      to: user.email,
      template: "auth.password-reset",
      data: {
        firstName: user.firstName,
        resetUrl: emailLinks.resetPassword(reset.token),
        expiresInMinutes: PASSWORD_RESET_TTL_MINUTES,
      },
    });
  }

  // ──────────────────────────────────
  // Reset password
  // ──────────────────────────────────
  async resetPassword(input: ResetPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { passwordResetToken: hashOneTimeToken(input.token) },
    });

    if (
      !user ||
      !user.passwordResetExpires ||
      user.passwordResetExpires <= new Date()
    ) {
      throw new ValidationError("Invalid or expired reset token");
    }

    const passwordHash = await hash(input.password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    sendPasswordChangedEmail(user);

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

    sendPasswordChangedEmail(user);
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

    // A new link replaces any earlier one.
    const verification = createEmailVerifyToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken: verification.hash,
        emailVerifyExpires: verification.expiresAt,
      },
    });

    sendVerificationEmail(user, verification.token);

    return { message: "Verification email sent." };
  }
}

export const authService = new AuthService();
