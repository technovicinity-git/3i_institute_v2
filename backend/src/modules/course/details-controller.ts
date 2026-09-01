import type { Request, Response, NextFunction } from "express";
import { courseDetailsService } from "#/modules/course/details-service";
import { sendSuccess } from "#/shared/response";

export class CourseDetailsController {
  getCourseDetails = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const courseId = req.params["id"] as string;
      const learnerProfileId = req.query["learnerProfileId"] as
        string | undefined;
      const data = await courseDetailsService.getCourseDetails(
        courseId,
        learnerProfileId,
      );
      sendSuccess(res, data, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const courseDetailsController = new CourseDetailsController();
