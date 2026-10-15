import { Router } from "express";
import { subscriptionController } from "#/modules/subscription/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import {
  createSubscriptionRequestSchema,
  paymentSettingsSchema,
  rejectSubscriptionRequestSchema,
} from "#/modules/subscription/schema";

// ─── Account holder, mounted at /subscriptions ───

const router: Router = Router();

/**
 * @swagger
 * /api/v1/subscriptions/overview:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Payment details, each profile's subscription status and recent requests
 *     responses:
 *       200:
 *         description: Subscription overview
 */
router.get("/overview", authenticate, subscriptionController.getOverview);

/**
 * @swagger
 * /api/v1/subscriptions/requests:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Apply for a one-month subscription for a learner profile after paying manually
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [learnerProfileId, paymentMethod, amount, transactionId, paidAt]
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *               paymentMethod: { type: string }
 *               amount: { type: number }
 *               transactionId: { type: string }
 *               senderAccount: { type: string }
 *               paidAt: { type: string, format: date-time }
 *               note: { type: string }
 *               proofImageUrl: { type: string, format: uri }
 *     responses:
 *       201:
 *         description: Request submitted for review
 */
router.post(
  "/requests",
  authenticate,
  authorize("profiles.update"),
  validate(createSubscriptionRequestSchema),
  subscriptionController.createRequest,
);

/**
 * @swagger
 * /api/v1/subscriptions/requests/{id}/cancel:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Cancel a pending subscription request
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Request cancelled
 */
router.post(
  "/requests/:id/cancel",
  authenticate,
  authorize("profiles.update"),
  subscriptionController.cancelRequest,
);

// ─── Admin, mounted at /admin/subscription-requests ───

const adminRouter: Router = Router();
adminRouter.use(authenticate, authorize("admin.access"));

/**
 * @swagger
 * /api/v1/admin/subscription-requests:
 *   get:
 *     tags: [Subscriptions]
 *     summary: List subscription requests (admin)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, REJECTED, CANCELLED] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Requests with payment details
 */
adminRouter.get("/", subscriptionController.listRequests);

/**
 * @swagger
 * /api/v1/admin/subscription-requests/payment-settings:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Bank / mobile banking details shown to account holders (admin)
 *     responses:
 *       200:
 *         description: Payment settings
 *   put:
 *     tags: [Subscriptions]
 *     summary: Save payment settings (admin)
 *     responses:
 *       200:
 *         description: Saved
 */
adminRouter.get("/payment-settings", subscriptionController.getPaymentSettings);
adminRouter.put(
  "/payment-settings",
  validate(paymentSettingsSchema),
  subscriptionController.savePaymentSettings,
);

/**
 * @swagger
 * /api/v1/admin/subscription-requests/{id}/approve:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Approve a payment and subscribe the profile for one month (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Approved
 */
adminRouter.post("/:id/approve", subscriptionController.approveRequest);

/**
 * @swagger
 * /api/v1/admin/subscription-requests/{id}/reject:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Reject a subscription request (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Rejected
 */
adminRouter.post(
  "/:id/reject",
  validate(rejectSubscriptionRequestSchema),
  subscriptionController.rejectRequest,
);

export {
  router as subscriptionRoutes,
  adminRouter as adminSubscriptionRequestRoutes,
};
