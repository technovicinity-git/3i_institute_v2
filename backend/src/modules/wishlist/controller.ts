import type { Request, Response, NextFunction } from "express";
import { wishlistService } from "#/modules/wishlist/service";
import {
  addToWishlistSchema,
  removeFromWishlistSchema,
} from "#/modules/wishlist/schema";
import { sendSuccess } from "#/shared/response";

export class WishlistController {
  addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const input = addToWishlistSchema.parse(req.body);
      const result = await wishlistService.addToWishlist(accountId, input);
      sendSuccess(res, result, 201, "Added to wishlist");
    } catch (error) {
      next(error);
    }
  };

  removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const input = removeFromWishlistSchema.parse(req.body);
      await wishlistService.removeFromWishlist(accountId, input);
      sendSuccess(res, null, 200, "Removed from wishlist");
    } catch (error) {
      next(error);
    }
  };

  getWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const learnerProfileId = req.query["learnerProfileId"] as string;

      if (!learnerProfileId) {
        res.status(422).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "learnerProfileId is required",
          },
        });
        return;
      }

      const result = await wishlistService.getWishlist(accountId, learnerProfileId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const wishlistController = new WishlistController();