import { prisma } from "#/lib/prisma";
import { ConflictError, NotFoundError, ValidationError } from "#/shared/errors";

export class WishlistService {
  /**
   * Add course to learner's wishlist
   */
  async addToWishlist(
    accountId: string,
    input: { learnerProfileId: string; courseId: string },
  ) {
    // Verify learner profile belongs to account
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: input.learnerProfileId,
        accountId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    // Verify course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    if (course.status !== "PUBLISHED") {
      throw new ValidationError("Course is not available");
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        learnerProfileId_courseId: {
          learnerProfileId: input.learnerProfileId,
          courseId: input.courseId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("Course is already in wishlist");
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        learnerProfileId: input.learnerProfileId,
        courseId: input.courseId,
      },
    });

    return wishlistItem;
  }

  /**
   * Remove course from learner's wishlist
   */
  async removeFromWishlist(
    accountId: string,
    input: { learnerProfileId: string; courseId: string },
  ) {
    // Verify profile belongs to account
    const profile = await prisma.learnerProfile.findFirst({
      where: {
        id: input.learnerProfileId,
        accountId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundError("Learner profile not found");
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        learnerProfileId_courseId: {
          learnerProfileId: input.learnerProfileId,
          courseId: input.courseId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundError("Course is not in wishlist");
    }

    await prisma.wishlistItem.delete({
      where: { id: existing.id },
    });
  }

  /**
   * Get learner's wishlist
   */
  async getWishlist(accountId: string, learnerProfileId: string) {
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

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { learnerProfileId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            ratings: {
              where: { hidden: false },
              select: { rating: true },
            },
            _count: {
              select: { enrolments: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const courses = wishlistItems.map((item) => {
      const course = item.course;
      const avgRating =
        course.ratings.length > 0
          ? Math.round(
              (course.ratings.reduce((sum, r) => sum + r.rating, 0) /
                course.ratings.length) *
                10,
            ) / 10
          : null;

      return {
        wishlistItemId: item.id,
        addedAt: item.createdAt,
        course: {
          id: course.id,
          title: course.title,
          summary: course.summary,
          thumbnailUrl: course.thumbnailUrl,
          category: course.category,
          level: course.level,
          minimumAge: course.minimumAge,
          instructor: {
            id: course.instructor.id,
            name: `${course.instructor.firstName} ${course.instructor.lastName}`,
          },
          averageRating: avgRating,
          ratingCount: course.ratings.length,
          enrolmentCount: course._count.enrolments,
          format:
            course.type === "REGULAR"
              ? "self-paced"
              : course.type === "ONLINE_CLASS"
                ? "live"
                : "hybrid",
        },
      };
    });

    return {
      items: courses,
      total: courses.length,
    };
  }

  /**
   * Check if a course is in learner's wishlist
   */
  async isInWishlist(
    _accountId: string,
    learnerProfileId: string,
    courseId: string,
  ): Promise<boolean> {
    const item = await prisma.wishlistItem.findUnique({
      where: {
        learnerProfileId_courseId: {
          learnerProfileId,
          courseId,
        },
      },
    });

    return !!item;
  }
}

export const wishlistService = new WishlistService();
