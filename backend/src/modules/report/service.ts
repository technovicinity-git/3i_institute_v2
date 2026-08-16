import { prisma } from "#/lib/prisma";

interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export class ReportService {
  // ──────────────────────────────────
  // Learner Activity Report
  // ──────────────────────────────────
  async getLearnerActivity(dateRange: DateRange = {}) {
    const where = {
      ...(dateRange.startDate || dateRange.endDate
        ? {
            enrolledAt: {
              ...(dateRange.startDate ? { gte: dateRange.startDate } : {}),
              ...(dateRange.endDate ? { lte: dateRange.endDate } : {}),
            },
          }
        : {}),
    };

    const [totalEnrolments, activeLearners, completedMaterials] =
      await Promise.all([
        prisma.enrolment.count({ where }),
        prisma.learnerProfile.count({
          where: {
            ...(dateRange.startDate || dateRange.endDate
              ? {
                  createdAt: {
                    ...(dateRange.startDate
                      ? { gte: dateRange.startDate }
                      : {}),
                    ...(dateRange.endDate ? { lte: dateRange.endDate } : {}),
                  },
                }
              : {}),
            deletedAt: null,
          },
        }),
        prisma.materialProgress.count({
          where: {
            completed: true,
            ...(dateRange.startDate || dateRange.endDate
              ? {
                  completedAt: {
                    ...(dateRange.startDate
                      ? { gte: dateRange.startDate }
                      : {}),
                    ...(dateRange.endDate ? { lte: dateRange.endDate } : {}),
                  },
                }
              : {}),
          },
        }),
      ]);

    return {
      totalEnrolments,
      activeLearners,
      completedMaterials,
    };
  }

  // ──────────────────────────────────
  // Course Performance Report
  // ──────────────────────────────────
  async getCoursePerformance() {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        _count: {
          select: {
            enrolments: true,
            ratings: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        enrolments: { _count: "desc" },
      },
    });

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      type: course.type,
      status: course.status,
      enrolmentCount: course._count.enrolments,
      ratingCount: course._count.ratings,
      averageRating:
        course.ratings.length > 0
          ? course.ratings.reduce((sum, r) => sum + r.rating, 0) /
            course.ratings.length
          : null,
    }));
  }

  // ──────────────────────────────────
  // Enrolment Report
  // ──────────────────────────────────
  async getEnrolmentReport(dateRange: DateRange = {}) {
    const where = {
      ...(dateRange.startDate || dateRange.endDate
        ? {
            enrolledAt: {
              ...(dateRange.startDate ? { gte: dateRange.startDate } : {}),
              ...(dateRange.endDate ? { lte: dateRange.endDate } : {}),
            },
          }
        : {}),
    };

    const [total, waitlisted, byCourse] = await Promise.all([
      prisma.enrolment.count({ where: { ...where, waitlisted: false } }),
      prisma.enrolment.count({ where: { ...where, waitlisted: true } }),
      prisma.enrolment.groupBy({
        by: ["courseId"],
        where: { ...where, waitlisted: false },
        _count: { courseId: true },
        orderBy: { _count: { courseId: "desc" } },
        take: 20,
      }),
    ]);

    return { total, waitlisted, byCourse };
  }

  // ──────────────────────────────────
  // Attendance Report
  // ──────────────────────────────────
  async getAttendanceReport(courseId?: string, batchId?: string) {
    const attendance = await prisma.attendance.findMany({
      where: {
        ...(batchId
          ? { session: { batchId } }
          : courseId
            ? {
                session: {
                  batch: { courseId },
                },
              }
            : {}),
      },
      include: {
        learnerProfile: {
          select: {
            id: true,
            displayName: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
            batch: {
              select: {
                id: true,
                name: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { markedAt: "desc" },
      take: 1000,
    });

    const summary = {
      total: attendance.length,
      present: attendance.filter((a) => a.status === "present").length,
      absent: attendance.filter((a) => a.status === "absent").length,
      late: attendance.filter((a) => a.status === "late").length,
      excused: attendance.filter((a) => a.status === "excused").length,
    };

    return { summary, records: attendance };
  }

  // ──────────────────────────────────
  // Exam Results Report
  // ──────────────────────────────────
  async getExamResults(courseId?: string) {
    const attempts = await prisma.examAttempt.findMany({
      where: {
        ...(courseId
          ? {
              exam: { courseId },
            }
          : {}),
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            type: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        learnerProfile: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const passed = attempts.filter((a) => a.passed === true).length;
    const failed = attempts.filter((a) => a.passed === false).length;
    const pendingGrading = attempts.filter((a) => a.graded === false).length;

    return {
      summary: {
        total: attempts.length,
        passed,
        failed,
        pendingGrading,
      },
      attempts,
    };
  }

  // ──────────────────────────────────
  // Revenue Report (Gross)
  // ──────────────────────────────────
  async getRevenueReport(dateRange: DateRange = {}) {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        ...(dateRange.startDate || dateRange.endDate
          ? {
              createdAt: {
                ...(dateRange.startDate ? { gte: dateRange.startDate } : {}),
                ...(dateRange.endDate ? { lte: dateRange.endDate } : {}),
              },
            }
          : {}),
      },
      select: {
        id: true,
        seats: true,
        status: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        createdAt: true,
        account: {
          select: {
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // GST-inclusive — FR-BILL-07
    const MONTHLY_PRICE = 9.99;

    const totalSeats = subscriptions.reduce((sum, s) => sum + s.seats, 0);
    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === "ACTIVE",
    ).length;

    return {
      summary: {
        totalSubscriptions: subscriptions.length,
        activeSubscriptions,
        totalSeats,
        estimatedMonthlyRevenue: subscriptions
          .filter((s) => s.status === "ACTIVE")
          .reduce((sum, s) => sum + s.seats * MONTHLY_PRICE, 0),
        gstIncluded: true,
      },
      subscriptions,
    };
  }

  // ──────────────────────────────────
  // Instructor Activity Report
  // ──────────────────────────────────
  async getInstructorActivity() {
    const instructors = await prisma.user.findMany({
      where: {
        role: { name: "Instructor" },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        _count: {
          select: {
            courses: true,
          },
        },
        courses: {
          select: {
            id: true,
            title: true,
            _count: {
              select: {
                enrolments: true,
                exams: true,
                batches: true,
              },
            },
          },
        },
      },
    });

    return instructors.map((instructor) => ({
      id: instructor.id,
      name: `${instructor.firstName} ${instructor.lastName}`,
      email: instructor.email,
      courseCount: instructor._count.courses,
      totalEnrolments: instructor.courses.reduce(
        (sum, c) => sum + c._count.enrolments,
        0,
      ),
      totalExams: instructor.courses.reduce(
        (sum, c) => sum + c._count.exams,
        0,
      ),
      totalBatches: instructor.courses.reduce(
        (sum, c) => sum + c._count.batches,
        0,
      ),
    }));
  }
}

export const reportService = new ReportService();
