import type { Request, Response, NextFunction } from "express";
import { userService } from "#/modules/user/service";
import { updateProfileSchema } from "#/modules/user/schema";
import { sendSuccess } from "#/shared/response";

export class UserController {
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const profile = await userService.getProfile(userId);
      sendSuccess(res, profile, 200);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const input = updateProfileSchema.parse(req.body);
      const updated = await userService.updateProfile(userId, input);
      sendSuccess(res, updated, 200, "Profile updated successfully");
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
