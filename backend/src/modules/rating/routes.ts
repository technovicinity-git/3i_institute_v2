import { Router } from "express";
import { ratingController } from "#/modules/rating/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import { createRatingSchema } from "#/modules/rating/schema";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/ratings:
 *   post:
 *     tags: [Ratings]
 *     summary: Rate a course
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, rating]
 *             properties:
 *               courseId: { type: string, format: uuid }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               review: { type: string }
 *     responses:
 *       201:
 *         description: Rating submitted
 *       409:
 *         description: Already rated
 */
router.post(
  "/",
  authenticate,
  authorize("ratings.create"),
  validate(createRatingSchema),
  ratingController.create,
);

/**
 * @swagger
 * /api/v1/ratings/course/{courseId}:
 *   get:
 *     tags: [Ratings]
 *     summary: Get course ratings
 *     security: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Course ratings
 */
router.get("/course/:courseId", ratingController.getCourseRatings);

/**
 * @swagger
 * /api/v1/ratings/{id}/hide:
 *   post:
 *     tags: [Ratings]
 *     summary: Hide a rating (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Rating hidden
 */
router.post(
  "/:id/hide",
  authenticate,
  authorize("ratings.moderate"),
  ratingController.hideRating,
);

export { router as ratingRoutes };
