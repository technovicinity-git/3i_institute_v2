import { prisma } from "#/lib/prisma";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";
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

  async getStudents(instructorId: string, courseId?: string) {
    // Get instructor's courses
    const courses = await prisma.course.findMany({
      where: {
        instructorId,
        ...(courseId ? { id: courseId } : {}),
      },
      select: {
        id: true,
        title: true,
      },
    });

    const courseIds = courses.map((c) => c.id);

    // Get all enrolments for these courses
    const enrolments = await prisma.enrolment.findMany({
      where: {
        courseId: { in: courseIds },
        waitlisted: false,
      },
      include: {
        learnerProfile: {
          select: {
            id: true,
            displayName: true,
            dateOfBirth: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const students = enrolments.map((enrolment) => ({
      id: enrolment.id,
      learnerProfileId: enrolment.learnerProfileId,
      displayName: enrolment.learnerProfile?.displayName ?? "Unknown",
      dateOfBirth: enrolment.learnerProfile?.dateOfBirth ?? null,
      courseId: enrolment.courseId,
      courseTitle: enrolment.course.title,
      enrolledAt: enrolment.enrolledAt,
      progress: 0, // TODO: Calculate from material progress
      attendanceRate: 0, // TODO: Calculate from attendance
      examAverage: null, // TODO: Calculate from exam attempts
    }));

    return {
      students,
      total: students.length,
    };
  }

  async getCertificates(instructorId: string, courseId?: string) {
    // Get instructor's courses
    const courses = await prisma.course.findMany({
      where: {
        instructorId,
        ...(courseId ? { id: courseId } : {}),
      },
      select: {
        id: true,
        title: true,
      },
    });

    const courseIds = courses.map((c) => c.id);
    // const courseTitles = Object.fromEntries(
    //   courses.map((c) => [c.id, c.title]),
    // );

    // Get certificates for these courses
    const certificates = await prisma.certificate.findMany({
      where: {
        courseId: { in: courseIds },
      },
      orderBy: { issuedAt: "desc" },
    });

    const formattedCertificates = certificates.map((cert) => ({
      id: cert.id,
      learnerName: cert.learnerNameSnapshot,
      courseTitle: cert.courseTitleSnapshot,
      type: cert.type,
      verificationCode: cert.verificationCode,
      issuedAt: cert.issuedAt,
      revokedAt: cert.revokedAt,
    }));

    return {
      certificates: formattedCertificates,
      total: formattedCertificates.length,
    };
  }

  async getCourseStudents(instructorId: string, courseId: string) {
    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, instructorId: true },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenError(
        "You can only view students for your own courses",
      );
    }

    // Get all enrolments for this course
    const enrolments = await prisma.enrolment.findMany({
      where: {
        courseId,
        waitlisted: false,
      },
      include: {
        learnerProfile: {
          select: {
            id: true,
            displayName: true,
            dateOfBirth: true,
            avatarUrl: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    // Get progress for these learners
    const learnerProfileIds = enrolments.map((e) => e.learnerProfileId);

    const materialProgress = await prisma.materialProgress.findMany({
      where: {
        learnerProfileId: { in: learnerProfileIds },
        material: { courseId },
      },
      select: {
        learnerProfileId: true,
        materialId: true,
        completed: true,
      },
    });

    // Get total materials in course
    const totalMaterials = await prisma.material.count({
      where: { courseId },
    });

    // Get exam attempts
    const examAttempts = await prisma.examAttempt.findMany({
      where: {
        learnerProfileId: { in: learnerProfileIds },
        exam: { courseId },
      },
      select: {
        learnerProfileId: true,
        score: true,
        totalMarks: true,
        passed: true,
      },
    });

    // Get attendance
    const attendance = await prisma.attendance.findMany({
      where: {
        learnerProfileId: { in: learnerProfileIds },
        session: {
          batch: { courseId },
        },
      },
      select: {
        learnerProfileId: true,
        status: true,
      },
    });

    // Compute per-student stats
    const students = enrolments.map((enrolment) => {
      const profile = enrolment.learnerProfile;

      // Progress
      const studentProgress = materialProgress.filter(
        (mp) => mp.learnerProfileId === enrolment.learnerProfileId,
      );
      const completedCount = studentProgress.filter(
        (mp) => mp.completed,
      ).length;
      const progress =
        totalMaterials > 0
          ? Math.round((completedCount / totalMaterials) * 100)
          : 0;

      // Exam average
      const studentAttempts = examAttempts.filter(
        (ea) => ea.learnerProfileId === enrolment.learnerProfileId,
      );
      const gradedAttempts = studentAttempts.filter(
        (ea) => ea.score !== null && ea.totalMarks > 0,
      );
      const examAverage =
        gradedAttempts.length > 0
          ? Math.round(
              (gradedAttempts.reduce(
                (sum, ea) => sum + ((ea.score ?? 0) / ea.totalMarks) * 100,
                0,
              ) /
                gradedAttempts.length) *
                10,
            ) / 10
          : null;

      // Attendance
      const studentAttendance = attendance.filter(
        (a) => a.learnerProfileId === enrolment.learnerProfileId,
      );
      const presentCount = studentAttendance.filter(
        (a) => a.status === "present" || a.status === "late",
      ).length;
      const attendanceRate =
        studentAttendance.length > 0
          ? Math.round((presentCount / studentAttendance.length) * 100)
          : null;

      return {
        id: enrolment.id,
        learnerProfileId: enrolment.learnerProfileId,
        displayName: profile?.displayName ?? "Unknown",
        dateOfBirth: profile?.dateOfBirth ?? null,
        avatarUrl: profile?.avatarUrl ?? null,
        batchName: enrolment.batch?.name ?? null,
        enrolledAt: enrolment.enrolledAt,
        progress,
        completedMaterials: completedCount,
        totalMaterials,
        examAverage,
        examAttempts: studentAttempts.length,
        attendanceRate,
      };
    });

    return {
      course: {
        id: course.id,
        title: course.title,
      },
      students,
      total: students.length,
    };
  }
}

export const instructorService = new InstructorService();
