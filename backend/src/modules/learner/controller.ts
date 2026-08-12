import type { Request, Response, NextFunction } from "express";
import { learnerService } from "#/modules/learner/service";
import {
  createLearnerSchema,
  updateLearnerSchema,
} from "#/modules/learner/schema";
import { sendSuccess } from "#/shared/response";

export class LearnerController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub!;
      const input = createLearnerSchema.parse(req.body);
      const profile = await learnerService.create(userId, input);
      sendSuccess(res, profile, 201, "Learner profile created");
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub!;
      const profiles = await learnerService.getAll(userId);
      sendSuccess(res, profiles, 200);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub!;
      const profile = await learnerService.getById(
        userId,
        req.params["id"] as string,
      );
      sendSuccess(res, profile, 200);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub!;
      const input = updateLearnerSchema.parse(req.body);
      const profile = await learnerService.update(
        userId,
        req.params["id"] as string,
        input,
      );
      sendSuccess(res, profile, 200, "Profile updated");
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub!;
      await learnerService.delete(userId, req.params["id"] as string);
      sendSuccess(res, null, 200, "Profile deleted");
    } catch (error) {
      next(error);
    }
  };
}

export const learnerController = new LearnerController();
