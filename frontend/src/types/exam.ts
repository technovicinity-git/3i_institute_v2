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
