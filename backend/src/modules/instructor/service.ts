import { prisma } from "#/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "#/shared/errors";
import type { InstructorApplicationInput } from "#/modules/instructor/schema";

export class InstructorService {
  async apply(userId: string, input: InstructorApplicationInput) {
    // Check user exists and isn't already an instructor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if already instructor or has pending application
    if (user.role.name === "Instructor") {
      throw new ConflictError("You are already an instructor");
    }

    // Store WWCC and application data
    // We use a simple approach: store in user metadata fields
    // For production, you'd have a separate InstructorApplication model
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Store application data in audit log for now
        // In a real app, you'd have an InstructorApplication table
      },
    });

    // Create audit log entry for the application
    await prisma.auditLog.create({
      data: {
        userId,
        action: "INSTRUCTOR_APPLICATION_SUBMITTED",
        resource: "instructor_application",
        resourceId: userId,
        details: {
          bio: input.bio,
          areaOfExpertise: input.areaOfExpertise,
          cvUrl: input.cvUrl,
          wwccNumber: input.wwccNumber,
          wwccState: input.wwccState,
          wwccExpiry: input.wwccExpiry,
        },
      },
    });

    return { message: "Application submitted successfully" };
  }

  async approve(adminId: string, userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.role.name === "Instructor") {
      throw new ConflictError("User is already an instructor");
    }

    // Get instructor role
    const instructorRole = await prisma.role.findUnique({
      where: { name: "Instructor" },
    });

    if (!instructorRole) {
      throw new Error("Instructor role not found — run seed");
    }

    // Update user role to instructor
    await prisma.user.update({
      where: { id: userId },
      data: { roleId: instructorRole.id },
    });

    // Log approval
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "INSTRUCTOR_APPROVED",
        resource: "instructor_application",
        resourceId: userId,
        details: { approvedBy: adminId },
      },
    });

    return { message: "Instructor approved" };
  }

  async reject(adminId: string, userId: string, reason?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.role.name === "Instructor") {
      throw new ConflictError("User is already an instructor");
    }

    // Log rejection
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "INSTRUCTOR_REJECTED",
        resource: "instructor_application",
        resourceId: userId,
        details: { rejectedBy: adminId, reason: reason ?? null },
      },
    });

    return { message: "Application rejected" };
  }

  async getPendingApplications() {
    // Get all users who submitted applications but aren't instructors yet
    const applications = await prisma.auditLog.findMany({
      where: {
        action: "INSTRUCTOR_APPLICATION_SUBMITTED",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        details: true,
        createdAt: true,
      },
    });

    // Filter out already approved/rejected
    const pending = [];
    for (const app of applications) {
      if (!app.userId) continue;

      const user = await prisma.user.findUnique({
        where: { id: app.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: { select: { name: true } },
        },
      });

      if (user && user.role.name !== "Instructor") {
        // Check if already rejected
        const rejection = await prisma.auditLog.findFirst({
          where: {
            userId: app.userId,
            action: "INSTRUCTOR_REJECTED",
          },
        });

        if (!rejection) {
          pending.push({
            applicationId: app.id,
            user,
            details: app.details,
            submittedAt: app.createdAt,
          });
        }
      }
    }

    return pending;
  }

  async suspend(adminId: string, instructorId: string) {
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      include: { role: true },
    });

    if (!instructor) {
      throw new NotFoundError("Instructor not found");
    }

    if (instructor.role.name !== "Instructor") {
      throw new ValidationError("User is not an instructor");
    }

    // Get account holder role
    const accountHolderRole = await prisma.role.findUnique({
      where: { name: "Account Holder" },
    });

    if (!accountHolderRole) {
      throw new Error("Account Holder role not found — run seed");
    }

    // Revert to account holder role
    await prisma.user.update({
      where: { id: instructorId },
      data: { roleId: accountHolderRole.id },
    });

    // Suspend their courses (FR-INST-07)
    await prisma.course.updateMany({
      where: { instructorId },
      data: { status: "SUSPENDED" },
    });

    // Log suspension
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "INSTRUCTOR_SUSPENDED",
        resource: "instructor",
        resourceId: instructorId,
        details: { suspendedBy: adminId },
      },
    });

    return { message: "Instructor suspended" };
  }
  async getApplicationStatus(userId: string) {
    // Check if user is already instructor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.role.name === "Instructor") {
      return { status: "APPROVED" };
    }

    // Check pending application
    const application = await prisma.auditLog.findFirst({
      where: {
        userId,
        action: "INSTRUCTOR_APPLICATION_SUBMITTED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!application) {
      return { status: "NONE" };
    }

    // Check if rejected
    const rejection = await prisma.auditLog.findFirst({
      where: {
        userId,
        action: "INSTRUCTOR_REJECTED",
      },
    });

    if (rejection) {
      return {
        status: "REJECTED",
        details: rejection.details,
      };
    }

    return { status: "PENDING" };
  }
}

export const instructorService = new InstructorService();
