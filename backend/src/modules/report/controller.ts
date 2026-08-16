import type { Request, Response, NextFunction } from "express";
import { reportService } from "#/modules/report/service";
import { sendSuccess } from "#/shared/response";

export class ReportController {
  getLearnerActivity = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { startDate, endDate } = req.query;
      const result = await reportService.getLearnerActivity({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getCoursePerformance = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await reportService.getCoursePerformance();
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getEnrolmentReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { startDate, endDate } = req.query;
      const result = await reportService.getEnrolmentReport({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getAttendanceReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const courseId = req.query["courseId"] as string | undefined;
      const batchId = req.query["batchId"] as string | undefined;
      const result = await reportService.getAttendanceReport(courseId, batchId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getExamResults = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.query["courseId"] as string | undefined;
      const result = await reportService.getExamResults(courseId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getRevenueReport = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { startDate, endDate } = req.query;
      const result = await reportService.getRevenueReport({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getInstructorActivity = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await reportService.getInstructorActivity();
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const reportController = new ReportController();
