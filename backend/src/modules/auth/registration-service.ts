import crypto from "node:crypto";
import { hash } from "argon2";
import { prisma } from "#/lib/prisma";
import { generateTokenPair } from "#/lib/jwt";
import { ConflictError, ValidationError } from "#/shared/errors";
import type {
  LearnerRegistrationInput,
  InstructorRegistrationInput,
} from "#/modules/auth/registration-schema";

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

export class RegistrationService {
  // ──────────────────────────────────
  // Learner Registration
  // Creates account + learner profile together
  // ──────────────────────────────────
  async registerLearner(input: LearnerRegistrationInput) {
    const dateOfBirth = new Date(input.dateOfBirth);
    const age = calculateAge(dateOfBirth);

    // Account holder must be 13+ to have their own account
    if (age < 13) {
      throw new ValidationError("Unable to process registration");
    }

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await hash(input.password);
    const accountType = age >= 18 ? "ADULT" : "STANDALONE_MINOR";

    // Guardian info required for standalone minors (13-17)
    if (accountType === "STANDALONE_MINOR") {
      if (!input.guardianName || !input.guardianEmail) {
        throw new ValidationError(
          "Guardian name and email are required for users under 18",
        );
      }
    }

    // Get Account Holder role
    const role = await prisma.role.findUnique({
      where: { name: "Account Holder" },
    });

    if (!role) {
      throw new Error("Default role not found — run seed");
    }

    // Create user + learner profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user account
      const newUser = await tx.user.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          passwordHash,
          dateOfBirth,
          locale: input.locale,
          accountType,
          emailVerified: false,
          emailVerifyToken: generateToken(),
          emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          roleId: role.id,
          ...(accountType === "STANDALONE_MINOR"
            ? {
                guardianName: input.guardianName,
                guardianEmail: input.guardianEmail,
              }
            : {}),
        },
      });

      // Create learner profile
      const learnerDateOfBirth = new Date(input.learnerDateOfBirth);
      const learnerAge = calculateAge(learnerDateOfBirth);
      const pinHash = input.learnerPin ? await hash(input.learnerPin) : null;

      await tx.learnerProfile.create({
        data: {
          accountId: newUser.id,
          displayName: input.learnerDisplayName,
          dateOfBirth: learnerDateOfBirth,
          avatarUrl: input.learnerAvatarUrl ?? null,
          pinHash,
          chatEnabled: learnerAge >= 13 ? false : false, // Under 13 always off
        },
      });

      return newUser;
    });

    // Get user with role and permissions for JWT
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
        learnerProfiles: {
          where: { deletedAt: null },
        },
      },
    });

    if (!userWithRole) {
      throw new Error("User creation failed");
    }

    const permissions = userWithRole.role.permissions.map(
      (rp) => rp.permission.key,
    );

    const tokens = generateTokenPair({
      sub: userWithRole.id,
      email: userWithRole.email,
      role: userWithRole.role.name,
      permissions,
    });

    await prisma.refreshToken.create({
      data: {
        userId: userWithRole.id,
        tokenHash: await hash(tokens.refreshToken),
        deviceInfo: null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: userWithRole.id,
        firstName: userWithRole.firstName,
        lastName: userWithRole.lastName,
        email: userWithRole.email,
        locale: userWithRole.locale,
        emailVerified: userWithRole.emailVerified,
        learnerProfiles: userWithRole.learnerProfiles,
      },
      tokens,
    };
  }

  // ──────────────────────────────────
  // Instructor Registration
  // Creates account + instructor application together
  // Status: Pending Approval
  // ──────────────────────────────────
  async registerInstructor(input: InstructorRegistrationInput) {
    const dateOfBirth = new Date(input.dateOfBirth);
    const age = calculateAge(dateOfBirth);

    // Instructor must be 18+
    if (age < 18) {
      throw new ValidationError("Instructors must be at least 18 years old");
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

    // Get Account Holder role initially
    // They get "Instructor" role only after approval
    const accountHolderRole = await prisma.role.findUnique({
      where: { name: "Account Holder" },
    });

    if (!accountHolderRole) {
      throw new Error("Default role not found — run seed");
    }

    // Create user + instructor application in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user account with Account Holder role (Instructor role after approval)
      const newUser = await tx.user.create({
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
          emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          roleId: accountHolderRole.id,
        },
      });

      // Create instructor application (stored as audit log for now)
      // In production, you'd have a dedicated InstructorApplication table
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: "INSTRUCTOR_APPLICATION_SUBMITTED",
          resource: "instructor_application",
          resourceId: newUser.id,
          details: {
            bio: input.bio,
            areaOfExpertise: input.areaOfExpertise,
            cvUrl: input.cvUrl,
            wwccNumber: input.wwccNumber,
            wwccState: input.wwccState,
            wwccExpiry: input.wwccExpiry,
            status: "PENDING",
          },
        },
      });

      return newUser;
    });

    // Get user with role for response
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.id },
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

    if (!userWithRole) {
      throw new Error("User creation failed");
    }

    const permissions = userWithRole.role.permissions.map(
      (rp) => rp.permission.key,
    );

    const tokens = generateTokenPair({
      sub: userWithRole.id,
      email: userWithRole.email,
      role: userWithRole.role.name,
      permissions,
    });

    await prisma.refreshToken.create({
      data: {
        userId: userWithRole.id,
        tokenHash: await hash(tokens.refreshToken),
        deviceInfo: null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: userWithRole.id,
        firstName: userWithRole.firstName,
        lastName: userWithRole.lastName,
        email: userWithRole.email,
        locale: userWithRole.locale,
        emailVerified: userWithRole.emailVerified,
      },
      instructorApplication: {
        status: "PENDING",
        message: "Instructor application submitted. Awaiting approval.",
      },
      tokens,
    };
  }
}

export const registrationService = new RegistrationService();
