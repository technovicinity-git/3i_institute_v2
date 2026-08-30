import type { Request, Response, NextFunction } from "express";
import { courseService } from "#/modules/course/service";
import {
  createCourseSchema,
  updateCourseSchema,
  listCoursesQuerySchema,
} from "#/modules/course/schema";
import { sendSuccess, sendPaginated } from "#/shared/response";

export class CourseController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const input = createCourseSchema.parse(req.body);
      const course = await courseService.create(instructorId, input);
      sendSuccess(res, course, 201, "Course created");
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const input = updateCourseSchema.parse(req.body);
      const course = await courseService.update(
        instructorId,
        req.params["id"] as string,
        input,
      );
      sendSuccess(res, course, 200, "Course updated");
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const course = await courseService.getById(req.params["id"] as string);
      sendSuccess(res, course, 200);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = listCoursesQuerySchema.parse(req.query);
      const accountId = req.user?.sub;
      const learnerProfileId = req.query["learnerProfileId"] as
        string | undefined;

      const result = await courseService.list(
        query,
        accountId,
        learnerProfileId,
      );
      sendPaginated(res, result.courses, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  };

  suspend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const course = await courseService.suspend(
        instructorId,
        req.params["id"] as string,
      );
      sendSuccess(res, course, 200, "Course suspended");
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.sub!;
      const course = await courseService.approve(
        adminId,
        req.params["id"] as string,
      );
      sendSuccess(res, course, 200, "Course approved");
    } catch (error) {
      next(error);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.sub!;
      const course = await courseService.reject(
        adminId,
        req.params["id"] as string,
      );
      sendSuccess(res, course, 200, "Course rejected");
    } catch (error) {
      next(error);
    }
  };

  getMyCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const courses = await courseService.getInstructorCourses(instructorId);
      sendSuccess(res, courses, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const courseController = new CourseController();
