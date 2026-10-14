export interface AdminDashboardKpis {
  accounts: { total: number; last30Days: number; previous30Days: number };
  learnerProfiles: number;
  activeInstructors: number;
  courses: { published: number; total: number };
  subscriptions: {
    active: number;
    activeSeats: number;
    estimatedMonthlyRevenue: number;
  };
  enrolments: { total: number; last30Days: number; previous30Days: number };
  certificates: { total: number; last30Days: number };
}

export interface AdminDashboardAttention {
  pendingInstructorApplications: number;
  pendingCourses: number;
  pendingWaivers: number;
  openChatReports: number;
  pastDueSubscriptions: number;
  overdueGrading: number;
}

export interface AdminDashboardTrend {
  weekStart: string;
  signups: number;
  enrolments: number;
}

export interface AdminDashboardTopCourse {
  id: string;
  title: string;
  type: string;
  instructor: string;
  enrolmentsLast30Days: number;
  totalEnrolments: number;
  averageRating: number | null;
}

export interface AdminDashboardAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AdminDashboardSession {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  hasMeetingLink: boolean;
  batchName: string;
  courseId: string;
  courseTitle: string;
  instructor: string;
  enrolled: number;
}

export interface AdminDashboard {
  kpis: AdminDashboardKpis;
  attention: AdminDashboardAttention;
  trends: AdminDashboardTrend[];
  topCourses: AdminDashboardTopCourse[];
  recentAccounts: AdminDashboardAccount[];
  todaysSessions: AdminDashboardSession[];
}
