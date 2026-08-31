export type QuestionType =
  | "mcq"
  | "multi_select"
  | "true_false"
  | "short_answer"
  | "essay";
export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  scope: string;
  type: QuestionType;
  question: string;
  options: string[] | null;
  correctAnswer: string | string[] | null;
  suggestedAnswer: string | null;
  marks: number;
  negativeMarks: number;
  partialCredit: boolean;
  difficulty: Difficulty;
  explanation: string | null;
  courseId: string | null;
  createdAt: string;
}

export interface CreateQuestionInput {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  suggestedAnswer?: string;
  marks: number;
  negativeMarks?: number;
  partialCredit?: boolean;
  difficulty: Difficulty;
  explanation?: string;
  courseId?: string;
}
