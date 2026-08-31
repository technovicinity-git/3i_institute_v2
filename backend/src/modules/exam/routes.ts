import { Router } from "express";
import { examController } from "#/modules/exam/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import {
  createQuestionSchema,
  createExamSchema,
  submitExamSchema,
} from "#/modules/exam/schema";

const router: Router = Router();

// ──────────────────────────────────────
// Question routes
// ──────────────────────────────────────

/**
 * @swagger
 * /api/v1/exams/questions:
 *   get:
 *     tags: [Questions]
 *     summary: Get my questions (instructor)
 *     responses:
 *       200:
 *         description: List of questions
 *   post:
 *     tags: [Questions]
 *     summary: Create a question
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, question]
 *             properties:
 *               type: { type: string, enum: [mcq, multi_select, true_false, short_answer, essay] }
 *               question: { type: string }
 *               options: { type: array, items: { type: string } }
 *               correctAnswer: { type: string }
 *               marks: { type: integer }
 *               difficulty: { type: string, enum: [easy, medium, hard] }
 *               courseId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Question created
 */
router.get("/questions", authenticate, examController.getMyQuestions);
router.post(
  "/questions",
  authenticate,
  authorize("questions.create"),
  validate(createQuestionSchema),
  examController.createQuestion,
);

router.get(
  "/questions/admin",
  authenticate,
  authorize("questions.read_all"),
  examController.getAdminQuestions,
);

router.get(
  "/attempts/:examId",
  authenticate,
  authorize("exams.grade"),
  examController.getExamAttempts,
);
router.get(
  "/attempts-details/:attemptId",
  authenticate,
  authorize("exams.grade"),
  examController.getAttemptDetails,
);

/**
 * @swagger
 * /api/v1/exams/questions/{id}:
 *   get:
 *     tags: [Questions]
 *     summary: Get question by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Question details
 *       404:
 *         description: Not found
 *   delete:
 *     tags: [Questions]
 *     summary: Delete a question
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Question deleted
 */
router.get("/questions/:id", authenticate, examController.getQuestionById);
router.delete(
  "/questions/:id",
  authenticate,
  authorize("questions.delete"),
  examController.deleteQuestion,
);

// ──────────────────────────────────────
// Exam routes
// ──────────────────────────────────────

/**
 * @swagger
 * /api/v1/exams:
 *   post:
 *     tags: [Exams]
 *     summary: Create an exam
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, title, type, duration, passMark, totalMarks, questions]
 *             properties:
 *               courseId: { type: string, format: uuid }
 *               title: { type: string }
 *               type: { type: string, enum: [practice, final] }
 *               duration: { type: integer }
 *               passMark: { type: integer }
 *               totalMarks: { type: integer }
 *               maxAttempts: { type: integer, default: 3 }
 *               cooldownHours: { type: integer, default: 24 }
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId: { type: string, format: uuid }
 *                     marks: { type: integer }
 *     responses:
 *       201:
 *         description: Exam created
 */
router.post(
  "/",
  authenticate,
  authorize("exams.create"),
  validate(createExamSchema),
  examController.createExam,
);

/**
 * @swagger
 * /api/v1/exams/course/{courseId}:
 *   get:
 *     tags: [Exams]
 *     summary: Get exams for a course
 *     security: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of exams
 */
router.get("/course/:courseId", examController.getCourseExams);

/**
 * @swagger
 * /api/v1/exams/submit:
 *   post:
 *     tags: [Exams]
 *     summary: Submit an exam attempt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [examId, learnerProfileId, answers]
 *             properties:
 *               examId: { type: string, format: uuid }
 *               learnerProfileId: { type: string, format: uuid }
 *               answers: { type: object }
 *     responses:
 *       201:
 *         description: Exam submitted
 */
router.post(
  "/submit",
  authenticate,
  authorize("exams.attempt"),
  validate(submitExamSchema),
  examController.submitExam,
);

/**
 * @swagger
 * /api/v1/exams/grade/{attemptId}:
 *   post:
 *     tags: [Exams]
 *     summary: Grade written answer (instructor)
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [questionId, marksAwarded]
 *             properties:
 *               questionId: { type: string, format: uuid }
 *               marksAwarded: { type: integer }
 *     responses:
 *       200:
 *         description: Answer graded
 */
router.post(
  "/grade/:attemptId",
  authenticate,
  authorize("exams.grade"),
  examController.gradeWrittenAnswer,
);

export { router as examRoutes };
