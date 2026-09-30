import { z } from "zod";

export const createQuestionSchema = z.object({
  courseId: z.string().uuid("Course is required"),
  type: z.enum(["mcq", "multi_select", "true_false", "short_answer", "essay"]),
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  suggestedAnswer: z.string().optional(),
  marks: z.number().int().min(1).max(100).default(1),
  negativeMarks: z.number().int().min(0).default(0),
  partialCredit: z.boolean().default(false),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  explanation: z.string().optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

export const createExamSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  title: z.string().min(1, "Title is required").max(255),
  type: z.enum(["practice", "final"]),
  duration: z.number().int().min(5).max(480),
  passMark: z.number().int().min(1).max(100),
  totalMarks: z.number().int().min(1),
  // REGULAR course exams have no attempt limit — the UI sends a large number
  // and the service treats exams without a fixed question list as unlimited.
  maxAttempts: z.number().int().min(1).max(999999).default(3),
  cooldownHours: z.number().int().min(0).default(24),
  openDate: z.string().optional(),
  closeDate: z.string().optional(),
  randomizeQuestions: z.boolean().default(false),
  randomizeOptions: z.boolean().default(false),
  revealAnswers: z
    .enum(["after_pass", "after_all_attempts", "never"])
    .default("after_pass"),
  // REGULAR course exams may leave this empty — a random question set is then
  // generated from the course question bank up to `totalMarks` for each
  // learner attempt.
  questions: z.array(
    z.object({
      questionId: z.string().uuid(),
      marks: z.number().int().min(1).optional(),
    }),
  ),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;

export const submitExamSchema = z.object({
  examId: z.string().uuid(),
  learnerProfileId: z.string().uuid(),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  // ISO timestamp captured by the client when the learner started the exam.
  // Used to record submission time and compute how long the learner took.
  startedAt: z.string().optional(),
  // For REGULAR course exams (which generate a random question set per
  // attempt), the client echoes back the exact questions that were shown so
  // grading can use the same set. Marks are always re-derived from the
  // question bank to prevent tampering.
  questionSet: z
    .array(
      z.object({
        questionId: z.string().uuid(),
      }),
    )
    .optional(),
});

export type SubmitExamInput = z.infer<typeof submitExamSchema>;
