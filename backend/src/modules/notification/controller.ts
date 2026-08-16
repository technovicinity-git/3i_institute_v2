import type { Request, Response, NextFunction } from "express";
import { notificationService } from "#/modules/notification/service";
import { sendSuccess, sendPaginated } from "#/shared/response";
import { z } from "zod";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class NotificationController {
  getMyNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.sub!;
      const { page, limit } = listQuerySchema.parse(req.query);
      const result = await notificationService.getMyNotifications(
        userId,
        page,
        limit,
      );

      sendPaginated(res, result.notifications, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub!;
      const count = await notificationService.getUnreadCount(userId);
      sendSuccess(res, { unreadCount: count }, 200);
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub!;
      await notificationService.markAsRead(userId, req.params["id"] as string);
      sendSuccess(res, null, 200, "Notification marked as read");
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.sub!;
      await notificationService.markAllAsRead(userId);
      sendSuccess(res, null, 200, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  };
}

export const notificationController = new NotificationController();
