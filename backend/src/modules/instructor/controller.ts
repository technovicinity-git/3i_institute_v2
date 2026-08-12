import type { Request, Response, NextFunction } from "express";
import { instructorService } from "#/modules/instructor/service";
import {
  instructorApplicationSchema,
  adminReviewSchema,
} from "#/modules/instructor/schema";
import { sendSuccess } from "#/shared/response";

export class InstructorController {
  apply = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub!;
      const input = instructorApplicationSchema.parse(req.body);
      const result = await instructorService.apply(userId, input);
      sendSuccess(res, result, 201, "Application submitted");
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.sub!;
      const result = await instructorService.approve(
        adminId,
        req.params["userId"] as string,
      );
      sendSuccess(res, result, 200, "Instructor approved");
    } catch (error) {
      next(error);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.sub!;
      const input = adminReviewSchema.parse(req.body);
      const result = await instructorService.reject(
        adminId,
        req.params["userId"] as string,
        input.reason,
      );
      sendSuccess(res, result, 200, "Application rejected");
    } catch (error) {
      next(error);
    }
  };

  getPending = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const applications = await instructorService.getPendingApplications();
      sendSuccess(res, applications, 200);
    } catch (error) {
      next(error);
    }
  };

  suspend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.sub!;
      const result = await instructorService.suspend(
        adminId,
        req.params["instructorId"] as string,
      );
      sendSuccess(res, result, 200, "Instructor suspended");
    } catch (error) {
      next(error);
    }
  };
}

export const instructorController = new InstructorController();
