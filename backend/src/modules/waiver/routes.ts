import { Router } from "express";
import { waiverController } from "#/modules/waiver/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import {
  approveWaiverSchema,
  createWaiverSchema,
  reasonSchema,
} from "#/modules/waiver/schema";

// ─── Account holder, mounted at /waivers ───

const router: Router = Router();

/**
 * @swagger
 * /api/v1/waivers:
 *   get:
 *     tags: [Waivers]
 *     summary: My fee waiver requests
 *     responses:
 *       200:
 *         description: Waivers for the account's learner profiles
 *   post:
 *     tags: [Waivers]
 *     summary: Apply for a fee waiver for one learner profile
 *     description: One open (pending or unused approved) waiver per profile, and at most 3 applications per profile in 12 months.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [learnerProfileId, explanation]
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *               explanation: { type: string, minLength: 20 }
 *               evidenceFiles: { type: array, items: { type: string, format: uri }, maxItems: 3 }
 *     responses:
 *       201:
 *         description: Waiver request submitted
 */
router.get("/", authenticate, waiverController.listMine);
router.post(
  "/",
  authenticate,
  authorize("waivers.request"),
  validate(createWaiverSchema),
  waiverController.apply,
);

// ─── Admin, mounted at /admin/waivers ───

const adminRouter: Router = Router();
adminRouter.use(authenticate, authorize("admin.access"));

/**
 * @swagger
 * /api/v1/admin/waivers:
 *   get:
 *     tags: [Waivers]
 *     summary: List waiver requests (admin)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, REJECTED, REVOKED, USED, EXPIRED] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Waiver requests
 */
adminRouter.get("/", waiverController.list);

/**
 * @swagger
 * /api/v1/admin/waivers/{id}/approve:
 *   post:
 *     tags: [Waivers]
 *     summary: Approve a waiver with a discount tier (admin). Usable for 30 days.
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
 *             required: [tier]
 *             properties:
 *               tier: { type: integer, enum: [25, 50, 75, 100] }
 *     responses:
 *       200:
 *         description: Approved; the account holder is emailed
 */
adminRouter.post(
  "/:id/approve",
  validate(approveWaiverSchema),
  waiverController.approve,
);

/**
 * @swagger
 * /api/v1/admin/waivers/{id}/reject:
 *   post:
 *     tags: [Waivers]
 *     summary: Reject a waiver request (admin)
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
 *         description: Rejected; the account holder is emailed
 */
adminRouter.post("/:id/reject", validate(reasonSchema), waiverController.reject);

/**
 * @swagger
 * /api/v1/admin/waivers/{id}/revoke:
 *   post:
 *     tags: [Waivers]
 *     summary: Withdraw an approved, unused waiver (admin)
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
 *         description: Revoked; the account holder is emailed
 */
adminRouter.post("/:id/revoke", validate(reasonSchema), waiverController.revoke);

export { router as waiverRoutes, adminRouter as adminWaiverRoutes };
