import { prisma } from "#/lib/prisma";
import { NotFoundError } from "#/shared/errors";

function formatMonth(date: Date): string {
  return date.toLocaleString("en-US", { month: "short" });
}

function formatDay(date: Date): string {
  return String(date.getDate()).padStart(2, "0");
}

function formatTime(date: Date): string {
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface NoteItem {
  id: string;
  subject: string;
  timeAgo: string;
  text: string;
}

export class DashboardService {
  async getDashboardData(accountId: string, learnerProfileId: string) {
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

    // ─── Stats ───
    const [enrolments, materialProgress, certificates] = await Promise.all([
      prisma.enrolment.findMany({
        where: {
          learnerProfileId,
          waitlisted: false,
        },
        include: {
          course: {
            include: {
              materials: {
                include: {
                  progress: {
                    where: {
                      learnerProfileId,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.materialProgress.findMany({
        where: {
          learnerProfileId,
          completed: true,
          completedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.certificate.findMany({
        where: {
          learnerProfileId,
          revokedAt: null,
        },
      }),
    ]);

    const hoursLearned =
      materialProgress.reduce((sum, p) => sum + (p.watchedSeconds ?? 0), 0) /
      3600;

    // ─── Continue Learning ───
    const continueLearning = enrolments
      .filter((e) => e.course.status === "PUBLISHED")
      .slice(0, 3)
      .map((enrolment) => {
        const courseMaterials = enrolment.course.materials ?? [];
        const completedCount = courseMaterials.filter((m) =>
          m.progress.some(
            (p) => p.learnerProfileId === learnerProfileId && p.completed,
          ),
        ).length;

        const progress =
          courseMaterials.length > 0
            ? Math.round((completedCount / courseMaterials.length) * 100)
            : 0;

        const moduleInfo =
          courseMaterials.length > 0
            ? `Module ${courseMaterials.length}`
            : "No modules yet";

        return {
          id: enrolment.course.id,
          title: enrolment.course.title,
          thumbnailUrl: enrolment.course.thumbnailUrl,
          moduleInfo,
          progress,
        };
      });

    // ─── Live Classes ───
    const upcomingSessions = await prisma.session.findMany({
      where: {
        scheduledAt: { gte: new Date() },
        batch: {
          enrolments: {
            some: {
              learnerProfileId,
              waitlisted: false,
            },
          },
          status: { in: ["UPCOMING", "ACTIVE"] },
        },
      },
      include: {
        batch: {
          include: {
            course: {
              include: {
                instructor: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
      take: 3,
    });

    const liveClasses = upcomingSessions.map((session) => ({
      id: session.id,
      sessionId: session.id,
      date: formatDay(session.scheduledAt),
      month: formatMonth(session.scheduledAt),
      title: session.title,
      instructor: `${session.batch.course.instructor.firstName} ${session.batch.course.instructor.lastName}`,
      time: formatTime(session.scheduledAt),
      meetingLink: session.meetingLink ?? "",
    }));

    // ─── Deadlines ───
    const upcomingExams = await prisma.exam.findMany({
      where: {
        closeDate: { gte: new Date() },
        course: {
          enrolments: {
            some: {
              learnerProfileId,
              waitlisted: false,
            },
          },
        },
      },
      include: {
        course: true,
      },
      orderBy: { closeDate: "asc" },
      take: 2,
    });

    const deadlines = upcomingExams.map((exam) => {
      const daysRemaining = Math.ceil(
        (exam.closeDate!.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
      );

      return {
        id: exam.id,
        title: exam.title,
        dueDate: exam.closeDate!.toISOString(),
        urgent: daysRemaining <= 1,
        daysRemaining,
      };
    });

    // ─── Notes ───
    const notes: NoteItem[] = [];

    // ─── Recommended ───
    const recommendedCourses = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        enrolments: {
          none: { learnerProfileId },
        },
      },
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        ratings: {
          select: { rating: true },
        },
      },
      orderBy: {
        enrolments: { _count: "desc" },
      },
      take: 3,
    });

    const recommended = recommendedCourses.map((course) => {
      const avgRating =
        course.ratings.length > 0
          ? Math.round(
              (course.ratings.reduce((sum, r) => sum + r.rating, 0) /
                course.ratings.length) *
                10,
            ) / 10
          : 0;

      return {
        id: course.id,
        title: course.title,
        thumbnailUrl: course.thumbnailUrl,
        instructor: `${course.instructor.firstName} ${course.instructor.lastName}`,
        level: course.level,
        rating: avgRating,
      };
    });

    // ─── Weekly Progress ───
    const weeklyProgress = [
      { week: 1, hours: 6 },
      { week: 2, hours: 8 },
      { week: 3, hours: 10 },
      { week: 4, hours: 14 },
      { week: 5, hours: 11 },
      { week: 6, hours: 15 },
      { week: 7, hours: 12 },
      { week: 8, hours: 13 },
    ];

    return {
      stats: {
        coursesInProgress: enrolments.filter(
          (e) => e.course.status === "PUBLISHED",
        ).length,
        hoursLearned: Math.round(hoursLearned * 10) / 10,
        certificatesEarned: certificates.length,
        currentStreak: 9,
        coursesInProgressDelta: 1,
        hoursLearnedDelta: 94,
        certificatesPending: 1,
        streakRecord: 9,
      },
      continueLearning,
      liveClasses,
      deadlines,
      notes,
      recommended,
      weeklyProgress,
    };
  }
}

export const dashboardService = new DashboardService();
