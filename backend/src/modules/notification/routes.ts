import { Router } from "express";
import { notificationController } from "#/modules/notification/controller";
import { authenticate } from "#/middleware/authenticate";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get my notifications
 *     description: >
 *       Pass learnerProfileId for a learner profile's feed. Without it, returns
 *       account-level notifications (instructor, admin, account holder).
 *     parameters:
 *       - in: query
 *         name: learnerProfileId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: unreadOnly
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: "{ notifications, total, page, limit, hasMore, unreadCount }"
 */
router.get("/", authenticate, notificationController.getMyNotifications);

/**
 * @swagger
 * /api/v1/notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification counts
 *     parameters:
 *       - in: query
 *         name: learnerProfileId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: "{ unreadCount, account, byProfile: { [learnerProfileId]: count } }"
 */
router.get(
  "/unread-count",
  authenticate,
  notificationController.getUnreadCount,
);

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark all notifications in a feed as read
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: All marked as read
 */
router.post("/read-all", authenticate, notificationController.markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}/read:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.post("/:id/read", authenticate, notificationController.markAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Remove a notification from the feed
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Removed
 */
router.delete("/:id", authenticate, notificationController.archive);

export { router as notificationRoutes };
