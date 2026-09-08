export interface LearnerAssignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  dueDate: string | null;
  totalMarks: number;
  status: string;
  submitted: boolean;
  submission: {
    id: string;
    content: string;
    fileUrl: string | null;
    marksAwarded: number | null;
    feedback: string | null;
    graded: boolean;
    submittedAt: string;
  } | null;
  createdAt: string;
}

export interface SubmitAssignmentInput {
  assignmentId: string;
  learnerProfileId: string;
  content: string;
  fileUrl?: string;
}
