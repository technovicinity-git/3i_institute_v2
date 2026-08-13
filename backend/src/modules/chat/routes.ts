import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { chatService } from "#/modules/chat/service";
import { sendSuccess } from "#/shared/response";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/chat/course/{courseId}/messages:
 *   get:
 *     tags: [Chat]
 *     summary: Get course chat messages
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: batchId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get(
  "/course/:courseId/messages",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const batchId = req.query["batchId"] as string | undefined;
      const messages = await chatService.getCourseMessages(
        req.params["courseId"] as string,
        batchId,
      );
      sendSuccess(res, messages, 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /api/v1/chat/report:
 *   post:
 *     tags: [Chat]
 *     summary: Report a message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [messageId, reason]
 *             properties:
 *               messageId: { type: string, format: uuid }
 *               reason: { type: string }
 *     responses:
 *       201:
 *         description: Report submitted
 */
router.post(
  "/report",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reporterId = req.user?.sub!;
      const { messageId, reason } = req.body;
      const report = await chatService.reportMessage(
        reporterId,
        messageId,
        reason,
      );
      sendSuccess(res, report, 201, "Report submitted");
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /api/v1/chat/moderation-queue:
 *   get:
 *     tags: [Chat]
 *     summary: Get moderation queue (admin)
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get(
  "/moderation-queue",
  authenticate,
  authorize("chat.moderate"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const reports = await chatService.getModerationQueue();
      sendSuccess(res, reports, 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /api/v1/chat/moderate:
 *   post:
 *     tags: [Chat]
 *     summary: Moderate a message (admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [messageId, action]
 *             properties:
 *               messageId: { type: string, format: uuid }
 *               action: { type: string, enum: [DELETE, MUTE, REMOVE] }
 *     responses:
 *       200:
 *         description: Moderation action logged
 */
router.post(
  "/moderate",
  authenticate,
  authorize("chat.moderate"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const moderatorId = req.user?.sub!;
      const { messageId, action } = req.body;
      const result = await chatService.moderateMessage(
        moderatorId,
        messageId,
        action,
      );
      sendSuccess(res, result, 200, "Moderation action completed");
    } catch (error) {
      next(error);
    }
  },
);

export { router as chatRoutes };
