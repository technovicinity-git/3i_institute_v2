import { Router } from "express";
import { assignmentController } from "#/modules/assignment/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";

const router: Router = Router();

/**
 * @swagger
 * /api/v1/instructors/assignments:
 *   get:
 *     tags: [Assignments]
 *     summary: Get instructor's assignments
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Assignments list
 *   post:
 *     tags: [Assignments]
 *     summary: Create assignment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, title, description, totalMarks]
 *             properties:
 *               courseId: { type: string, format: uuid }
 *               title: { type: string }
 *               description: { type: string }
 *               dueDate: { type: string, format: date }
 *               totalMarks: { type: integer }
 *     responses:
 *       201:
 *         description: Assignment created
 */
router.get(
  "/",
  authenticate,
  authorize("enrolment.manage"),
  assignmentController.getAssignments,
);
router.post(
  "/",
  authenticate,
  authorize("enrolment.manage"),
  assignmentController.create,
);

/**
 * @swagger
 * /api/v1/instructors/assignments/{assignmentId}/submissions:
 *   get:
 *     tags: [Assignments]
 *     summary: Get submissions for an assignment
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Submissions list
 */
router.get(
  "/:assignmentId/submissions",
  authenticate,
  authorize("enrolment.manage"),
  assignmentController.getSubmissions,
);

/**
 * @swagger
 * /api/v1/instructors/assignments/submissions/{submissionId}/grade:
 *   post:
 *     tags: [Assignments]
 *     summary: Grade a submission
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [marksAwarded]
 *             properties:
 *               marksAwarded: { type: number }
 *               feedback: { type: string }
 *     responses:
 *       200:
 *         description: Submission graded
 */
router.post(
  "/submissions/:submissionId/grade",
  authenticate,
  authorize("enrolment.manage"),
  assignmentController.gradeSubmission,
);

/**
 * @swagger
 * /api/v1/assignments/course/{courseId}:
 *   get:
 *     tags: [Assignments]
 *     summary: Get course assignments for learner
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: learnerProfileId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Assignments list
 */
router.get(
  "/course/:courseId",
  authenticate,
  assignmentController.getCourseAssignmentsForLearner,
);

/**
 * @swagger
 * /api/v1/assignments/submit:
 *   post:
 *     tags: [Assignments]
 *     summary: Submit assignment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignmentId, learnerProfileId, content]
 *             properties:
 *               assignmentId: { type: string, format: uuid }
 *               learnerProfileId: { type: string, format: uuid }
 *               content: { type: string }
 *               fileUrl: { type: string }
 *     responses:
 *       201:
 *         description: Assignment submitted
 */
router.post("/submit", authenticate, assignmentController.submitAssignment);

export { router as instructorAssignmentRoutes };
