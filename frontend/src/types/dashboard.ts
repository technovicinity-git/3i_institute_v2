export interface DashboardStats {
  coursesInProgress: number;
  hoursLearned: number;
  certificatesEarned: number;
  currentStreak: number;
  coursesInProgressDelta: number;
  hoursLearnedDelta: number;
  certificatesPending: number;
  streakRecord: number;
}

export interface ContinueLearningCourse {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  moduleInfo: string;
  progress: number;
}

export interface LiveClass {
  id: string;
  sessionId: string;
  date: string;
  month: string;
  title: string;
  instructor: string;
  time: string;
  meetingLink: string;
}

export interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  urgent: boolean;
  daysRemaining: number;
}

export interface RecentNote {
  id: string;
  subject: string;
  timeAgo: string;
  text: string;
}

export interface RecommendedCourse {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  instructor: string;
  level: string;
  rating: number;
}

export interface WeeklyProgress {
  week: number;
  hours: number;
}

export interface DashboardData {
  stats: DashboardStats;
  continueLearning: ContinueLearningCourse[];
  liveClasses: LiveClass[];
  deadlines: Deadline[];
  notes: RecentNote[];
  recommended: RecommendedCourse[];
  weeklyProgress: WeeklyProgress[];
}
