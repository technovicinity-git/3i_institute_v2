import { Router } from "express";
import { billingController } from "#/modules/billing/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import {
  createCheckoutSessionSchema,
  waiverRequestSchema,
  waiverDecisionSchema,
} from "#/modules/billing/schema";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/billing/checkout:
 *   post:
 *     tags: [Billing]
 *     summary: Create Stripe checkout session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan]
 *             properties:
 *               plan: { type: string, enum: [monthly, annual] }
 *               seats: { type: integer, minimum: 1, maximum: 6 }
 *     responses:
 *       200:
 *         description: Checkout URL
 */
router.post(
  "/checkout",
  authenticate,
  validate(createCheckoutSessionSchema),
  billingController.createCheckoutSession,
);

/**
 * @swagger
 * /api/v1/billing/subscription:
 *   get:
 *     tags: [Billing]
 *     summary: Get current subscription
 *     responses:
 *       200:
 *         description: Subscription details
 */
router.get("/subscription", authenticate, billingController.getSubscription);

/**
 * @swagger
 * /api/v1/billing/subscription/cancel:
 *   post:
 *     tags: [Billing]
 *     summary: Cancel subscription at end of billing period
 *     responses:
 *       200:
 *         description: Cancellation scheduled
 */
router.post(
  "/subscription/cancel",
  authenticate,
  billingController.cancelSubscription,
);

/**
 * @swagger
 * /api/v1/billing/waivers:
 *   get:
 *     tags: [Billing]
 *     summary: Get my waiver requests
 *     responses:
 *       200:
 *         description: List of waivers
 *   post:
 *     tags: [Billing]
 *     summary: Request a waiver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [explanation]
 *             properties:
 *               explanation: { type: string }
 *               evidenceFiles: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Waiver submitted
 */
router.get("/waivers", authenticate, billingController.getMyWaiver);
router.post(
  "/waivers",
  authenticate,
  authorize("waivers.request"),
  validate(waiverRequestSchema),
  billingController.requestWaiver,
);

/**
 * @swagger
 * /api/v1/billing/waivers/pending:
 *   get:
 *     tags: [Billing]
 *     summary: Get pending waiver requests (admin)
 *     responses:
 *       200:
 *         description: List of pending waivers
 */
router.get(
  "/waivers/pending",
  authenticate,
  authorize("waivers.manage"),
  billingController.getPendingWaivers,
);

/**
 * @swagger
 * /api/v1/billing/waivers/{waiverId}/review:
 *   post:
 *     tags: [Billing]
 *     summary: Review waiver request (admin)
 *     parameters:
 *       - in: path
 *         name: waiverId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [approved]
 *             properties:
 *               approved: { type: boolean }
 *               tier: { type: integer, enum: [25, 50, 75, 100] }
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Waiver reviewed
 */
router.post(
  "/waivers/:waiverId/review",
  authenticate,
  authorize("waivers.manage"),
  validate(waiverDecisionSchema),
  billingController.reviewWaiver,
);

/**
 * @swagger
 * /api/v1/billing/waivers/{waiverId}/revoke:
 *   post:
 *     tags: [Billing]
 *     summary: Revoke an active waiver (admin)
 *     parameters:
 *       - in: path
 *         name: waiverId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Waiver revoked
 */
router.post(
  "/waivers/:waiverId/revoke",
  authenticate,
  authorize("waivers.manage"),
  billingController.revokeWaiver,
);

export { router as billingRoutes };
