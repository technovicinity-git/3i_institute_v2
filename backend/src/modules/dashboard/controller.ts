import type { Request, Response, NextFunction } from "express";
import { dashboardService } from "#/modules/dashboard/service";
import { sendSuccess } from "#/shared/response";

export class DashboardController {
  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
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

      // Learner's UTC offset (JS getTimezoneOffset convention) so streaks
      // and weekly activity follow their local calendar days.
      const tzOffset = Number(req.query["tzOffset"]);
      const data = await dashboardService.getDashboardData(
        accountId,
        learnerProfileId,
        Number.isFinite(tzOffset) && Math.abs(tzOffset) <= 14 * 60 ? tzOffset : 0,
      );
      sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
