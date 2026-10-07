import { Router } from "express";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import {
  adminBroadcastSchema,
  broadcastController,
  instructorBroadcastSchema,
} from "#/modules/notification/broadcast-controller";

// ──────────────────────────────────
// Admin: /api/v1/admin/notifications
// ──────────────────────────────────
const adminRouter: Router = Router();

/**
 * @swagger
 * /api/v1/admin/notifications/broadcasts/preview:
 *   get:
 *     tags: [Notifications]
 *     summary: Count recipients for an admin notification
 *     parameters:
 *       - in: query
 *         name: audience
 *         required: true
 *         schema: { type: string, enum: [INSTRUCTORS, LEARNERS, ALL] }
 *     responses:
 *       200:
 *         description: "{ recipientCount, pushDeviceCount, pushConfigured }"
 */
adminRouter.get(
  "/broadcasts/preview",
  authenticate,
  authorize("admin.access"),
  broadcastController.adminPreview,
);

/**
 * @swagger
 * /api/v1/admin/notifications/broadcasts:
 *   get:
 *     tags: [Notifications]
 *     summary: Sent notification history (admins and instructors)
 *     responses:
 *       200:
 *         description: "{ broadcasts, total, page, limit, hasMore }"
 *   post:
 *     tags: [Notifications]
 *     summary: Send a custom notification to instructors, learners or both
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body, channels, audience]
 *             properties:
 *               title: { type: string, maxLength: 100 }
 *               body: { type: string, maxLength: 1000 }
 *               channels: { type: array, items: { type: string, enum: [IN_APP, PUSH] } }
 *               audience: { type: string, enum: [INSTRUCTORS, LEARNERS, ALL] }
 *     responses:
 *       201:
 *         description: "{ id, recipientCount, pushDevices, pushSent, pushFailed }"
 */
adminRouter.get(
  "/broadcasts",
  authenticate,
  authorize("admin.access"),
  broadcastController.adminList,
);
adminRouter.post(
  "/broadcasts",
  authenticate,
  authorize("admin.access"),
  validate(adminBroadcastSchema),
  broadcastController.adminSend,
);

// ──────────────────────────────────
// Instructor: /api/v1/instructors/notifications
// ──────────────────────────────────
const instructorRouter: Router = Router();

/**
 * @swagger
 * /api/v1/instructors/notifications/broadcasts/preview:
 *   get:
 *     tags: [Notifications]
 *     summary: Count recipients for a course or batch notification
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: batchId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: "{ recipientCount, pushDeviceCount, pushConfigured }"
 */
instructorRouter.get(
  "/broadcasts/preview",
  authenticate,
  authorize("courses.update"),
  broadcastController.instructorPreview,
);

/**
 * @swagger
 * /api/v1/instructors/notifications/broadcasts:
 *   get:
 *     tags: [Notifications]
 *     summary: Notifications this instructor has sent
 *     responses:
 *       200:
 *         description: "{ broadcasts, total, page, limit, hasMore }"
 *   post:
 *     tags: [Notifications]
 *     summary: Notify all students of a course, or of one batch (online classes)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body, channels, courseId]
 *             properties:
 *               title: { type: string, maxLength: 100 }
 *               body: { type: string, maxLength: 1000 }
 *               channels: { type: array, items: { type: string, enum: [IN_APP, PUSH] } }
 *               courseId: { type: string, format: uuid }
 *               batchId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: "{ id, recipientCount, pushDevices, pushSent, pushFailed }"
 */
instructorRouter.get(
  "/broadcasts",
  authenticate,
  authorize("courses.update"),
  broadcastController.instructorList,
);
instructorRouter.post(
  "/broadcasts",
  authenticate,
  authorize("courses.update"),
  validate(instructorBroadcastSchema),
  broadcastController.instructorSend,
);

export {
  adminRouter as adminBroadcastRoutes,
  instructorRouter as instructorBroadcastRoutes,
};
