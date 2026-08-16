import type { Request, Response, NextFunction } from "express";
import { ratingService } from "#/modules/rating/service";
import { createRatingSchema } from "#/modules/rating/schema";
import { sendSuccess } from "#/shared/response";

export class RatingController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const input = createRatingSchema.parse(req.body);
      const rating = await ratingService.create(accountId, input);
      sendSuccess(res, rating, 201, "Rating submitted");
    } catch (error) {
      next(error);
    }
  };

  getCourseRatings = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const ratings = await ratingService.getCourseRatings(
        req.params["courseId"] as string,
      );
      sendSuccess(res, ratings, 200);
    } catch (error) {
      next(error);
    }
  };

  hideRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.sub!;
      const rating = await ratingService.hideRating(
        adminId,
        req.params["id"] as string,
      );
      sendSuccess(res, rating, 200, "Rating hidden");
    } catch (error) {
      next(error);
    }
  };
}

export const ratingController = new RatingController();
