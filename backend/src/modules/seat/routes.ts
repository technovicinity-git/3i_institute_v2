import { Router } from "express";
import { seatController } from "#/modules/seat/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import {
  assignSeatSchema,
  cancelSeatSchema,
  profileSubscriptionSchema,
} from "#/modules/seat/schema";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/seats:
 *   get:
 *     tags: [Seats]
 *     summary: Get all seats for account
 *     responses:
 *       200:
 *         description: Seat information
 *   post:
 *     tags: [Seats]
 *     summary: Assign a seat to a learner profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [learnerProfileId]
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Seat assigned
 */
router.get("/", authenticate, seatController.getAccountSeats);
router.post(
  "/assign",
  authenticate,
  authorize("profiles.update"),
  validate(assignSeatSchema),
  seatController.assignSeat,
);

/**
 * @swagger
 * /api/v1/seats/cancel:
 *   post:
 *     tags: [Seats]
 *     summary: Cancel a seat for a profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [learnerProfileId]
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Seat cancelled
 */
router.post(
  "/cancel",
  authenticate,
  authorize("profiles.update"),
  validate(cancelSeatSchema),
  seatController.cancelSeat,
);

/**
 * @swagger
 * /api/v1/seats/subscriptions:
 *   get:
 *     tags: [Seats]
 *     summary: Subscription status of every learner profile on the account
 *     responses:
 *       200:
 *         description: Profiles with their subscription status
 */
router.get(
  "/subscriptions",
  authenticate,
  seatController.getSubscriptionOverview,
);

/**
 * @swagger
 * /api/v1/seats/subscribe:
 *   post:
 *     tags: [Seats]
 *     summary: Manually subscribe a learner profile (no payment yet)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [learnerProfileId]
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Profile subscribed
 */
router.post(
  "/subscribe",
  authenticate,
  authorize("profiles.update"),
  validate(profileSubscriptionSchema),
  seatController.subscribeProfile,
);

/**
 * @swagger
 * /api/v1/seats/unsubscribe:
 *   post:
 *     tags: [Seats]
 *     summary: Manually unsubscribe a learner profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [learnerProfileId]
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Profile unsubscribed
 */
router.post(
  "/unsubscribe",
  authenticate,
  authorize("profiles.update"),
  validate(profileSubscriptionSchema),
  seatController.unsubscribeProfile,
);

/**
 * @swagger
 * /api/v1/seats/status/{learnerProfileId}:
 *   get:
 *     tags: [Seats]
 *     summary: Get seat status for a profile
 *     parameters:
 *       - in: path
 *         name: learnerProfileId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Seat status
 */
router.get(
  "/status/:learnerProfileId",
  authenticate,
  seatController.getProfileSeatStatus,
);

export { router as seatRoutes };
