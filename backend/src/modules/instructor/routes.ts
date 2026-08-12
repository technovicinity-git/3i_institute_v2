import { Router } from "express";
import { instructorController } from "#/modules/instructor/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import {
  instructorApplicationSchema,
  adminReviewSchema,
} from "#/modules/instructor/schema";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/instructors/apply:
 *   post:
 *     tags: [Instructors]
 *     summary: Apply to become an instructor
 *     description: Submit an instructor application with bio, expertise, CV, and WWCC details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bio
 *               - areaOfExpertise
 *               - cvUrl
 *               - wwccNumber
 *               - wwccState
 *               - wwccExpiry
 *             properties:
 *               bio:
 *                 type: string
 *                 minLength: 10
 *               areaOfExpertise:
 *                 type: string
 *               cvUrl:
 *                 type: string
 *                 format: uri
 *               wwccNumber:
 *                 type: string
 *               wwccState:
 *                 type: string
 *               wwccExpiry:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Application submitted
 */
router.post(
  "/apply",
  authenticate,
  validate(instructorApplicationSchema),
  instructorController.apply,
);

/**
 * @swagger
 * /api/v1/instructors/pending:
 *   get:
 *     tags: [Instructors]
 *     summary: Get pending instructor applications
 *     description: Admin only. Returns all pending instructor applications.
 *     responses:
 *       200:
 *         description: List of pending applications
 */
router.get(
  "/pending",
  authenticate,
  authorize("instructors.approve"),
  instructorController.getPending,
);

/**
 * @swagger
 * /api/v1/instructors/{userId}/approve:
 *   post:
 *     tags: [Instructors]
 *     summary: Approve instructor application
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Instructor approved
 */
router.post(
  "/:userId/approve",
  authenticate,
  authorize("instructors.approve"),
  instructorController.approve,
);

/**
 * @swagger
 * /api/v1/instructors/{userId}/reject:
 *   post:
 *     tags: [Instructors]
 *     summary: Reject instructor application
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Application rejected
 */
router.post(
  "/:userId/reject",
  authenticate,
  authorize("instructors.approve"),
  validate(adminReviewSchema),
  instructorController.reject,
);

/**
 * @swagger
 * /api/v1/instructors/{instructorId}/suspend:
 *   post:
 *     tags: [Instructors]
 *     summary: Suspend an instructor
 *     description: Admin only. Suspends instructor and all their courses.
 *     parameters:
 *       - in: path
 *         name: instructorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Instructor suspended
 */
router.post(
  "/:instructorId/suspend",
  authenticate,
  authorize("instructors.suspend"),
  instructorController.suspend,
);

export { router as instructorRoutes };
