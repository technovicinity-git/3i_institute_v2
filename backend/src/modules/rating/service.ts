import { prisma } from "#/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "#/shared/errors";
import type { CreateRatingInput } from "#/modules/rating/schema";

export class RatingService {
  async create(accountId: string, input: CreateRatingInput) {
    // Verify course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.status !== "PUBLISHED") {
      throw new ValidationError("Course is not available for rating");
    }

    // Check if already rated (FR-CRS-11: once per course)
    const existing = await prisma.courseRating.findUnique({
      where: {
        courseId_accountId: {
          courseId: input.courseId,
          accountId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("You have already rated this course");
    }

    const rating = await prisma.courseRating.create({
      data: {
        courseId: input.courseId,
        accountId,
        rating: input.rating,
        review: input.review ?? null,
      },
    });

    return rating;
  }

  async getCourseRatings(courseId: string) {
    const [ratings, aggregate] = await Promise.all([
      prisma.courseRating.findMany({
        where: {
          courseId,
          hidden: false,
        },
        select: {
          id: true,
          rating: true,
          review: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.courseRating.aggregate({
        where: {
          courseId,
          hidden: false,
        },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return {
      ratings,
      averageRating: aggregate._avg.rating ?? null,
      totalRatings: aggregate._count.rating,
    };
  }

  async hideRating(adminId: string, ratingId: string) {
    const rating = await prisma.courseRating.findUnique({
      where: { id: ratingId },
    });

    if (!rating) {
      throw new NotFoundError("Rating not found");
    }

    const updated = await prisma.courseRating.update({
      where: { id: ratingId },
      data: { hidden: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "RATING_HIDDEN",
        resource: "course_rating",
        resourceId: ratingId,
      },
    });

    return updated;
  }
}

export const ratingService = new RatingService();
