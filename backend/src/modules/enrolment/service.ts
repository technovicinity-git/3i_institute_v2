import { prisma } from "#/lib/prisma";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";
import type { EnrolInput } from "#/modules/enrolment/schema";

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

export class EnrolmentService {
  async enrol(accountId: string, input: EnrolInput) {
    // Verify learner profile belongs to the account
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: input.learnerProfileId,
        accountId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // Verify course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
      include: {
        batches: {
          where: { status: "UPCOMING" },
        },
      },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.status !== "PUBLISHED") {
      throw new ValidationError("Course is not available for enrolment");
    }

    // FR-ENR-03: Age gating
    const learnerAge = calculateAge(profile.dateOfBirth);

    if (learnerAge < course.minimumAge) {
      // FR-ENR-04: Guardian can override upward by up to 2 years
      if (input.ageOverride && learnerAge >= course.minimumAge - 2) {
        // Override allowed
      } else {
        throw new ForbiddenError(
          `Learner does not meet the minimum age requirement of ${course.minimumAge}`,
        );
      }
    }

    // FR-ENR-05: No override into 18+ courses
    if (course.minimumAge >= 18 && learnerAge < 18) {
      throw new ForbiddenError("This course is restricted to adults");
    }

    // Check if already enrolled
    const existing = await prisma.enrolment.findFirst({
      where: {
        learnerProfileId: input.learnerProfileId,
        courseId: input.courseId,
      },
    });

    if (existing) {
      throw new ConflictError("Already enrolled in this course");
    }

    // For batch courses, validate batch
    let batchId: string | null = null;
    let waitlisted = false;
    let waitlistPosition: number | null = null;

    if (course.type !== "REGULAR") {
      if (!input.batchId) {
        throw new ValidationError("Batch ID is required for this course type");
      }

      const batch = course.batches.find((b) => b.id === input.batchId);

      if (!batch) {
        throw new NotFoundError("Batch not found or no longer available");
      }

      // Check capacity
      const enrolmentCount = await prisma.enrolment.count({
        where: {
          batchId: batch.id,
          waitlisted: false,
        },
      });

      if (enrolmentCount >= batch.capacity) {
        // Join waitlist (FR-ENR-06)
        waitlisted = true;
        const waitlistCount = await prisma.enrolment.count({
          where: {
            batchId: batch.id,
            waitlisted: true,
          },
        });
        waitlistPosition = waitlistCount + 1;
      }

      batchId = batch.id;
    }

    const enrolment = await prisma.enrolment.create({
      data: {
        learnerProfileId: input.learnerProfileId,
        courseId: input.courseId,
        batchId,
        waitlisted,
        waitlistPosition,
        ageOverrideApplied: input.ageOverride,
        ageOverrideApprovedBy: input.ageOverride ? accountId : null,
      },
    });

    return enrolment;
  }

  async getLearnerEnrolments(accountId: string, learnerProfileId?: string) {
    const where = {
      learnerProfile: {
        accountId,
        deletedAt: null,
      },
      ...(learnerProfileId ? { learnerProfileId } : {}),
    };

    const enrolments = await prisma.enrolment.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            level: true,
            language: true,
            minimumAge: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return enrolments;
  }

  async promoteFromWaitlist(batchId: string) {
    // Find first waitlisted enrolment for this batch
    const waitlisted = await prisma.enrolment.findFirst({
      where: {
        batchId,
        waitlisted: true,
      },
      orderBy: { waitlistPosition: "asc" },
    });

    if (!waitlisted) {
      return null;
    }

    // Promote to active
    const promoted = await prisma.enrolment.update({
      where: { id: waitlisted.id },
      data: {
        waitlisted: false,
        waitlistPosition: null,
      },
    });

    // Recalculate remaining waitlist positions
    const remaining = await prisma.enrolment.findMany({
      where: {
        batchId,
        waitlisted: true,
      },
      orderBy: { waitlistPosition: "asc" },
    });

    for (let i = 0; i < remaining.length; i++) {
      await prisma.enrolment.update({
        where: { id: remaining[i]!.id },
        data: { waitlistPosition: i + 1 },
      });
    }

    return promoted;
  }

  async getWaitlist(batchId: string) {
    const waitlist = await prisma.enrolment.findMany({
      where: {
        batchId,
        waitlisted: true,
      },
      orderBy: { waitlistPosition: "asc" },
      include: {
        learnerProfile: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return waitlist;
  }
}

export const enrolmentService = new EnrolmentService();
