import { prisma } from "#/lib/prisma";
import { NotFoundError } from "#/shared/errors";

export class CourseDetailsService {
  async getCourseDetails(courseId: string, learnerProfileId?: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            avatarUrl: true,
          },
        },
        materials: {
          orderBy: { order: "asc" },
        },
        ratings: {
          where: { hidden: false },
          select: {
            id: true,
            rating: true,
            review: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            enrolments: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Compute rating summary
    const totalRatings = course.ratings.length;
    const avgRating =
      totalRatings > 0
        ? Math.round(
            (course.ratings.reduce((sum, r) => sum + r.rating, 0) /
              totalRatings) *
              10,
          ) / 10
        : 0;

    // Rating distribution
    const ratingBars = [5, 4, 3, 2, 1].map((stars) => {
      const count = course.ratings.filter((r) => r.rating === stars).length;
      const pct =
        totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
      return { stars, count, pct };
    });

    // Get recent reviews (top 3)
    const reviews = course.ratings.slice(0, 3).map((r) => ({
      id: r.id,
      name: "Student", // We don't store name in rating — update if needed
      role: "",
      rating: r.rating,
      text: r.review ?? "",
      createdAt: r.createdAt,
    }));

    // Get instructor stats
    const instructorStats = await prisma.course.findMany({
      where: {
        instructorId: course.instructorId,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        _count: {
          select: {
            enrolments: true,
          },
        },
      },
    });

    const instructorCourseCount = instructorStats.length;
    const instructorStudentCount = instructorStats.reduce(
      (sum, c) => sum + c._count.enrolments,
      0,
    );

    // Get related courses
    const relatedCourses = await prisma.course.findMany({
      where: {
        id: { not: courseId },
        status: "PUBLISHED",
        OR: [{ category: course.category }, { level: course.level }],
      },
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        ratings: {
          where: { hidden: false },
          select: { rating: true },
        },
      },
      take: 4,
    });

    const related = relatedCourses.map((c) => {
      const cAvg =
        c.ratings.length > 0
          ? Math.round(
              (c.ratings.reduce((sum, r) => sum + r.rating, 0) /
                c.ratings.length) *
                10,
            ) / 10
          : 0;

      return {
        id: c.id,
        title: c.title,
        thumbnailUrl: c.thumbnailUrl,
        instructor: `${c.instructor.firstName} ${c.instructor.lastName}`,
        rating: cAvg,
        level: c.level,
      };
    });

    let isEnrolled = false;
    let enrolmentBatchId: string | null = null;

    if (learnerProfileId) {
      const enrolment = await prisma.enrolment.findFirst({
        where: {
          learnerProfileId,
          courseId,
          waitlisted: false,
        },
      });

      if (enrolment) {
        isEnrolled = true;
        enrolmentBatchId = enrolment.batchId;
      }
    }

    return {
      id: course.id,
      title: course.title,
      summary: course.summary,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      coverImageUrl: course.coverImageUrl ?? course.thumbnailUrl,
      category: course.category,
      type: course.type,
      level: course.level,
      language: course.language,
      minimumAge: course.minimumAge,

      // Content
      learningOutcomes: (course.learningOutcomes as string[]) ?? [],
      requirements: (course.requirements as string[]) ?? [],
      whatIncluded: (course.whatIncluded as string[]) ?? [],
      faq: (course.faq as Array<{ question: string; answer: string }>) ?? [],
      aboutParagraphs: course.description.split("\n\n"),

      // Stats
      totalModules: course.totalModules,
      totalLessons: course.totalLessons,
      totalDurationMinutes: course.totalDurationMinutes,
      durationWeeks: 12, // Could be calculated

      // Instructor
      instructor: {
        id: course.instructor.id,
        name: `${course.instructor.firstName} ${course.instructor.lastName}`,
        bio: course.instructor.bio ?? "",
        avatarUrl: course.instructor.avatarUrl ?? "",
        rating: avgRating,
        courseCount: instructorCourseCount,
        studentCount: instructorStudentCount,
      },

      // Ratings
      ratingSummary: {
        average: avgRating,
        total: totalRatings,
        distribution: ratingBars,
      },
      reviews,

      // Curriculum
      curriculum: course.materials.map((m, i) => ({
        moduleNum: String(i + 1).padStart(2, "0"),
        title: m.title,
        lessons: 1, // Each material is one lesson for now
        duration: m.duration ? `${Math.floor(m.duration / 60)}m` : "0m",
        lessonsList: [
          {
            title: m.title,
            duration: m.duration
              ? `${Math.floor(m.duration / 60)}:${String(m.duration % 60).padStart(2, "0")}`
              : "00:00",
          },
        ],
      })),

      // Related
      relatedCourses: related,
      enrolmentCount: course._count.enrolments,
      isEnrolled,
      enrolmentBatchId,
    };
  }
}

export const courseDetailsService = new CourseDetailsService();
