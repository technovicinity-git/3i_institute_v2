import { Router } from "express";
import { progressController } from "#/modules/progress/controller";
import { authenticate } from "#/middleware/authenticate";
import { validate } from "#/middleware/validate";
import { updateProgressSchema } from "#/modules/progress/schema";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/progress:
 *   get:
 *     tags: [Progress]
 *     summary: Get learner progress
 *     parameters:
 *       - in: query
 *         name: learnerProfileId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: courseId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Progress data
 *   post:
 *     tags: [Progress]
 *     summary: Update progress
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [materialId, learnerProfileId]
 *             properties:
 *               materialId: { type: string, format: uuid }
 *               learnerProfileId: { type: string, format: uuid }
 *               watchedSeconds: { type: integer }
 *               lastPosition: { type: integer }
 *               completed: { type: boolean }
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.get("/", authenticate, progressController.getProgress);
router.post(
  "/",
  authenticate,
  validate(updateProgressSchema),
  progressController.update,
);

export { router as progressRoutes };
