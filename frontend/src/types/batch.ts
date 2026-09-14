export type BatchStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Session {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string | null;
  notes: string | null;
}

export interface Batch {
  id: string;
  courseId: string;
  courseTitle?: string;
  course?: {
    id: string;
    title: string;
    type: string;
    minimumAge: number;
  };
  name: string;
  capacity: number;
  status: BatchStatus;
  sessions: Session[];
  enrolmentCount: number;
  createdAt: string;
}

export interface CreateBatchInput {
  courseId: string;
  name: string;
  capacity: number;
  sessions: Array<{
    title: string;
    scheduledAt: string;
    durationMinutes: number;
    meetingLink?: string;
    notes?: string;
  }>;
}

export interface AddSessionInput {
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  notes?: string;
}

export interface InstructorSession {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string | null;
  notes: string | null;
  batchId: string;
  batchName: string;
  courseId: string;
  courseTitle: string;
  enrolmentCount: number;
}

export interface InstructorBatch {
  id: string;
  name: string;
  courseId: string;
  courseTitle: string;
  capacity: number;
  status: string;
  enrolmentCount: number;
  sessionCount: number;
  nextSessionAt: string | null;
}
