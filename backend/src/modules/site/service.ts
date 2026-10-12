import { prisma } from "#/lib/prisma";

/** Public data for the marketing site. Never returns emails or learner names. */
export class SiteService {
  /** Headline numbers for the home page hero. */
  async getStats() {
    const [learners, courses, instructors] = await Promise.all([
      prisma.learnerProfile.count({
        where: { deletedAt: null, enrolments: { some: { waitlisted: false } } },
      }),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count({
        where: {
          isActive: true,
          role: { name: "Instructor" },
          courses: { some: { status: "PUBLISHED" } },
        },
      }),
    ]);
    return { learners, courses, instructors };
  }

  /** Active instructors with at least one published course, busiest first. */
  async getFaculty(limit = 4) {
    const instructors = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { name: "Instructor" },
        courses: { some: { status: "PUBLISHED" } },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        bio: true,
        courses: {
          where: { status: "PUBLISHED" },
          select: {
            category: { select: { name: true } },
            _count: { select: { enrolments: { where: { waitlisted: false } } } },
          },
        },
      },
    });

    return instructors
      .map((instructor) => {
        const categoryCounts = new Map<string, number>();
        for (const course of instructor.courses) {
          const name = course.category?.name;
          if (name) categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
        }
        const mainCategory =
          [...categoryCounts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
        return {
          id: instructor.id,
          name: `${instructor.firstName} ${instructor.lastName}`.trim(),
          avatarUrl: instructor.avatarUrl,
          bio: instructor.bio,
          mainCategory,
          courseCount: instructor.courses.length,
          studentCount: instructor.courses.reduce(
            (sum, c) => sum + c._count.enrolments,
            0,
          ),
        };
      })
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, limit);
  }

  /**
   * Real 4–5 star written reviews. Learners can be minors, so reviews are
   * attributed to the course only, never to the learner.
   */
  async getTestimonials(limit = 3) {
    const reviews = await prisma.courseRating.findMany({
      where: {
        hidden: false,
        rating: { gte: 4 },
        review: { not: null },
        course: { status: "PUBLISHED" },
      },
      select: {
        id: true,
        rating: true,
        review: true,
        createdAt: true,
        course: { select: { id: true, title: true } },
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: 30,
    });

    // Prefer substantial reviews, at most one per course.
    const seenCourses = new Set<string>();
    return reviews
      .filter((r) => (r.review ?? "").trim().length >= 30)
      .filter((r) => {
        if (seenCourses.has(r.course.id)) return false;
        seenCourses.add(r.course.id);
        return true;
      })
      .slice(0, limit)
      .map((r) => ({
        id: r.id,
        rating: r.rating,
        review: r.review!.trim(),
        courseId: r.course.id,
        courseTitle: r.course.title,
      }));
  }
}

export const siteService = new SiteService();
