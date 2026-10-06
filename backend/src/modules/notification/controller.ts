import type { Request, Response, NextFunction } from "express";
import { notificationService } from "#/modules/notification/service";
import { sendSuccess } from "#/shared/response";
import { z } from "zod";

const listQuerySchema = z.object({
  learnerProfileId: z.string().uuid().optional(),
  category: z.string().max(50).optional(),
  unreadOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const scopeSchema = z.object({
  learnerProfileId: z.string().uuid().optional(),
});

export class NotificationController {
  getMyNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = listQuerySchema.parse(req.query);
      const result = await notificationService.list(req.user!.sub, query);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { learnerProfileId } = scopeSchema.parse(req.query);
      const counts = await notificationService.getUnreadCounts(
        req.user!.sub,
        learnerProfileId,
      );
      sendSuccess(res, counts, 200);
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await notificationService.markAsRead(
        req.user!.sub,
        req.params["id"] as string,
      );
      sendSuccess(res, null, 200, "Notification marked as read");
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Accept the scope from the body or the query string.
      const { learnerProfileId } = scopeSchema.parse({
        ...req.query,
        ...(req.body ?? {}),
      });
      const result = await notificationService.markAllAsRead(
        req.user!.sub,
        learnerProfileId,
      );
      sendSuccess(res, result, 200, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  };

  archive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await notificationService.archive(
        req.user!.sub,
        req.params["id"] as string,
      );
      sendSuccess(res, null, 200, "Notification removed");
    } catch (error) {
      next(error);
    }
  };
}

export const notificationController = new NotificationController();
