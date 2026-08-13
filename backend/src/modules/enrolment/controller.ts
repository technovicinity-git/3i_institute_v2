import type { Request, Response, NextFunction } from "express";
import { enrolmentService } from "#/modules/enrolment/service";
import { enrolSchema } from "#/modules/enrolment/schema";
import { sendSuccess } from "#/shared/response";

export class EnrolmentController {
  enrol = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const input = enrolSchema.parse(req.body);
      const enrolment = await enrolmentService.enrol(accountId, input);
      sendSuccess(
        res,
        enrolment,
        201,
        enrolment.waitlisted ? "Added to waitlist" : "Enrolled successfully",
      );
    } catch (error) {
      next(error);
    }
  };

  getMyEnrolments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.user?.sub!;
      const learnerProfileId = req.query["learnerProfileId"] as
        string | undefined;
      const enrolments = await enrolmentService.getLearnerEnrolments(
        accountId,
        learnerProfileId,
      );
      sendSuccess(res, enrolments, 200);
    } catch (error) {
      next(error);
    }
  };

  promoteFromWaitlist = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const promoted = await enrolmentService.promoteFromWaitlist(
        req.params["batchId"] as string,
      );

      if (!promoted) {
        sendSuccess(res, null, 200, "No waitlisted learners to promote");
        return;
      }

      sendSuccess(res, promoted, 200, "Learner promoted from waitlist");
    } catch (error) {
      next(error);
    }
  };

  getWaitlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const waitlist = await enrolmentService.getWaitlist(
        req.params["batchId"] as string,
      );
      sendSuccess(res, waitlist, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const enrolmentController = new EnrolmentController();
