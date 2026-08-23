import { prisma } from "#/lib/prisma";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "#/shared/errors";
import type {
  CreateCourseInput,
  UpdateCourseInput,
  ListCoursesQuery,
} from "#/modules/course/schema";

export class CourseService {
  async create(instructorId: string, input: CreateCourseInput) {
    // Verify instructor role
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId },
      include: { role: true },
    });

    if (!instructor) {
      throw new NotFoundError("Instructor not found");
    }

    if (instructor.role.name !== "Instructor") {
      throw new ForbiddenError("Only instructors can create courses");
    }

    // FR-CRS-02: Age field mandatory — validation handles this
    // FR-CRS-04: Courses tagged under 13 need admin approval
    const needsApproval = input.minimumAge < 13;

    const course = await prisma.course.create({
      data: {
        title: input.title,
        summary: input.summary,
        description: input.description,
        thumbnailUrl: input.thumbnailUrl ?? null,
        category: input.category,
        type: input.type,
        level: input.level,
        language: input.language,
        minimumAge: input.minimumAge,
        maximumAge: input.maximumAge ?? null,
        status: needsApproval ? "PENDING_REVIEW" : "PUBLISHED",
        instructorId,
      },
    });

    return course;
  }

  async update(
    instructorId: string,
    courseId: string,
    input: UpdateCourseInput,
  ) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Only the assigned instructor or admin can update
    if (course.instructorId !== instructorId) {
      throw new ForbiddenError("You can only update your own courses");
    }

    // Check if age change requires review
    let status = course.status;
    if (input.minimumAge !== undefined) {
      const needsApproval = input.minimumAge < 13;
      if (needsApproval && course.status === "PUBLISHED") {
        status = "PENDING_REVIEW";
      }
      if (!needsApproval && course.status === "PENDING_REVIEW") {
        status = "PUBLISHED";
      }
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...input,
        status,
        approvedAt: null,
        approvedBy: null,
      },
    });

    return updated;
  }

  async getById(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        materials: {
          orderBy: { order: "asc" },
        },
        batches: {
          where: { status: "UPCOMING" },
        },
      },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    return course;
  }

  async list(query: ListCoursesQuery) {
    const {
      page,
      limit,
      category,
      level,
      type,
      format,
      search,
      sortBy,
      minRating,
    } = query;

    const where: any = {
      status: "PUBLISHED",
      ...(category && { category }),
      ...(level && { level }),
      ...(type && { type }),
      ...(format && {
        type:
          format === "self-paced"
            ? "REGULAR"
            : format === "live"
              ? "ONLINE_CLASS"
              : "MIXED",
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { summary: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          {
            instructor: {
              firstName: { contains: search, mode: "insensitive" },
            },
          },
          {
            instructor: {
              lastName: { contains: search, mode: "insensitive" },
            },
          },
        ],
      }),
      ...(minRating && {
        ratings: {
          some: {
            rating: { gte: minRating },
          },
        },
      }),
    };

    // Build orderBy based on sortBy
    let orderBy: any = { createdAt: "desc" };

    switch (sortBy) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "rating":
        // Use raw SQL for average rating sort
        orderBy = {
          ratings: {
            _count: "desc",
          },
        };
        break;
      case "title":
        orderBy = { title: "asc" };
        break;
      case "popularity":
      default:
        // Popularity = enrolment count
        orderBy = {
          enrolments: {
            _count: "desc",
          },
        };
        break;
    }

    const [total, courses] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              enrolments: true,
            },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Transform courses to include computed fields
    const transformedCourses = courses.map((course) => {
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
        summary: course.summary,
        thumbnailUrl: course.thumbnailUrl,
        category: course.category,
        type: course.type,
        level: course.level,
        language: course.language,
        minimumAge: course.minimumAge,
        instructor: {
          id: course.instructor.id,
          name: `${course.instructor.firstName} ${course.instructor.lastName}`,
        },
        enrolmentCount: course._count.enrolments,
        averageRating: avgRating,
        ratingCount: course.ratings.length,
        format:
          course.type === "REGULAR"
            ? "self-paced"
            : course.type === "ONLINE_CLASS"
              ? "live"
              : "hybrid",
      };
    });

    return { courses: transformedCourses, total, page, limit };
  }

  async suspend(instructorId: string, courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.instructorId !== instructorId) {
      throw new ForbiddenError("You can only suspend your own courses");
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { status: "SUSPENDED" },
    });

    return updated;
  }

  async approve(adminId: string, courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.status !== "PENDING_REVIEW") {
      throw new ValidationError("Course is not pending review");
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: "PUBLISHED",
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });

    return updated;
  }

  async reject(adminId: string, courseId: string, reason?: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: "DRAFT",
        approvedAt: null,
        approvedBy: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "COURSE_REJECTED",
        resource: "course",
        resourceId: courseId,
        details: { reason: reason ?? null },
      },
    });

    return updated;
  }
}

export const courseService = new CourseService();
