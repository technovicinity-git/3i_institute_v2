import { prisma } from "#/lib/prisma";
import { NotFoundError, ValidationError } from "#/shared/errors";
import type { UpdateProgressInput } from "#/modules/progress/schema";

export class ProgressService {
  async update(accountId: string, input: UpdateProgressInput) {
    // Verify learner profile belongs to account
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

    // Verify material exists
    const material = await prisma.material.findUnique({
      where: { id: input.materialId },
    });

    if (!material) {
      throw new NotFoundError("Material not found");
    }

    // Check if learner is enrolled in the course
    const enrolment = await prisma.enrolment.findFirst({
      where: {
        learnerProfileId: input.learnerProfileId,
        courseId: material.courseId,
        waitlisted: false,
      },
    });

    if (!enrolment) {
      throw new ValidationError("Learner is not enrolled in this course");
    }

    // FR-CERT-03: Video completes when ≥90% watched
    let completed = input.completed ?? false;

    if (input.watchedSeconds !== undefined && material.duration) {
      const watchedPercentage =
        (input.watchedSeconds / material.duration) * 100;
      completed = watchedPercentage >= 90;
    }

    // Upsert progress
    const progress = await prisma.materialProgress.upsert({
      where: {
        materialId_learnerProfileId: {
          materialId: input.materialId,
          learnerProfileId: input.learnerProfileId,
        },
      },
      update: {
        ...(input.watchedSeconds !== undefined && {
          watchedSeconds: input.watchedSeconds,
        }),
        ...(input.lastPosition !== undefined && {
          lastPosition: input.lastPosition,
        }),
        completed,
        ...(completed ? { completedAt: new Date() } : {}),
      },
      create: {
        materialId: input.materialId,
        learnerProfileId: input.learnerProfileId,
        watchedSeconds: input.watchedSeconds ?? 0,
        lastPosition: input.lastPosition ?? 0,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return progress;
  }

  async getProgress(
    accountId: string,
    learnerProfileId: string,
    courseId?: string,
  ) {
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

    const where = {
      learnerProfileId,
      ...(courseId
        ? {
            material: { courseId },
          }
        : {}),
    };

    const progress = await prisma.materialProgress.findMany({
      where,
      include: {
        material: {
          select: {
            id: true,
            title: true,
            type: true,
            duration: true,
            order: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        material: { order: "asc" },
      },
    });

    // Calculate course completion percentage if courseId provided
    let courseCompletion: number | null = null;
    let attendanceEligible = false;

    if (courseId) {
      const totalMaterials = await prisma.material.count({
        where: { courseId },
      });

      const completedCount = progress.filter((p) => p.completed).length;

      courseCompletion =
        totalMaterials > 0
          ? Math.round((completedCount / totalMaterials) * 100)
          : 0;

      // FR-CERT-02: Attendance certificate requires ≥70% completion
      attendanceEligible = courseCompletion >= 70;
    }

    return {
      progress,
      courseCompletion,
      attendanceEligible,
    };
  }

  async getCourseCompletionPercentage(
    learnerProfileId: string,
    courseId: string,
  ): Promise<number> {
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

    if (totalMaterials === 0) return 0;
    return Math.round((completedMaterials / totalMaterials) * 100);
  }
}

export const progressService = new ProgressService();
