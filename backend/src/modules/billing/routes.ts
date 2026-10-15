import { Router } from "express";
import { billingController } from "#/modules/billing/controller";
import { authenticate } from "#/middleware/authenticate";
import { validate } from "#/middleware/validate";
import { createCheckoutSessionSchema } from "#/modules/billing/schema";

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

export { router as billingRoutes };
