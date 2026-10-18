import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendSuccess } from "#/shared/response";
import { adminQuestionsService } from "#/modules/admin/questions-service";

export const bulkQuestionsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  action: z.enum(["archive", "restore", "delete"]),
});

const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

export class AdminQuestionsController {
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query["page"] ?? 1) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query["limit"] ?? 20) || 20));
      const result = await adminQuestionsService.list(page, limit, {
        search: text(req.query["search"]),
        courseId: text(req.query["courseId"]),
        instructorId: text(req.query["instructorId"]),
        type: text(req.query["type"]),
        difficulty: text(req.query["difficulty"]),
        status: text(req.query["status"]),
      });
      sendSuccess(res, result, 200);
    } catch (error) { next(error); }
  };

  filterOptions = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await adminQuestionsService.filterOptions(), 200);
    } catch (error) { next(error); }
  };

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await adminQuestionsService.get(req.params["id"] as string), 200);
    } catch (error) { next(error); }
  };

  archive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminQuestionsService.archive(req.params["id"] as string, req.user!.sub);
      sendSuccess(res, result, 200);
    } catch (error) { next(error); }
  };

  restore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminQuestionsService.restore(req.params["id"] as string, req.user!.sub);
      sendSuccess(res, result, 200);
    } catch (error) { next(error); }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminQuestionsService.delete(req.params["id"] as string, req.user!.sub);
      sendSuccess(res, result, 200);
    } catch (error) { next(error); }
  };

  bulk = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids, action } = bulkQuestionsSchema.parse(req.body);
      sendSuccess(res, await adminQuestionsService.bulk(ids, action, req.user!.sub), 200);
    } catch (error) { next(error); }
  };
}

export const adminQuestionsController = new AdminQuestionsController();
