import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { sendSuccess } from "#/shared/response";
import { broadcastService } from "#/modules/notification/broadcast";
import {
  registerPushToken,
  unregisterPushToken,
} from "#/modules/notification/push";

const contentSchema = {
  title: z.string().trim().min(1, "Title is required").max(100),
  body: z.string().trim().min(1, "Message is required").max(1000),
  channels: z
    .array(z.enum(["IN_APP", "PUSH"]))
    .min(1, "Choose at least one channel"),
};

const audienceSchema = z.enum(["INSTRUCTORS", "LEARNERS", "ALL"]);

export const adminBroadcastSchema = z.object({
  ...contentSchema,
  audience: audienceSchema,
});

export const instructorBroadcastSchema = z.object({
  ...contentSchema,
  courseId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
});

export const pushTokenSchema = z.object({
  token: z.string().min(1).max(4096),
  platform: z.enum(["ios", "android", "web"]),
  deviceId: z.string().max(200).optional(),
  appVersion: z.string().max(50).optional(),
  locale: z.string().max(20).optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const instructorPreviewSchema = z.object({
  courseId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
});

export class BroadcastController {
  // ── Admin ──────────────────────────────
  adminPreview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const audience = audienceSchema.parse(req.query["audience"]);
      sendSuccess(res, await broadcastService.previewAdmin(audience), 200);
    } catch (error) {
      next(error);
    }
  };

  adminSend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await broadcastService.sendAdmin(req.user!.sub, req.body);
      sendSuccess(res, result, 201, "Notification sent");
    } catch (error) {
      next(error);
    }
  };

  adminList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = listQuerySchema.parse(req.query);
      sendSuccess(res, await broadcastService.list(page, limit), 200);
    } catch (error) {
      next(error);
    }
  };

  // ── Instructor ─────────────────────────
  instructorPreview = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { courseId, batchId } = instructorPreviewSchema.parse(req.query);
      sendSuccess(
        res,
        await broadcastService.previewInstructor(
          req.user!.sub,
          courseId,
          batchId,
        ),
        200,
      );
    } catch (error) {
      next(error);
    }
  };

  instructorSend = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await broadcastService.sendInstructor(
        req.user!.sub,
        req.body,
      );
      sendSuccess(res, result, 201, "Notification sent");
    } catch (error) {
      next(error);
    }
  };

  instructorList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = listQuerySchema.parse(req.query);
      sendSuccess(
        res,
        await broadcastService.list(page, limit, { senderId: req.user!.sub }),
        200,
      );
    } catch (error) {
      next(error);
    }
  };

  // ── Push tokens (any signed-in user) ───
  registerPushToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await registerPushToken(req.user!.sub, req.body);
      sendSuccess(res, null, 200, "Push token registered");
    } catch (error) {
      next(error);
    }
  };

  unregisterPushToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await unregisterPushToken(req.user!.sub, req.params["token"] as string);
      sendSuccess(res, null, 200, "Push token removed");
    } catch (error) {
      next(error);
    }
  };
}

export const broadcastController = new BroadcastController();
