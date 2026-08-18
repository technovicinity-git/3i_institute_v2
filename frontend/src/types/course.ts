export type CourseType = "REGULAR" | "ONLINE_CLASS" | "MIXED";
export type CourseStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "SUSPENDED"
  | "ARCHIVED";

export interface Course {
  id: string;
  title: string;
  summary: string;
  description: string;
  thumbnailUrl: string | null;
  category: string;
  type: CourseType;
  level: string;
  language: string;
  minimumAge: number;
  maximumAge: number | null;
  status: CourseStatus;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  materials?: Material[];
  batches?: Batch[];
}

export interface Material {
  id: string;
  title: string;
  type: "video" | "document" | "audio" | "link";
  duration: number | null;
  order: number;
  createdAt: string;
}

export interface Batch {
  id: string;
  name: string;
  capacity: number;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  sessions: Session[];
  createdAt: string;
}

export interface Session {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string | null;
  notes: string | null;
}
