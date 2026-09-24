export type CourseType = "REGULAR" | "ONLINE_CLASS";
export type CourseStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "SUSPENDED"
  | "ARCHIVED";

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";
export type CourseFormat = "self-paced" | "live" | "hybrid";
export type SortOption = "popularity" | "newest" | "rating" | "title";

export interface Course {
  id: string;
  title: string;
  summary: string;
  thumbnailUrl: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  type: "REGULAR" | "ONLINE_CLASS";
  level: string;
  language: string;
  minimumAge: number;
  instructor: {
    id: string;
    name: string;
  };
  enrolmentCount: number;
  averageRating: number | null;
  ratingCount: number;
  format: "self-paced" | "live" | "hybrid";
  enrolled: boolean;
  wishlisted: boolean;
}

export interface CourseListResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CourseFilters {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  level?: string;
  format?: string;
  sortBy?: SortOption;
  minRating?: number;
  learnerProfileId?: string;
  language?: string;
  ageBand?: string;
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
