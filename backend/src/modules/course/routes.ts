import { Router } from "express";
import { courseController } from "#/modules/course/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import {
  createCourseSchema,
  updateCourseSchema,
} from "#/modules/course/schema";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     tags: [Courses]
 *     summary: List published courses
 *     description: Public course listing with filters and pagination.
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [REGULAR, ONLINE_CLASS, MIXED] }
 *       - in: query
 *         name: level
 *         schema: { type: string }
 *       - in: query
 *         name: language
 *         schema: { type: string, enum: [en, bn, hi, ur, ar] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of courses
 *   post:
 *     tags: [Courses]
 *     summary: Create a course
 *     description: Instructor creates a course. Courses tagged under 13 require admin approval.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, summary, description, category, type, level, minimumAge]
 *             properties:
 *               title: { type: string }
 *               summary: { type: string }
 *               description: { type: string }
 *               thumbnailUrl: { type: string }
 *               category: { type: string }
 *               type: { type: string, enum: [REGULAR, ONLINE_CLASS, MIXED] }
 *               level: { type: string }
 *               language: { type: string, enum: [en, bn, hi, ur, ar] }
 *               minimumAge: { type: integer, minimum: 5, maximum: 18 }
 *               maximumAge: { type: integer }
 *     responses:
 *       201:
 *         description: Course created
 */
router.get("/", courseController.list);
router.post(
  "/",
  authenticate,
  authorize("courses.create"),
  validate(createCourseSchema),
  courseController.create,
);

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Get course by ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Course details
 *   patch:
 *     tags: [Courses]
 *     summary: Update a course
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Course updated
 */
router.get("/:id", courseController.getById);
router.patch(
  "/:id",
  authenticate,
  authorize("courses.update"),
  validate(updateCourseSchema),
  courseController.update,
);

/**
 * @swagger
 * /api/v1/courses/{id}/suspend:
 *   post:
 *     tags: [Courses]
 *     summary: Suspend a course
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Course suspended
 */
router.post(
  "/:id/suspend",
  authenticate,
  authorize("courses.suspend"),
  courseController.suspend,
);

/**
 * @swagger
 * /api/v1/courses/{id}/approve:
 *   post:
 *     tags: [Courses]
 *     summary: Approve a pending course (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Course approved
 */
router.post(
  "/:id/approve",
  authenticate,
  authorize("courses.approve"),
  courseController.approve,
);

/**
 * @swagger
 * /api/v1/courses/{id}/reject:
 *   post:
 *     tags: [Courses]
 *     summary: Reject a pending course (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Course rejected
 */
router.post(
  "/:id/reject",
  authenticate,
  authorize("courses.approve"),
  courseController.reject,
);

export { router as courseRoutes };
