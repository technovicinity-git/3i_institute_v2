import { Router } from "express";
import { adminController } from "#/modules/admin/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users (admin)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Users list
 */
router.get(
  "/users",
  authenticate,
  authorize("admin.access"),
  adminController.getUsers,
);

/**
 * @swagger
 * /api/v1/admin/users/{id}/suspend:
 *   post:
 *     tags: [Admin]
 *     summary: Suspend a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User suspended
 */
router.post(
  "/users/:id/suspend",
  authenticate,
  authorize("admin.access"),
  adminController.suspendUser,
);

/**
 * @swagger
 * /api/v1/admin/users/{id}/activate:
 *   post:
 *     tags: [Admin]
 *     summary: Activate a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User activated
 */
router.post(
  "/users/:id/activate",
  authenticate,
  authorize("admin.access"),
  adminController.activateUser,
);

/**
 * @swagger
 * /api/v1/admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete(
  "/users/:id",
  authenticate,
  authorize("admin.access"),
  adminController.deleteUser,
);

/**
 * @swagger
 * /api/v1/admin/instructors:
 *   get:
 *     tags: [Admin]
 *     summary: Get all instructors (admin)
 *     responses:
 *       200:
 *         description: Instructors list
 */
router.get(
  "/instructors",
  authenticate,
  authorize("admin.access"),
  adminController.getInstructors,
);

/**
 * @swagger
 * /api/v1/admin/courses/pending:
 *   get:
 *     tags: [Admin]
 *     summary: Get courses pending review
 *     responses:
 *       200:
 *         description: Pending courses
 */
router.get(
  "/courses/pending",
  authenticate,
  authorize("admin.access"),
  adminController.getPendingCourses,
);

/**
 * @swagger
 * /api/v1/admin/waivers/pending:
 *   get:
 *     tags: [Admin]
 *     summary: Get pending waiver requests
 *     responses:
 *       200:
 *         description: Pending waivers
 */
router.get(
  "/waivers/pending",
  authenticate,
  authorize("admin.access"),
  adminController.getPendingWaivers,
);

export { router as adminRoutes };
