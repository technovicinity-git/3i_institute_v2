import crypto from "node:crypto";
import { prisma } from "#/lib/prisma";
import { NotFoundError, ValidationError } from "#/shared/errors";

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

    return certificate;
  }

  async getLearnerCertificates(learnerProfileId: string) {
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
        issuedAt: true,
      },
      orderBy: { issuedAt: "desc" },
    });
  }

  /**
   * REGULAR course exam certificate. Requires at least one exam attempt on the
   * course and can only be issued once — subsequent calls return the existing
   * certificate. The certificate snapshot includes course progress status and
   * the learner's last exam score.
   */
  async issueExamCertificate(learnerProfileId: string, courseId: string) {
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

    // A certificate can only be generated after at least one exam attempt
    const lastAttempt = await prisma.examAttempt.findFirst({
      where: {
        learnerProfileId,
        exam: { courseId },
      },
      orderBy: { submittedAt: "desc" },
      include: {
        exam: { select: { id: true, title: true } },
      },
    });

    if (!lastAttempt) {
      throw new ValidationError(
        "You must take the exam at least once before generating a certificate",
      );
    }

    const [profile, course] = await Promise.all([
      prisma.learnerProfile.findUnique({ where: { id: learnerProfileId } }),
      prisma.course.findUnique({ where: { id: courseId } }),
    ]);

    if (!profile || !course) {
      throw new NotFoundError("Profile or course not found");
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
            score: lastAttempt.score ?? 0,
            totalMarks: lastAttempt.totalMarks,
            examTitle: lastAttempt.exam.title,
          }),
        ),
      },
    });

    return certificate;
  }

  /**
   * Returns the REGULAR course exam certificate for a learner (or null if not
   * generated yet).
   */
  async getExamCertificate(learnerProfileId: string, courseId: string) {
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
