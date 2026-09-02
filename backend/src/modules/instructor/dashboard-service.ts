import { prisma } from "#/lib/prisma";

export class InstructorDashboardService {
  async getDashboard(instructorId: string) {
    // Get instructor's courses
    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: {
          select: {
            enrolments: { where: { waitlisted: false } },
          },
        },
        ratings: {
          where: { hidden: false },
          select: { rating: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const courseIds = courses.map((c) => c.id);

    // Get total students (unique learner profiles)
    const enrolments = await prisma.enrolment.findMany({
      where: {
        courseId: { in: courseIds },
        waitlisted: false,
      },
      select: {
        learnerProfileId: true,
      },
    });

    const uniqueStudentIds = new Set(enrolments.map((e) => e.learnerProfileId));

    // Get certificates
    const certificates = await prisma.certificate.count({
      where: {
        courseId: { in: courseIds },
        revokedAt: null,
      },
    });

    // Get upcoming sessions
    const upcomingSessions = await prisma.session.findMany({
      where: {
        scheduledAt: { gte: new Date() },
        batch: {
          courseId: { in: courseIds },
          status: { in: ["UPCOMING", "ACTIVE"] },
        },
      },
      include: {
        batch: {
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    });

    // Get pending grading (exam attempts)
    const pendingGrading = await prisma.examAttempt.count({
      where: {
        graded: false,
        submittedAt: { not: null },
        exam: {
          courseId: { in: courseIds },
        },
      },
    });

    // Recent courses
    const recentCourses = courses.slice(0, 5).map((course) => {
      const avgRating =
        course.ratings.length > 0
          ? Math.round(
              (course.ratings.reduce((sum, r) => sum + r.rating, 0) /
                course.ratings.length) *
                10,
            ) / 10
          : null;

      return {
        id: course.id,
        title: course.title,
        thumbnailUrl: course.thumbnailUrl,
        enrolmentCount: course._count.enrolments,
        averageRating: avgRating,
      };
    });

    // Recent enrolments
    const recentEnrolments = await prisma.enrolment.findMany({
      where: {
        courseId: { in: courseIds },
        waitlisted: false,
      },
      include: {
        learnerProfile: {
          select: { displayName: true },
        },
        course: {
          select: { title: true },
        },
      },
      orderBy: { enrolledAt: "desc" },
      take: 5,
    });

    return {
      stats: {
        totalCourses: courses.length,
        totalStudents: uniqueStudentIds.size,
        totalEnrolments: enrolments.length,
        totalCertificates: certificates,
        upcomingSessions: upcomingSessions.length,
        pendingGrading,
      },
      recentCourses,
      upcomingClasses: upcomingSessions.map((session) => ({
        id: session.batchId,
        sessionId: session.id,
        title: session.title,
        batchName: session.batch.name,
        scheduledAt: session.scheduledAt,
        durationMinutes: session.durationMinutes,
        meetingLink: session.meetingLink,
      })),
      recentEnrolments: recentEnrolments.map((enrolment) => ({
        id: enrolment.id,
        learnerName: enrolment.learnerProfile?.displayName ?? "Unknown",
        courseTitle: enrolment.course.title,
        enrolledAt: enrolment.enrolledAt,
      })),
    };
  }
}

export const instructorDashboardService = new InstructorDashboardService();
