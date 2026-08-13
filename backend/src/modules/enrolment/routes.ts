import { Router } from "express";
import { enrolmentController } from "#/modules/enrolment/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import { enrolSchema } from "#/modules/enrolment/schema";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/enrolments:
 *   get:
 *     tags: [Enrolments]
 *     summary: Get my enrolments
 *     description: Returns all enrolments for the authenticated account's learner profiles.
 *     parameters:
 *       - in: query
 *         name: learnerProfileId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of enrolments
 *   post:
 *     tags: [Enrolments]
 *     summary: Enrol in a course
 *     description: Enrol a learner profile in a course. Age gating and waitlist apply.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [learnerProfileId, courseId]
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *               courseId: { type: string, format: uuid }
 *               batchId: { type: string, format: uuid }
 *               ageOverride: { type: boolean, default: false }
 *     responses:
 *       201:
 *         description: Enrolled or waitlisted
 */
router.get("/", authenticate, enrolmentController.getMyEnrolments);
router.post(
  "/",
  authenticate,
  authorize("enrolment.enrol"),
  validate(enrolSchema),
  enrolmentController.enrol,
);

/**
 * @swagger
 * /api/v1/enrolments/waitlist/{batchId}/promote:
 *   post:
 *     tags: [Enrolments]
 *     summary: Promote first waitlisted learner
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Learner promoted
 */
router.post(
  "/waitlist/:batchId/promote",
  authenticate,
  authorize("enrolment.manage"),
  enrolmentController.promoteFromWaitlist,
);

/**
 * @swagger
 * /api/v1/enrolments/waitlist/{batchId}:
 *   get:
 *     tags: [Enrolments]
 *     summary: Get waitlist for a batch
 *     parameters:
 *       - in: path
 *         name: batchId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Waitlist
 */
router.get(
  "/waitlist/:batchId",
  authenticate,
  authorize("enrolment.manage"),
  enrolmentController.getWaitlist,
);

export { router as enrolmentRoutes };
