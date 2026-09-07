import { prisma } from "#/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "#/shared/errors";
import type { CreateRatingInput } from "#/modules/rating/schema";

export class RatingService {
  async create(
    accountId: string,
    input: CreateRatingInput & { learnerProfileId?: string },
  ) {
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

    // Check if already rated by this learner profile
    const existing = await prisma.courseRating.findFirst({
      where: {
        courseId: input.courseId,
        learnerProfileId: input.learnerProfileId ?? null,
      },
    });

    if (existing) {
      throw new ConflictError(
        "This learner profile has already rated this course",
      );
    }

    const rating = await prisma.courseRating.create({
      data: {
        courseId: input.courseId,
        accountId,
        learnerProfileId: input.learnerProfileId ?? null,
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
        include: {
          account: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          learnerProfile: {
            select: {
              displayName: true,
            },
          },
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
