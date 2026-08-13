import type { Request, Response, NextFunction } from "express";
import { batchService } from "#/modules/batch/service";
import {
  createBatchSchema,
  updateBatchSchema,
  addSessionSchema,
  markAttendanceSchema,
} from "#/modules/batch/schema";
import { sendSuccess } from "#/shared/response";

export class BatchController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const input = createBatchSchema.parse(req.body);
      const batch = await batchService.create(instructorId, input);
      sendSuccess(res, batch, 201, "Batch created");
    } catch (error) {
      next(error);
    }
  };

  getCourseBatches = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const batches = await batchService.getCourseBatches(
        req.params["courseId"] as string,
      );
      sendSuccess(res, batches, 200);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const batch = await batchService.getById(req.params["id"] as string);
      sendSuccess(res, batch, 200);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const input = updateBatchSchema.parse(req.body);
      const batch = await batchService.update(
        instructorId,
        req.params["id"] as string,
        input,
      );
      sendSuccess(res, batch, 200, "Batch updated");
    } catch (error) {
      next(error);
    }
  };

  addSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const input = addSessionSchema.parse(req.body);
      const session = await batchService.addSession(
        instructorId,
        req.params["id"] as string,
        input,
      );
      sendSuccess(res, session, 201, "Session added");
    } catch (error) {
      next(error);
    }
  };

  closeBatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const batch = await batchService.closeBatch(
        instructorId,
        req.params["id"] as string,
      );
      sendSuccess(res, batch, 200, "Batch closed");
    } catch (error) {
      next(error);
    }
  };

  markAttendance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const instructorId = req.user?.sub!;
      const input = markAttendanceSchema.parse(req.body);
      const attendance = await batchService.markAttendance(instructorId, input);
      sendSuccess(res, attendance, 200, "Attendance marked");
    } catch (error) {
      next(error);
    }
  };
}

export const batchController = new BatchController();
