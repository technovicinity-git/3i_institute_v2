export type ExamType = "practice" | "final";

export interface ExamQuestion {
  questionId: string;
  marks?: number;
}

export interface Exam {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  type: ExamType;
  duration: number;
  passMark: number;
  totalMarks: number;
  maxAttempts: number;
  cooldownHours: number;
  openDate: string | null;
  closeDate: string | null;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  revealAnswers: string;
  questions: ExamQuestion[];
  createdAt: string;
}

export interface CreateExamInput {
  courseId: string;
  title: string;
  type: ExamType;
  duration: number;
  passMark: number;
  totalMarks: number;
  maxAttempts?: number;
  cooldownHours?: number;
  openDate?: string;
  closeDate?: string;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  revealAnswers?: string;
  questions: ExamQuestion[];
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  learnerProfileId: string;
  learnerName: string;
  attemptNumber: number;
  answers: Record<string, string | string[]>;
  score: number | null;
  totalMarks: number;
  passed: boolean | null;
  graded: boolean;
  gradedBy: string | null;
  startedAt: string;
  submittedAt: string | null;
}

export interface GradeAnswerInput {
  questionId: string;
  marksAwarded: number;
}
