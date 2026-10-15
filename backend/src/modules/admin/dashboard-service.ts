import { prisma } from "#/lib/prisma";
import { SEAT_MONTHLY_PRICE } from "#/shared/pricing";

const DAY_MS = 24 * 60 * 60 * 1000;
const TREND_WEEKS = 12;
// Exam submissions waiting longer than this need admin attention.
const GRADING_OVERDUE_DAYS = 3;

/** Monday 00:00 UTC of the week containing `date`. */
function startOfWeek(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d;
}

/** Count `dates` into weekly buckets starting at each of `weekStarts`. */
function bucketByWeek(dates: Date[], weekStarts: Date[]): number[] {
  const counts = weekStarts.map(() => 0);
  for (const date of dates) {
    for (let i = weekStarts.length - 1; i >= 0; i--) {
      if (date >= weekStarts[i]!) {
        counts[i]!++;
        break;
      }
    }
  }
  return counts;
}

export class AdminDashboardService {
  async getDashboard() {
    const now = new Date();
    const last30 = new Date(now.getTime() - 30 * DAY_MS);
    const prev30 = new Date(now.getTime() - 60 * DAY_MS);
    const gradingCutoff = new Date(now.getTime() - GRADING_OVERDUE_DAYS * DAY_MS);
    const weekStarts = Array.from({ length: TREND_WEEKS }, (_, i) => {
      const d = startOfWeek(now);
      d.setUTCDate(d.getUTCDate() - 7 * (TREND_WEEKS - 1 - i));
      return d;
    });
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);

    const [
      accountsTotal,
      accountsLast30,
      accountsPrev30,
      learnerProfiles,
      activeInstructors,
      publishedCourses,
      totalCourses,
      activeSubscriptions,
      pastDueSubscriptions,
      enrolmentsTotal,
      enrolmentsLast30,
      enrolmentsPrev30,
      certificatesTotal,
      certificatesLast30,
      pendingCourses,
      pendingWaivers,
      overdueGrading,
      trendSignups,
      trendEnrolments,
      recentAccounts,
      todaysSessions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: last30 } } }),
      prisma.user.count({ where: { createdAt: { gte: prev30, lt: last30 } } }),
      prisma.learnerProfile.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { role: { name: "Instructor" } } }),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.course.count(),
      prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        select: { seats: true },
      }),
      prisma.subscription.count({ where: { status: "PAST_DUE" } }),
      prisma.enrolment.count({ where: { waitlisted: false } }),
      prisma.enrolment.count({
        where: { waitlisted: false, enrolledAt: { gte: last30 } },
      }),
      prisma.enrolment.count({
        where: { waitlisted: false, enrolledAt: { gte: prev30, lt: last30 } },
      }),
      prisma.certificate.count({ where: { revokedAt: null } }),
      prisma.certificate.count({
        where: { revokedAt: null, issuedAt: { gte: last30 } },
      }),
      prisma.course.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.waiver.count({ where: { status: "PENDING" } }),
      prisma.examAttempt.count({
        where: {
          graded: false,
          submittedAt: { not: null, lt: gradingCutoff },
        },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: weekStarts[0] } },
        select: { createdAt: true },
      }),
      prisma.enrolment.findMany({
        where: { waitlisted: false, enrolledAt: { gte: weekStarts[0] } },
        select: { enrolledAt: true },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          role: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.session.findMany({
        where: {
          scheduledAt: { gte: todayStart, lt: tomorrowStart },
          batch: { status: { in: ["UPCOMING", "ACTIVE"] } },
        },
        select: {
          id: true,
          title: true,
          scheduledAt: true,
          durationMinutes: true,
          meetingLink: true,
          batch: {
            select: {
              name: true,
              course: {
                select: {
                  id: true,
                  title: true,
                  instructor: { select: { firstName: true, lastName: true } },
                },
              },
              _count: { select: { enrolments: { where: { waitlisted: false } } } },
            },
          },
        },
        orderBy: { scheduledAt: "asc" },
      }),
    ]);

    const [
      pendingInstructorApplications,
      openChatReports,
      pendingSubscriptionRequests,
      topCourses,
    ] = await Promise.all([
      this.countPendingInstructorApplications(),
      this.countOpenChatReports(),
      prisma.subscriptionRequest.count({ where: { status: "PENDING" } }),
      this.getTopCourses(last30),
    ]);

    const activeSeats = activeSubscriptions.reduce((sum, s) => sum + s.seats, 0);
    const weeklySignups = bucketByWeek(
      trendSignups.map((u) => u.createdAt),
      weekStarts,
    );
    const weeklyEnrolments = bucketByWeek(
      trendEnrolments.map((e) => e.enrolledAt),
      weekStarts,
    );

    return {
      kpis: {
        accounts: {
          total: accountsTotal,
          last30Days: accountsLast30,
          previous30Days: accountsPrev30,
        },
        learnerProfiles,
        activeInstructors,
        courses: { published: publishedCourses, total: totalCourses },
        subscriptions: {
          active: activeSubscriptions.length,
          activeSeats,
          estimatedMonthlyRevenue:
            Math.round(activeSeats * SEAT_MONTHLY_PRICE * 100) / 100,
        },
        enrolments: {
          total: enrolmentsTotal,
          last30Days: enrolmentsLast30,
          previous30Days: enrolmentsPrev30,
        },
        certificates: { total: certificatesTotal, last30Days: certificatesLast30 },
      },
      attention: {
        pendingInstructorApplications,
        pendingCourses,
        pendingWaivers,
        pendingSubscriptionRequests,
        openChatReports,
        pastDueSubscriptions,
        overdueGrading,
      },
      trends: weekStarts.map((weekStart, i) => ({
        weekStart: weekStart.toISOString().slice(0, 10),
        signups: weeklySignups[i]!,
        enrolments: weeklyEnrolments[i]!,
      })),
      topCourses,
      recentAccounts: recentAccounts.map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        role: u.role.name,
        createdAt: u.createdAt.toISOString(),
      })),
      todaysSessions: todaysSessions.map((s) => ({
        id: s.id,
        title: s.title,
        scheduledAt: s.scheduledAt.toISOString(),
        durationMinutes: s.durationMinutes,
        hasMeetingLink: !!s.meetingLink,
        batchName: s.batch.name,
        courseId: s.batch.course.id,
        courseTitle: s.batch.course.title,
        instructor:
          `${s.batch.course.instructor.firstName} ${s.batch.course.instructor.lastName}`.trim(),
        enrolled: s.batch._count.enrolments,
      })),
    };
  }

  /**
   * Applications are audit-log entries. One is still pending when the user
   * isn't an instructor yet and it wasn't rejected or suspended afterwards.
   */
  private async countPendingInstructorApplications(): Promise<number> {
    const events = await prisma.auditLog.findMany({
      where: {
        OR: [
          {
            resource: "instructor_application",
            action: { in: ["INSTRUCTOR_APPLICATION_SUBMITTED", "INSTRUCTOR_REJECTED"] },
          },
          {
            resource: "instructor",
            action: { in: ["INSTRUCTOR_SUSPENDED", "INSTRUCTOR_REINSTATED"] },
          },
        ],
      },
      select: { resourceId: true, action: true },
      orderBy: { createdAt: "desc" },
    });

    // Latest application event and latest status event per user.
    const latestApplication = new Map<string, string>();
    const latestStatus = new Map<string, string>();
    for (const event of events) {
      if (!event.resourceId) continue;
      const map = event.action.startsWith("INSTRUCTOR_APPLICATION") ||
        event.action === "INSTRUCTOR_REJECTED"
        ? latestApplication
        : latestStatus;
      if (!map.has(event.resourceId)) map.set(event.resourceId, event.action);
    }

    const candidateIds = [...latestApplication]
      .filter(
        ([id, action]) =>
          action === "INSTRUCTOR_APPLICATION_SUBMITTED" &&
          latestStatus.get(id) !== "INSTRUCTOR_SUSPENDED",
      )
      .map(([id]) => id);
    if (candidateIds.length === 0) return 0;

    return prisma.user.count({
      where: {
        id: { in: candidateIds },
        role: { name: { not: "Instructor" } },
      },
    });
  }

  /** Chat reports with no moderation action recorded after them. */
  private async countOpenChatReports(): Promise<number> {
    const events = await prisma.auditLog.findMany({
      where: { action: { in: ["CHAT_REPORT", "CHAT_MODERATION"] } },
      select: { resourceId: true, action: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const lastModeratedAt = new Map<string, Date>();
    for (const e of events) {
      if (e.action === "CHAT_MODERATION" && e.resourceId) {
        lastModeratedAt.set(e.resourceId, e.createdAt);
      }
    }
    return events.filter(
      (e) =>
        e.action === "CHAT_REPORT" &&
        e.resourceId &&
        !(
          lastModeratedAt.has(e.resourceId) &&
          lastModeratedAt.get(e.resourceId)! >= e.createdAt
        ),
    ).length;
  }

  /** Most-enrolled courses over the last 30 days. */
  private async getTopCourses(since: Date) {
    const grouped = await prisma.enrolment.groupBy({
      by: ["courseId"],
      where: { waitlisted: false, enrolledAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { courseId: "desc" } },
      take: 5,
    });
    if (grouped.length === 0) return [];

    const courses = await prisma.course.findMany({
      where: { id: { in: grouped.map((g) => g.courseId) } },
      select: {
        id: true,
        title: true,
        type: true,
        instructor: { select: { firstName: true, lastName: true } },
        ratings: { where: { hidden: false }, select: { rating: true } },
        _count: { select: { enrolments: { where: { waitlisted: false } } } },
      },
    });

    return grouped.flatMap((g) => {
      const course = courses.find((c) => c.id === g.courseId);
      if (!course) return [];
      return [
        {
          id: course.id,
          title: course.title,
          type: course.type,
          instructor:
            `${course.instructor.firstName} ${course.instructor.lastName}`.trim(),
          enrolmentsLast30Days: g._count._all,
          totalEnrolments: course._count.enrolments,
          averageRating:
            course.ratings.length > 0
              ? Math.round(
                  (course.ratings.reduce((sum, r) => sum + r.rating, 0) /
                    course.ratings.length) *
                    10,
                ) / 10
              : null,
        },
      ];
    });
  }
}

export const adminDashboardService = new AdminDashboardService();
