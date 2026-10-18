import { Router } from "express";
import { adminController } from "#/modules/admin/controller";
import {
  adminQuestionsController,
  bulkQuestionsSchema,
} from "#/modules/admin/questions-controller";
import { validate } from "#/middleware/validate";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";

const router: Router = Router();

router.get("/dashboard", authenticate, authorize("admin.access"), adminController.getDashboard);
router.get("/learner-profiles", authenticate, authorize("admin.access"), adminController.getLearnerProfiles);
router.get("/learner-profiles/:id", authenticate, authorize("admin.access"), adminController.getLearnerProfileDetails);
router.post("/learner-profiles/:id/archive", authenticate, authorize("admin.access"), adminController.archiveLearnerProfile);
router.post("/learner-profiles/:id/restore", authenticate, authorize("admin.access"), adminController.restoreLearnerProfile);

// Question Bank: every question on the platform. Delete only works for
// questions nothing uses; used ones are archived instead.
const admin = [authenticate, authorize("admin.access")];
router.get("/questions", ...admin, adminQuestionsController.list);
router.get("/questions/filters", ...admin, adminQuestionsController.filterOptions);
router.post("/questions/bulk", ...admin, validate(bulkQuestionsSchema), adminQuestionsController.bulk);
router.get("/questions/:id", ...admin, adminQuestionsController.get);
router.post("/questions/:id/archive", ...admin, adminQuestionsController.archive);
router.post("/questions/:id/restore", ...admin, adminQuestionsController.restore);
router.delete("/questions/:id", ...admin, adminQuestionsController.delete);

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
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, INACTIVE] }
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
 *     summary: Deactivate a user (blocks login and ends all active sessions)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: User deactivated
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
 *     summary: Reactivate a deactivated user
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
 * /api/v1/admin/instructors/pending:
 *   get:
 *     tags: [Admin]
 *     summary: Get pending instructor applications
 *     responses:
 *       200:
 *         description: Pending applications
 */
router.get(
  "/instructors/pending",
  authenticate,
  authorize("admin.access"),
  adminController.getPendingApplications,
);

router.get("/instructors/:id", authenticate, authorize("admin.access"), adminController.getInstructorDetails);

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

// Get all courses with optional status filter
router.get(
  "/courses",
  authenticate,
  authorize("admin.access"),
  adminController.getAllCourses,
);

// Suspend course
router.post(
  "/courses/:id/suspend",
  authenticate,
  authorize("admin.access"),
  adminController.suspendCourse,
);

// Activate course
router.post(
  "/courses/:id/activate",
  authenticate,
  authorize("admin.access"),
  adminController.activateCourse,
);

router.get(
  "/subscriptions",
  authenticate,
  authorize("admin.access"),
  adminController.getSubscriptions,
);

router.get(
  "/certificates",
  authenticate,
  authorize("admin.access"),
  adminController.getCertificates,
);

router.get(
  "/exams",
  authenticate,
  authorize("admin.access"),
  adminController.getExams,
);

router.get(
  "/exams/:examId/attempts",
  authenticate,
  authorize("admin.access"),
  adminController.getExamAttempts,
);

export { router as adminRoutes };
