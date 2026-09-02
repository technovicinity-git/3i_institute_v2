export type AssignmentStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  dueDate: string | null;
  totalMarks: number;
  status: AssignmentStatus;
  submissionCount: number;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  learnerName: string;
  submittedAt: string;
  content: string;
  fileUrl: string | null;
  marksAwarded: number | null;
  feedback: string | null;
  graded: boolean;
}

export interface CreateAssignmentInput {
  courseId: string;
  title: string;
  description: string;
  dueDate?: string;
  totalMarks: number;
}
