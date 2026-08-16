import type { Request, Response, NextFunction } from "express";
import { progressService } from "#/modules/progress/service";
import {
  updateProgressSchema,
  getProgressQuerySchema,
} from "#/modules/progress/schema";
import { sendSuccess } from "#/shared/response";

export class ProgressController {
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const input = updateProgressSchema.parse(req.body);
      const progress = await progressService.update(accountId, input);
      sendSuccess(res, progress, 200, "Progress updated");
    } catch (error) {
      next(error);
    }
  };

  getProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const query = getProgressQuerySchema.parse(req.query);
      const result = await progressService.getProgress(
        accountId,
        query.learnerProfileId,
        query.courseId,
      );
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const progressController = new ProgressController();
