import { Router } from "express";
import { examController } from "#/modules/exam/controller";
import { authenticate } from "#/middleware/authenticate";
import { authorize } from "#/middleware/authorize";
import { validate } from "#/middleware/validate";
import {
  createQuestionSchema,
  createExamSchema,
  startExamSchema,
  submitExamSchema,
} from "#/modules/exam/schema";
import multer from "multer";

const router: Router = Router();

const uploadCsv = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
});

// ──────────────────────────────────────
// Question routes
// ──────────────────────────────────────

/**
 * @swagger
 * /api/v1/exams/questions:
 *   get:
 *     tags: [Questions]
 *     summary: Get my questions (instructor)
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: false
 *         schema: { type: string, format: uuid }
 *         description: Limit to one course. Omit to get questions from all of the instructor's courses.
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

/**
 * @swagger
 * /api/v1/exams/questions/bulk-import:
 *   post:
 *     tags: [Questions]
 *     summary: Bulk import questions from CSV
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: courseId
 *         type: string
 *         required: true
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *     responses:
 *       200:
 *         description: Import result with per-row errors
 */
router.post(
  "/questions/bulk-import",
  authenticate,
  authorize("questions.create"),
  uploadCsv.fields([{ name: "file", maxCount: 1 }]),
  examController.bulkImportQuestions,
);

router.get(
  "/questions/admin",
  authenticate,
  authorize("questions.read_all"),
  examController.getAdminQuestions,
);

router.get(
  "/pending-attempts",
  authenticate,
  authorize("exams.grade"),
  examController.getPendingAttempts,
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
 * /api/v1/exams/{id}:
 *   patch:
 *     tags: [Exams]
 *     summary: Update an exam and its course-specific settings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
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
 *               maxAttempts: { type: integer }
 *               cooldownHours: { type: integer }
 *               openDate: { type: string, format: date-time }
 *               randomizeQuestions: { type: boolean }
 *               randomizeOptions: { type: boolean }
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [questionId]
 *                   properties:
 *                     questionId: { type: string, format: uuid }
 *                     marks: { type: integer }
 *     responses:
 *       200:
 *         description: Exam updated
 */
router.patch(
  "/:id",
  authenticate,
  authorize("exams.create"),
  validate(createExamSchema),
  examController.updateExam,
);

router.patch(
  "/questions/:id",
  authenticate,
  authorize("questions.update"),
  examController.updateQuestion,
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
 *     description: >
 *       Submits the attempt started with POST /exams/{examId}/start. Accepted
 *       until the session deadline plus a 2-minute grace period (server time).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, answers]
 *             properties:
 *               sessionId: { type: string, format: uuid }
 *               answers: { type: object }
 *     responses:
 *       201:
 *         description: Exam submitted
 *       409:
 *         description: This attempt has already been submitted
 *       422:
 *         description: Time is up for this attempt
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
 *     summary: Grade written answers (instructor)
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
 *             required: [grades]
 *             properties:
 *               grades:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [questionId, marksAwarded]
 *                   properties:
 *                     questionId: { type: string, format: uuid }
 *                     marksAwarded: { type: number, minimum: 0 }
 *     responses:
 *       200:
 *         description: Answers saved and attempt score recalculated
 */
router.post(
  "/grade/:attemptId",
  authenticate,
  authorize("exams.grade"),
  examController.gradeWrittenAnswer,
);

/**
 * @swagger
 * /api/v1/exams/{examId}/intro:
 *   get:
 *     tags: [Exams]
 *     summary: Exam details for the learner's start screen
 *     description: Exam settings and the number of questions. No question content.
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Exam details and questionCount
 */
router.get(
  "/:examId/intro",
  authenticate,
  authorize("exams.attempt"),
  examController.getExamIntro,
);

/**
 * @swagger
 * /api/v1/exams/{examId}/start:
 *   post:
 *     tags: [Exams]
 *     summary: Start (or resume) an exam attempt
 *     description: >
 *       Checks the opening rules, attempt limit and cooldown against the
 *       server clock, then records the start time and question set. Calling it
 *       again while the attempt is running returns the same session.
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [learnerProfileId]
 *             properties:
 *               learnerProfileId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: >
 *           sessionId, startedAt, deadline, serverNow, exam and the questions
 *           (without answers)
 */
router.post(
  "/:examId/start",
  authenticate,
  authorize("exams.attempt"),
  validate(startExamSchema),
  examController.startExam,
);

router.get(
  "/attempts",
  authenticate,
  authorize("exams.attempt"),
  examController.getMyAttempts,
);

router.get(
  "/result",
  authenticate,
  authorize("exams.attempt"),
  examController.getExamResult,
);

export { router as examRoutes };
