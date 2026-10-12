export interface DashboardStats {
  coursesInProgress: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  lessonsThisWeek: number;
  certificatesEarned: number;
  currentStreak: number;
  longestStreak: number;
  studiedToday: boolean;
}

export interface ContinueLearningCourse {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  type: "REGULAR" | "ONLINE_CLASS" | string;
  batchId: string | null;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  lastActivityAt: string;
}

export interface LiveClass {
  id: string;
  batchId: string;
  title: string;
  courseTitle: string;
  instructor: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string | null;
}

export interface Deadline {
  id: string;
  kind: "EXAM" | "ASSIGNMENT";
  title: string;
  courseId: string;
  courseTitle: string;
  dueDate: string;
  daysRemaining: number;
}

export interface RecentResult {
  id: string;
  kind: "EXAM" | "ASSIGNMENT";
  title: string;
  courseId: string;
  courseTitle: string;
  examId: string | null;
  status: "PASSED" | "FAILED" | "GRADED" | "AWAITING_GRADE";
  score: number | null;
  totalMarks: number;
  submittedAt: string;
}

export interface RecentNote {
  id: string;
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  text: string;
  createdAt: string;
}

export interface WeeklyActivity {
  /** Monday of the week, YYYY-MM-DD in the learner's local time. */
  weekStart: string;
  lessonsCompleted: number;
}

export interface RecommendedCourse {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  instructor: string;
  level: string;
  type: string;
  rating: number | null;
  ratingCount: number;
}

export interface DashboardData {
  learner: { displayName: string };
  stats: DashboardStats;
  continueLearning: ContinueLearningCourse[];
  liveClasses: LiveClass[];
  deadlines: Deadline[];
  recentResults: RecentResult[];
  notes: RecentNote[];
  weeklyActivity: WeeklyActivity[];
  recommended: RecommendedCourse[];
}
