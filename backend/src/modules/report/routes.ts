import { Router } from "express";
import { reportController } from "#/modules/report/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/reports/learner-activity:
 *   get:
 *     tags: [Reports]
 *     summary: Learner activity report (admin)
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Learner activity summary
 */
router.get(
  "/learner-activity",
  authenticate,
  authorize("reports.read"),
  reportController.getLearnerActivity,
);

/**
 * @swagger
 * /api/v1/reports/course-performance:
 *   get:
 *     tags: [Reports]
 *     summary: Course performance report (admin)
 *     responses:
 *       200:
 *         description: Course performance data
 */
router.get(
  "/course-performance",
  authenticate,
  authorize("reports.read"),
  reportController.getCoursePerformance,
);

/**
 * @swagger
 * /api/v1/reports/enrolments:
 *   get:
 *     tags: [Reports]
 *     summary: Enrolment report (admin)
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Enrolment data
 */
router.get(
  "/enrolments",
  authenticate,
  authorize("reports.read"),
  reportController.getEnrolmentReport,
);

/**
 * @swagger
 * /api/v1/reports/attendance:
 *   get:
 *     tags: [Reports]
 *     summary: Attendance report (admin)
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: batchId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Attendance data
 */
router.get(
  "/attendance",
  authenticate,
  authorize("reports.read"),
  reportController.getAttendanceReport,
);

/**
 * @swagger
 * /api/v1/reports/exams:
 *   get:
 *     tags: [Reports]
 *     summary: Exam results report (admin)
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Exam results
 */
router.get(
  "/exams",
  authenticate,
  authorize("reports.read"),
  reportController.getExamResults,
);

/**
 * @swagger
 * /api/v1/reports/revenue:
 *   get:
 *     tags: [Reports]
 *     summary: Revenue report (admin)
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Revenue data
 */
router.get(
  "/revenue",
  authenticate,
  authorize("reports.read"),
  reportController.getRevenueReport,
);

/**
 * @swagger
 * /api/v1/reports/instructors:
 *   get:
 *     tags: [Reports]
 *     summary: Instructor activity report (admin)
 *     responses:
 *       200:
 *         description: Instructor activity data
 */
router.get(
  "/instructors",
  authenticate,
  authorize("reports.read"),
  reportController.getInstructorActivity,
);

export { router as reportRoutes };
