export interface LearnerExam {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  type: "practice" | "final";
  duration: number;
  passMark: number;
  totalMarks: number;
  maxAttempts: number;
  cooldownHours: number;
  openDate: string | null;
  closeDate: string | null;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  questions: Array<{
    questionId: string;
    marks: number;
  }>;
  attemptCount: number;
  lastAttemptAt: string | null;
  bestScore: number | null;
  passed: boolean | null;
}

export interface ExamQuestion {
  id: string;
  type: "mcq" | "multi_select" | "true_false" | "short_answer" | "essay";
  question: string;
  options: string[] | null;
  correctAnswer: string | string[] | null;
  marks: number;
  difficulty: string;
}

export interface ExamAttemptResult {
  id: string;
  examId: string;
  examTitle: string;
  learnerProfileId: string;
  attemptNumber: number;
  score: number | null;
  totalMarks: number;
  passed: boolean | null;
  graded: boolean;
  startedAt: string;
  submittedAt: string | null;
}
