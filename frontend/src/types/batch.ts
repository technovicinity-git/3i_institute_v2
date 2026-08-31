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
  courseTitle: string;
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
