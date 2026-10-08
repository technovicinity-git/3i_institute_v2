import crypto from "node:crypto";
import { prisma } from "#/lib/prisma";
import { NotFoundError, ValidationError } from "#/shared/errors";
import { notificationEvents } from "#/modules/notification/events";
import { canManageCourse } from "#/shared/course-access";

function generateVerificationCode(): string {
  return crypto.randomBytes(16).toString("hex").toUpperCase();
}

export class CertificateService {
  async issueAttendanceCertificate(learnerProfileId: string, courseId: string) {
    // Verify enrolment exists
    const enrolment = await prisma.enrolment.findFirst({
      where: {
        learnerProfileId,
        courseId,
        waitlisted: false,
      },
    });

    if (!enrolment) {
      throw new NotFoundError("Enrolment not found");
    }

    // Check if already issued
    const existing = await prisma.certificate.findFirst({
      where: {
        learnerProfileId,
        courseId,
        type: "ATTENDANCE",
      },
    });

    if (existing) {
      return existing;
    }

    // Get learner profile and course info for snapshot
    const [profile, course] = await Promise.all([
      prisma.learnerProfile.findUnique({ where: { id: learnerProfileId } }),
      prisma.course.findUnique({ where: { id: courseId } }),
    ]);

    if (!profile || !course) {
      throw new NotFoundError("Profile or course not found");
    }

    const certificate = await prisma.certificate.create({
      data: {
        learnerProfileId,
        courseId,
        type: "ATTENDANCE",
        verificationCode: generateVerificationCode(),
        learnerNameSnapshot: profile.displayName,
        courseTitleSnapshot: course.title,
        issuerName: "3i International Islamic Institute",
      },
    });

    notificationEvents.certificatesIssued(courseId, [learnerProfileId], "ATTENDANCE");

    return certificate;
  }

  async issueCompletionCertificate(learnerProfileId: string, courseId: string) {
    // Check final exam passed
    const examAttempt = await prisma.examAttempt.findFirst({
      where: {
        learnerProfileId,
        exam: {
          courseId,
          type: "final",
        },
        passed: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!examAttempt) {
      throw new ValidationError(
        "Final exam must be passed before issuing completion certificate",
      );
    }

    // Check if already issued
    const existing = await prisma.certificate.findFirst({
      where: {
        learnerProfileId,
        courseId,
        type: "COMPLETION",
      },
    });

    if (existing) {
      return existing;
    }

    const [profile, course] = await Promise.all([
      prisma.learnerProfile.findUnique({ where: { id: learnerProfileId } }),
      prisma.course.findUnique({ where: { id: courseId } }),
    ]);

    if (!profile || !course) {
      throw new NotFoundError("Profile or course not found");
    }

    // Lock the name (FR-FAM-05)
    await prisma.learnerProfile.update({
      where: { id: learnerProfileId },
      data: { nameLocked: true },
    });

    const certificate = await prisma.certificate.create({
      data: {
        learnerProfileId,
        courseId,
        type: "COMPLETION",
        verificationCode: generateVerificationCode(),
        learnerNameSnapshot: profile.displayName,
        courseTitleSnapshot: course.title,
        issuerName: "3i International Islamic Institute",
      },
    });

    notificationEvents.certificatesIssued(courseId, [learnerProfileId], "COMPLETION");

    return certificate;
  }

  async getLearnerCertificates(accountId: string, learnerProfileId: string) {
    const profile = await prisma.learnerProfile.findFirst({
      where: { id: learnerProfileId, accountId, deletedAt: null },
      select: { id: true },
    });
    if (!profile) throw new NotFoundError("Learner profile not found");

    return prisma.certificate.findMany({
      where: {
        learnerProfileId,
        revokedAt: null,
      },
      select: {
        id: true,
        type: true,
        verificationCode: true,
        learnerNameSnapshot: true,
        courseTitleSnapshot: true,
        courseId: true,
        issuerName: true,
        examId: true,
        details: true,
        issuedAt: true,
      },
      orderBy: { issuedAt: "desc" },
    });
  }

  async issueOnlineFinalExamCertificates(instructorId: string, examId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { course: true },
    });
    if (!exam) throw new NotFoundError("Exam not found");
    if (!(await canManageCourse(instructorId, exam.course.instructorId))) {
      throw new NotFoundError("Exam not found");
    }
    if (exam.type !== "final" || exam.course.type !== "ONLINE_CLASS") {
      throw new ValidationError(
        "Certificates can only be issued for online class final exams",
      );
    }

    const attempts = await prisma.examAttempt.findMany({
      where: { examId },
      orderBy: [{ learnerProfileId: "asc" }, { attemptNumber: "desc" }],
      select: {
        learnerProfileId: true,
        attemptNumber: true,
        score: true,
        totalMarks: true,
        passed: true,
        graded: true,
      },
    });
    const ungradedCount = attempts.filter((attempt) => !attempt.graded).length;
    if (ungradedCount > 0) {
      throw new ValidationError(
        `Cannot issue certificates while ${ungradedCount} exam attempt(s) still need grading.`,
      );
    }
    if (attempts.length === 0) {
      throw new ValidationError("No learner attempts were found for this exam");
    }

    // Attempts are sorted newest first for each learner. A certificate is
    // awarded only when that learner's latest final-exam attempt was passed.
    const latestByLearner = new Map<string, (typeof attempts)[number]>();
    for (const attempt of attempts) {
      if (!latestByLearner.has(attempt.learnerProfileId)) {
        latestByLearner.set(attempt.learnerProfileId, attempt);
      }
    }
    const eligible = [...latestByLearner.entries()].filter(([, attempt]) => attempt.passed);
    if (eligible.length === 0) {
      return { issued: 0, alreadyIssued: 0, notPassed: latestByLearner.size };
    }

    const eligibleIds = eligible.map(([learnerProfileId]) => learnerProfileId);
    const existing = await prisma.certificate.findMany({
      where: {
        learnerProfileId: { in: eligibleIds },
        courseId: exam.courseId,
        type: "COMPLETION",
      },
      select: { learnerProfileId: true },
    });
    const existingIds = new Set(existing.map((certificate) => certificate.learnerProfileId));
    const toIssue = eligible.filter(([learnerProfileId]) => !existingIds.has(learnerProfileId));
    const profiles = await prisma.learnerProfile.findMany({
      where: { id: { in: toIssue.map(([learnerProfileId]) => learnerProfileId) } },
      select: { id: true, displayName: true },
    });
    const profileById = new Map(profiles.map((profile) => [profile.id, profile]));

    const records = toIssue.flatMap(([learnerProfileId, attempt]) => {
      const profile = profileById.get(learnerProfileId);
      if (!profile) return [];
      return [{
        learnerProfileId,
        courseId: exam.courseId,
        examId: exam.id,
        type: "COMPLETION" as const,
        verificationCode: generateVerificationCode(),
        learnerNameSnapshot: profile.displayName,
        courseTitleSnapshot: exam.course.title,
        issuerName: "3i International Islamic Institute",
        details: JSON.parse(JSON.stringify({
          examTitle: exam.title,
          score: attempt.score,
          totalMarks: attempt.totalMarks,
          attemptNumber: attempt.attemptNumber,
          passed: attempt.passed,
          graded: attempt.graded,
        })),
      }];
    });

    let createdCount = 0;
    if (records.length > 0) {
      const [created] = await prisma.$transaction([
        prisma.certificate.createMany({ data: records, skipDuplicates: true }),
        prisma.learnerProfile.updateMany({
          where: { id: { in: records.map((record) => record.learnerProfileId) } },
          data: { nameLocked: true },
        }),
      ]);
      createdCount = created.count;
      notificationEvents.certificatesIssued(
        exam.courseId,
        records.map((record) => record.learnerProfileId),
        "COMPLETION",
      );
    }

    return {
      issued: createdCount,
      alreadyIssued: existing.length + records.length - createdCount,
      notPassed: latestByLearner.size - eligible.length,
    };
  }

  /**
   * REGULAR course exam certificate. Requires at least one exam attempt on the
   * course and can only be issued once — subsequent calls return the existing
   * certificate. The certificate snapshot includes course progress status and
   * the learner's last exam score.
   */
  async issueExamCertificate(
    accountId: string,
    learnerProfileId: string,
    courseId: string,
  ) {
    // Verify enrolment exists
    const enrolment = await prisma.enrolment.findFirst({
      where: {
        learnerProfileId,
        courseId,
        waitlisted: false,
      },
    });

    if (!enrolment) {
      throw new NotFoundError("Enrolment not found");
    }

    const [profile, course] = await Promise.all([
      prisma.learnerProfile.findUnique({ where: { id: learnerProfileId } }),
      prisma.course.findUnique({ where: { id: courseId } }),
    ]);

    if (!profile || profile.accountId !== accountId) {
      throw new NotFoundError("Learner profile not found");
    }
    if (!course) {
      throw new NotFoundError("Course not found");
    }
    if (course.type !== "REGULAR") {
      throw new ValidationError("Exam certificates are available for regular courses");
    }

    // Only one certificate per learner + course
    const existing = await prisma.certificate.findFirst({
      where: {
        learnerProfileId,
        courseId,
        type: "EXAM",
      },
    });

    if (existing) {
      return existing;
    }

    // Use the most recent submitted attempt, never an in-progress attempt.
    const lastAttempt = await prisma.examAttempt.findFirst({
      where: {
        learnerProfileId,
        exam: { courseId },
        submittedAt: { not: null },
      },
      orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
      include: {
        exam: { select: { id: true, title: true } },
      },
    });

    if (!lastAttempt) {
      throw new ValidationError(
        "You must take the exam at least once before generating a certificate",
      );
    }

    // Course progress status (completed materials / total materials)
    const [totalMaterials, completedMaterials] = await Promise.all([
      prisma.material.count({ where: { courseId } }),
      prisma.materialProgress.count({
        where: {
          learnerProfileId,
          completed: true,
          material: { courseId },
        },
      }),
    ]);

    const progress =
      totalMaterials > 0
        ? Math.round((completedMaterials / totalMaterials) * 100)
        : 0;

    try {
      const certificate = await prisma.certificate.create({
        data: {
          learnerProfileId,
          courseId,
          examId: lastAttempt.exam.id,
          type: "EXAM",
          verificationCode: generateVerificationCode(),
          learnerNameSnapshot: profile.displayName,
          courseTitleSnapshot: course.title,
          issuerName: "3i International Islamic Institute",
          details: JSON.parse(
            JSON.stringify({
              progress,
              completedLessons: completedMaterials,
              totalLessons: totalMaterials,
              score: lastAttempt.score,
              totalMarks: lastAttempt.totalMarks,
              examTitle: lastAttempt.exam.title,
              attemptNumber: lastAttempt.attemptNumber,
              passed: lastAttempt.passed,
              graded: lastAttempt.graded,
            }),
          ),
        },
      });
      notificationEvents.certificatesIssued(courseId, [learnerProfileId], "EXAM");
      return certificate;
    } catch (error) {
      // The unique key makes concurrent requests issue at most one record.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        const alreadyIssued = await prisma.certificate.findFirst({
          where: { learnerProfileId, courseId, type: "EXAM" },
        });
        if (alreadyIssued) return alreadyIssued;
      }
      throw error;
    }
  }

  /**
   * Returns the REGULAR course exam certificate for a learner (or null if not
   * generated yet).
   */
  async getExamCertificate(
    accountId: string,
    learnerProfileId: string,
    courseId: string,
  ) {
    const profile = await prisma.learnerProfile.findFirst({
      where: { id: learnerProfileId, accountId },
      select: { id: true },
    });
    if (!profile) throw new NotFoundError("Learner profile not found");

    return prisma.certificate.findFirst({
      where: {
        learnerProfileId,
        courseId,
        type: "EXAM",
        revokedAt: null,
      },
      orderBy: { issuedAt: "desc" },
    });
  }

  async verifyCertificate(verificationCode: string) {
    const certificate = await prisma.certificate.findUnique({
      where: { verificationCode },
      select: {
        id: true,
        type: true,
        verificationCode: true,
        learnerNameSnapshot: true,
        courseTitleSnapshot: true,
        issuerName: true,
        issuedAt: true,
        revokedAt: true,
        revokeReason: true,
      },
    });

    if (!certificate) {
      throw new NotFoundError("Certificate not found");
    }

    return certificate;
  }

  async revokeCertificate(
    adminId: string,
    certificateId: string,
    reason: string,
  ) {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
    });

    if (!certificate) {
      throw new NotFoundError("Certificate not found");
    }

    if (certificate.revokedAt) {
      throw new ValidationError("Certificate already revoked");
    }

    const revoked = await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "CERTIFICATE_REVOKED",
        resource: "certificate",
        resourceId: certificateId,
        details: { reason },
      },
    });

    return revoked;
  }
}

export const certificateService = new CertificateService();
