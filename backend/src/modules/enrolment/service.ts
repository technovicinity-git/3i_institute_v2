import { prisma } from "#/lib/prisma";
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";
import { checkCourseAge } from "#/shared/course-eligibility";
import { seatService } from "#/modules/seat/service";
import type { EnrolInput } from "#/modules/enrolment/schema";
import { notificationEvents } from "#/modules/notification/events";

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

    // Verify course exists and is published. Only UPCOMING batches are loaded:
    // once a batch has started (ACTIVE) it no longer takes new enrolments.
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

    // FR-ENR-03/04/05: Age gating (minimum, maximum, adults-only)
    const ageCheck = checkCourseAge(
      profile.dateOfBirth,
      course,
      input.ageOverride,
    );
    if (!ageCheck.eligible) {
      throw new ForbiddenError(ageCheck.message);
    }

    // Only subscribed profiles can enrol. The subscription is per learner
    // profile (a seat), not per account — see SeatService.
    if (!(await seatService.isProfileSubscribed(profile.id))) {
      throw new AppError(
        403,
        "SUBSCRIPTION_REQUIRED",
        `${profile.displayName} needs an active subscription to enrol in courses`,
      );
    }

    // Check if already enrolled. One enrolment per profile per course, so a
    // learner can't hold places in two batches of the same course.
    const existing = await prisma.enrolment.findFirst({
      where: {
        learnerProfileId: input.learnerProfileId,
        courseId: input.courseId,
      },
    });

    if (existing) {
      throw new ConflictError("Already enrolled in this course");
    }

    // REGULAR courses are self-paced and have no batch. ONLINE_CLASS and
    // MIXED courses run live sessions, so the learner must pick a batch.
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

      // Check capacity. Count-then-create is not atomic, so two enrolments
      // at the same moment can both take the last place and overfill the
      // batch by one.
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
        // The account holder (parent) can confirm a learner outside the
        // course's age range; record who approved it.
        ageOverrideApplied: ageCheck.overrideApplied,
        ageOverrideApprovedBy: ageCheck.overrideApplied ? accountId : null,
      },
    });

    notificationEvents.enrolmentCreated(enrolment.id);

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

  // Moves the first waitlisted learner into the batch when a place frees up.
  // Promotes one learner per call, regardless of how many places opened.
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

    // Renumber the rest (1, 2, 3...) so positions shown to learners have no
    // gaps after the promotion.
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

    notificationEvents.waitlistPromoted(promoted.id);

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
  async getLearnerEnrolledCourses(accountId: string, learnerProfileId: string) {
    // Verify profile belongs to account
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: learnerProfileId,
        accountId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // Get all enrolments for this profile
    const enrolments = await prisma.enrolment.findMany({
      where: {
        learnerProfileId,
        waitlisted: false,
      },
      include: {
        course: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            materials: {
              orderBy: { order: "asc" },
              select: { id: true },
            },
            batches: {
              where: { status: { in: ["UPCOMING", "ACTIVE"] } },
              include: {
                sessions: {
                  where: { scheduledAt: { gte: new Date() } },
                  orderBy: { scheduledAt: "asc" },
                  take: 1,
                },
              },
              take: 1,
            },
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

    // Get progress for all materials
    const materialProgress = await prisma.materialProgress.findMany({
      where: {
        learnerProfileId,
        material: {
          courseId: { in: enrolments.map((e) => e.courseId) },
        },
      },
    });

    const courses = enrolments.map((enrolment) => {
      const course = enrolment.course;
      const courseMaterials = course.materials;
      const courseMaterialIds = courseMaterials.map((m) => m.id);

      // Filter progress to this course
      const courseProgress = materialProgress.filter((mp) =>
        courseMaterialIds.includes(mp.materialId),
      );

      const completedMaterials = courseProgress.filter((mp) => mp.completed);

      const progress =
        courseMaterials.length > 0
          ? Math.round(
              (completedMaterials.length / courseMaterials.length) * 100,
            )
          : 0;

      // "Continue" opens the first material not yet completed (in course
      // order). A finished course goes back to the first material.
      let continueLessonId: string | null = null;

      if (courseMaterials.length > 0) {
        const firstIncomplete = courseMaterials.find((m) => {
          const mp = courseProgress.find((p) => p.materialId === m.id);
          return !mp || !mp.completed;
        });

        if (firstIncomplete) {
          continueLessonId = firstIncomplete.id;
        } else {
          continueLessonId = courseMaterials[0]?.id ?? null;
        }
      }

      const activeBatch = course.batches[0] ?? null;
      const nextSession = activeBatch?.sessions[0] ?? null;

      // Prefer the directly assigned batch, fall back to the course's first active batch
      const enrolledBatch = enrolment.batch ?? activeBatch;

      return {
        id: enrolment.id,
        courseId: course.id,
        title: course.title,
        summary: course.summary,
        thumbnailUrl: course.thumbnailUrl,
        categoryId: course.categoryId,
        level: course.level,
        type: course.type,
        instructor: {
          id: course.instructor.id,
          name: `${course.instructor.firstName} ${course.instructor.lastName}`,
        },
        progress,
        totalMaterials: courseMaterials.length,
        completedMaterials: completedMaterials.length,
        firstLessonId: courseMaterials[0]?.id ?? null,
        continueLessonId,
        // Batch info
        batchId: enrolledBatch?.id ?? null,
        batchName: enrolledBatch?.name ?? null,
        // Next session info
        nextSession: nextSession
          ? {
              title: nextSession.title,
              scheduledAt: nextSession.scheduledAt,
            }
          : null,
        enrolledAt: enrolment.enrolledAt,
        isCompleted: progress === 100,
      };
    });

    return courses;
  }
}

export const enrolmentService = new EnrolmentService();
