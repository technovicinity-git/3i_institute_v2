import { prisma } from "#/lib/prisma";
import { NotFoundError } from "#/shared/errors";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS_OF_ACTIVITY = 8;

/**
 * Calendar-day key in the learner's local time. `tzOffsetMinutes` follows
 * JavaScript's `Date.getTimezoneOffset()` convention (UTC − local, so UTC+6
 * is -360).
 */
function localDayKey(date: Date, tzOffsetMinutes: number): string {
  return new Date(date.getTime() - tzOffsetMinutes * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function shiftDayKey(key: string, days: number): string {
  return new Date(new Date(`${key}T00:00:00Z`).getTime() + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/** Current streak (ending today or yesterday) and longest streak, in days. */
function computeStreaks(dayKeys: Set<string>, todayKey: string) {
  let current = 0;
  let cursor = dayKeys.has(todayKey) ? todayKey : shiftDayKey(todayKey, -1);
  while (dayKeys.has(cursor)) {
    current++;
    cursor = shiftDayKey(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  let previous: string | null = null;
  for (const key of [...dayKeys].sort()) {
    run = previous && shiftDayKey(previous, 1) === key ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = key;
  }

  return { current, longest: Math.max(longest, current) };
}

function ageFrom(dateOfBirth: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const beforeBirthday =
    now.getMonth() < dateOfBirth.getMonth() ||
    (now.getMonth() === dateOfBirth.getMonth() &&
      now.getDate() < dateOfBirth.getDate());
  if (beforeBirthday) age--;
  return age;
}

function daysUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / DAY_MS));
}

export class DashboardService {
  async getDashboardData(
    accountId: string,
    learnerProfileId: string,
    tzOffsetMinutes = 0,
  ) {
    const profile = await prisma.learnerProfile.findFirst({
      where: { id: learnerProfileId, accountId, deletedAt: null },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    const now = new Date();
    const yearAgo = new Date(now.getTime() - 365 * DAY_MS);

    const [
      enrolments,
      progressRows,
      certificateCount,
      examAttempts,
      assignmentSubmissions,
      noteLogs,
    ] = await Promise.all([
      prisma.enrolment.findMany({
        where: {
          learnerProfileId,
          waitlisted: false,
          course: { status: "PUBLISHED" },
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              type: true,
              categoryId: true,
              materials: {
                select: { id: true, title: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      }),
      prisma.materialProgress.findMany({
        where: { learnerProfileId },
        select: {
          materialId: true,
          completed: true,
          completedAt: true,
          updatedAt: true,
          material: { select: { courseId: true } },
        },
      }),
      prisma.certificate.count({
        where: { learnerProfileId, revokedAt: null },
      }),
      prisma.examAttempt.findMany({
        where: { learnerProfileId, submittedAt: { not: null } },
        select: {
          id: true,
          examId: true,
          score: true,
          totalMarks: true,
          passed: true,
          graded: true,
          submittedAt: true,
          exam: {
            select: { title: true, courseId: true, course: { select: { title: true } } },
          },
        },
        orderBy: { submittedAt: "desc" },
      }),
      prisma.assignmentSubmission.findMany({
        where: { learnerProfileId },
        select: {
          id: true,
          assignmentId: true,
          marksAwarded: true,
          graded: true,
          submittedAt: true,
          assignment: {
            select: {
              title: true,
              totalMarks: true,
              courseId: true,
              course: { select: { title: true } },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      }),
      // Lesson notes are stored in the audit log, keyed by learner profile.
      prisma.auditLog.findMany({
        where: { userId: accountId, action: "LESSON_NOTE" },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const enrolledCourseIds = enrolments.map((e) => e.courseId);
    const enrolledBatchIds = enrolments
      .map((e) => e.batchId)
      .filter((id): id is string => !!id);

    // ─── Per-course progress ───
    const progressByMaterial = new Map(
      progressRows.map((p) => [p.materialId, p]),
    );
    const lastActivityByCourse = new Map<string, Date>();
    for (const p of progressRows) {
      const courseId = p.material.courseId;
      const last = lastActivityByCourse.get(courseId);
      if (!last || p.updatedAt > last) {
        lastActivityByCourse.set(courseId, p.updatedAt);
      }
    }

    const courses = enrolments.map((enrolment) => {
      const materials = enrolment.course.materials;
      const completedLessons = materials.filter(
        (m) => progressByMaterial.get(m.id)?.completed,
      ).length;
      const nextLesson =
        materials.find((m) => !progressByMaterial.get(m.id)?.completed) ??
        null;
      const progress =
        materials.length > 0
          ? Math.round((completedLessons / materials.length) * 100)
          : 0;
      return {
        id: enrolment.course.id,
        title: enrolment.course.title,
        thumbnailUrl: enrolment.course.thumbnailUrl,
        type: enrolment.course.type,
        categoryId: enrolment.course.categoryId,
        batchId: enrolment.batchId,
        progress,
        completedLessons,
        totalLessons: materials.length,
        nextLessonId: nextLesson?.id ?? null,
        nextLessonTitle: nextLesson?.title ?? null,
        isCompleted: materials.length > 0 && completedLessons === materials.length,
        lastActivityAt: (
          lastActivityByCourse.get(enrolment.course.id) ?? enrolment.enrolledAt
        ).toISOString(),
      };
    });

    // Most recently studied first; courses not yet finished.
    const continueLearning = courses
      .filter((c) => !c.isCompleted)
      .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))
      .slice(0, 4)
      .map(({ categoryId: _categoryId, isCompleted: _isCompleted, ...c }) => c);

    // ─── Activity, streaks, weekly chart ───
    const todayKey = localDayKey(now, tzOffsetMinutes);
    const activityDays = new Set<string>();
    const addActivity = (date: Date | null | undefined) => {
      if (date && date >= yearAgo) {
        activityDays.add(localDayKey(date, tzOffsetMinutes));
      }
    };
    progressRows.forEach((p) => addActivity(p.updatedAt));
    examAttempts.forEach((a) => addActivity(a.submittedAt));
    assignmentSubmissions.forEach((s) => addActivity(s.submittedAt));
    const streak = computeStreaks(activityDays, todayKey);

    // Weeks start on Monday in the learner's local time.
    const todayDate = new Date(`${todayKey}T00:00:00Z`);
    const mondayKey = shiftDayKey(todayKey, -((todayDate.getUTCDay() + 6) % 7));
    const weekStarts = Array.from({ length: WEEKS_OF_ACTIVITY }, (_, i) =>
      shiftDayKey(mondayKey, -7 * (WEEKS_OF_ACTIVITY - 1 - i)),
    );
    const weeklyActivity = weekStarts.map((weekStart) => ({
      weekStart,
      lessonsCompleted: 0,
    }));
    for (const p of progressRows) {
      if (!p.completed || !p.completedAt) continue;
      const key = localDayKey(p.completedAt, tzOffsetMinutes);
      for (let i = weekStarts.length - 1; i >= 0; i--) {
        if (key >= weekStarts[i]!) {
          if (key < shiftDayKey(weekStarts[i]!, 7)) {
            weeklyActivity[i]!.lessonsCompleted++;
          }
          break;
        }
      }
    }

    // ─── Upcoming live classes ───
    const upcomingSessions =
      enrolledBatchIds.length === 0
        ? []
        : await prisma.session.findMany({
            where: {
              batchId: { in: enrolledBatchIds },
              // Include sessions that are still running.
              scheduledAt: { gte: new Date(now.getTime() - 4 * 60 * 60 * 1000) },
              batch: { status: { in: ["UPCOMING", "ACTIVE"] } },
            },
            include: {
              batch: {
                select: {
                  course: {
                    select: {
                      title: true,
                      instructor: { select: { firstName: true, lastName: true } },
                    },
                  },
                },
              },
            },
            orderBy: { scheduledAt: "asc" },
            take: 10,
          });

    const liveClasses = upcomingSessions
      .filter(
        (s) =>
          s.scheduledAt.getTime() + s.durationMinutes * 60 * 1000 >=
          now.getTime(),
      )
      .slice(0, 3)
      .map((session) => ({
        id: session.id,
        batchId: session.batchId,
        title: session.title,
        courseTitle: session.batch.course.title,
        instructor:
          `${session.batch.course.instructor.firstName} ${session.batch.course.instructor.lastName}`.trim(),
        scheduledAt: session.scheduledAt.toISOString(),
        durationMinutes: session.durationMinutes,
        meetingLink: session.meetingLink,
      }));

    // ─── Deadlines: open exams not yet passed + unsubmitted assignments ───
    const [openExams, openAssignments] =
      enrolledCourseIds.length === 0
        ? [[], []]
        : await Promise.all([
            prisma.exam.findMany({
              where: {
                courseId: { in: enrolledCourseIds },
                closeDate: { gte: now },
              },
              select: {
                id: true,
                title: true,
                closeDate: true,
                maxAttempts: true,
                courseId: true,
                course: { select: { title: true } },
              },
              orderBy: { closeDate: "asc" },
            }),
            prisma.assignment.findMany({
              where: {
                courseId: { in: enrolledCourseIds },
                status: "PUBLISHED",
                dueDate: { gte: now },
                OR: [
                  { batchId: null },
                  { batchId: { in: enrolledBatchIds } },
                ],
                submissions: { none: { learnerProfileId } },
              },
              select: {
                id: true,
                title: true,
                dueDate: true,
                courseId: true,
                course: { select: { title: true } },
              },
              orderBy: { dueDate: "asc" },
            }),
          ]);

    const deadlines = [
      ...openExams
        .filter((exam) => {
          const attempts = examAttempts.filter((a) => a.examId === exam.id);
          return (
            !attempts.some((a) => a.passed) &&
            attempts.length < exam.maxAttempts
          );
        })
        .map((exam) => ({
          id: exam.id,
          kind: "EXAM" as const,
          title: exam.title,
          courseId: exam.courseId,
          courseTitle: exam.course.title,
          dueDate: exam.closeDate!.toISOString(),
          daysRemaining: daysUntil(exam.closeDate!),
        })),
      ...openAssignments.map((assignment) => ({
        id: assignment.id,
        kind: "ASSIGNMENT" as const,
        title: assignment.title,
        courseId: assignment.courseId,
        courseTitle: assignment.course.title,
        dueDate: assignment.dueDate!.toISOString(),
        daysRemaining: daysUntil(assignment.dueDate!),
      })),
    ]
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);

    // ─── Recent results: exams and assignments, newest first ───
    const recentResults = [
      ...examAttempts.slice(0, 5).map((a) => ({
        id: a.id,
        kind: "EXAM" as const,
        title: a.exam.title,
        courseId: a.exam.courseId,
        courseTitle: a.exam.course.title,
        examId: a.examId,
        status: !a.graded
          ? ("AWAITING_GRADE" as const)
          : a.passed
            ? ("PASSED" as const)
            : ("FAILED" as const),
        score: a.graded ? a.score : null,
        totalMarks: a.totalMarks,
        submittedAt: a.submittedAt!.toISOString(),
      })),
      ...assignmentSubmissions.slice(0, 5).map((s) => ({
        id: s.id,
        kind: "ASSIGNMENT" as const,
        title: s.assignment.title,
        courseId: s.assignment.courseId,
        courseTitle: s.assignment.course.title,
        examId: null,
        status: s.graded ? ("GRADED" as const) : ("AWAITING_GRADE" as const),
        score: s.graded ? s.marksAwarded : null,
        totalMarks: s.assignment.totalMarks,
        submittedAt: s.submittedAt.toISOString(),
      })),
    ]
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      .slice(0, 4);

    // ─── Recent notes ───
    const learnerNotes = noteLogs
      .map((log) => ({
        log,
        details: (log.details ?? {}) as {
          learnerProfileId?: string;
          content?: string;
        },
      }))
      .filter(
        ({ log, details }) =>
          details.learnerProfileId === learnerProfileId &&
          log.resourceId &&
          details.content?.trim(),
      )
      .slice(0, 3);
    const noteMaterials = learnerNotes.length
      ? await prisma.material.findMany({
          where: { id: { in: learnerNotes.map(({ log }) => log.resourceId!) } },
          select: {
            id: true,
            title: true,
            courseId: true,
            course: { select: { title: true } },
          },
        })
      : [];
    const notes = learnerNotes.flatMap(({ log, details }) => {
      const material = noteMaterials.find((m) => m.id === log.resourceId);
      if (!material) return [];
      return [
        {
          id: log.id,
          lessonId: material.id,
          lessonTitle: material.title,
          courseId: material.courseId,
          courseTitle: material.course.title,
          text: details.content!.trim(),
          createdAt: log.createdAt.toISOString(),
        },
      ];
    });

    // ─── Recommended: age-appropriate, same categories first, then popular ───
    const age = ageFrom(profile.dateOfBirth);
    const enrolledCategoryIds = [
      ...new Set(
        courses.map((c) => c.categoryId).filter((id): id is string => !!id),
      ),
    ];
    const candidates = await prisma.course.findMany({
      where: {
        status: "PUBLISHED",
        id: { notIn: enrolledCourseIds },
        minimumAge: { lte: age },
        OR: [{ maximumAge: null }, { maximumAge: { gte: age } }],
      },
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        level: true,
        type: true,
        categoryId: true,
        instructor: { select: { firstName: true, lastName: true } },
        ratings: { where: { hidden: false }, select: { rating: true } },
        _count: { select: { enrolments: true } },
      },
      orderBy: { enrolments: { _count: "desc" } },
      take: 12,
    });
    const recommended = candidates
      .map((course, index) => ({
        course,
        // Popularity order, nudged up when it matches an enrolled category.
        rank:
          index - (enrolledCategoryIds.includes(course.categoryId ?? "") ? 100 : 0),
      }))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 3)
      .map(({ course }) => ({
        id: course.id,
        title: course.title,
        thumbnailUrl: course.thumbnailUrl,
        instructor:
          `${course.instructor.firstName} ${course.instructor.lastName}`.trim(),
        level: course.level,
        type: course.type,
        rating:
          course.ratings.length > 0
            ? Math.round(
                (course.ratings.reduce((sum, r) => sum + r.rating, 0) /
                  course.ratings.length) *
                  10,
              ) / 10
            : null,
        ratingCount: course.ratings.length,
      }));

    const weekStartKey = weekStarts[weekStarts.length - 1]!;
    return {
      learner: {
        displayName: profile.displayName,
      },
      stats: {
        coursesInProgress: courses.filter((c) => !c.isCompleted).length,
        coursesCompleted: courses.filter((c) => c.isCompleted).length,
        lessonsCompleted: progressRows.filter((p) => p.completed).length,
        lessonsThisWeek: progressRows.filter(
          (p) =>
            p.completed &&
            p.completedAt &&
            localDayKey(p.completedAt, tzOffsetMinutes) >= weekStartKey,
        ).length,
        certificatesEarned: certificateCount,
        currentStreak: streak.current,
        longestStreak: streak.longest,
        studiedToday: activityDays.has(todayKey),
      },
      continueLearning,
      liveClasses,
      deadlines,
      recentResults,
      notes,
      weeklyActivity,
      recommended,
    };
  }
}

export const dashboardService = new DashboardService();
