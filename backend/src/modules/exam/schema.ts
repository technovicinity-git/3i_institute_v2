import { z } from "zod";

export const createQuestionSchema = z.object({
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
  courseId: z.string().uuid().optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;

export const createExamSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  title: z.string().min(1, "Title is required").max(255),
  type: z.enum(["practice", "final"]),
  duration: z.number().int().min(5).max(480),
  passMark: z.number().int().min(1).max(100),
  totalMarks: z.number().int().min(1),
  maxAttempts: z.number().int().min(1).max(10).default(3),
  cooldownHours: z.number().int().min(0).default(24),
  openDate: z.string().optional(),
  closeDate: z.string().optional(),
  randomizeQuestions: z.boolean().default(false),
  randomizeOptions: z.boolean().default(false),
  revealAnswers: z
    .enum(["after_pass", "after_all_attempts", "never"])
    .default("after_pass"),
  questions: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        marks: z.number().int().min(1).optional(),
      }),
    )
    .min(1, "At least one question is required"),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;

export const submitExamSchema = z.object({
  examId: z.string().uuid(),
  learnerProfileId: z.string().uuid(),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export type SubmitExamInput = z.infer<typeof submitExamSchema>;
