import { Router } from "express";
import { batchController } from "#/modules/batch/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import {
  createBatchSchema,
  updateBatchSchema,
  addSessionSchema,
  markAttendanceSchema,
} from "#/modules/batch/schema";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/batches:
 *   post:
 *     tags: [Batches]
 *     summary: Create a batch
 *     description: Instructor creates a batch for an Online Class or Mixed course.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, name, capacity, sessions]
 *             properties:
 *               courseId: { type: string, format: uuid }
 *               name: { type: string }
 *               capacity: { type: integer }
 *               sessions:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [title, scheduledAt, durationMinutes]
 *                   properties:
 *                     title: { type: string }
 *                     scheduledAt: { type: string, format: date-time }
 *                     durationMinutes: { type: integer }
 *                     meetingLink: { type: string }
 *                     notes: { type: string }
 *     responses:
 *       201:
 *         description: Batch created
 */
router.post(
  "/",
  authenticate,
  authorize("batches.create"),
  validate(createBatchSchema),
  batchController.create,
);

router.get(
  "/attendance/:sessionId",
  authenticate,
  authorize("attendance.mark"),
  batchController.getSessionAttendance,
);

/**
 * @swagger
 * /api/v1/batches/course/{courseId}:
 *   get:
 *     tags: [Batches]
 *     summary: Get batches for a course
 *     security: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of batches
 */
router.get("/course/:courseId", batchController.getCourseBatches);

/**
 * @swagger
 * /api/v1/batches/{id}:
 *   get:
 *     tags: [Batches]
 *     summary: Get batch by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Batch details
 *   patch:
 *     tags: [Batches]
 *     summary: Update batch
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Batch updated
 */
router.get("/:id", batchController.getById);
router.patch(
  "/:id",
  authenticate,
  authorize("batches.update"),
  validate(updateBatchSchema),
  batchController.update,
);

/**
 * @swagger
 * /api/v1/batches/{id}/sessions:
 *   post:
 *     tags: [Batches]
 *     summary: Add session to batch
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Session added
 */
router.post(
  "/:id/sessions",
  authenticate,
  authorize("batches.update"),
  validate(addSessionSchema),
  batchController.addSession,
);

/**
 * @swagger
 * /api/v1/batches/{id}/close:
 *   post:
 *     tags: [Batches]
 *     summary: Close a batch
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Batch closed
 */
router.post(
  "/:id/close",
  authenticate,
  authorize("batches.manage"),
  batchController.closeBatch,
);

/**
 * @swagger
 * /api/v1/batches/attendance:
 *   post:
 *     tags: [Batches]
 *     summary: Mark attendance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, learnerProfileId, status]
 *             properties:
 *               sessionId: { type: string, format: uuid }
 *               learnerProfileId: { type: string, format: uuid }
 *               status: { type: string, enum: [present, absent, late, excused] }
 *     responses:
 *       200:
 *         description: Attendance marked
 */
router.post(
  "/attendance",
  authenticate,
  authorize("attendance.mark"),
  validate(markAttendanceSchema),
  batchController.markAttendance,
);

export { router as batchRoutes };
