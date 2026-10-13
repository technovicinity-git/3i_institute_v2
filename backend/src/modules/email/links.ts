import { env } from "#/config/env";
import type { AccountPortal } from "#/modules/auth/portal";

// Every URL that goes into an email, in one place, so links stay in sync
// with the frontend routes.

function url(path: string, query?: Record<string, string>): string {
  const target = new URL(path, env.FRONTEND_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    target.searchParams.set(key, value);
  }
  return target.toString();
}

export const emailLinks = {
  verifyEmail: (token: string, portal: AccountPortal) =>
    url(portal === "instructor" ? "/instructor/verify-email" : "/verify-email", {
      token,
    }),
  resetPassword: (token: string) => url("/reset-password", { token }),
  forgotPassword: () => url("/forgot-password"),
  login: () => url("/login"),
  courses: () => url("/courses"),
  course: (courseId: string) => url(`/courses/${courseId}`),
  instructorCourse: (courseId: string) =>
    url(`/instructor/courses/${courseId}/edit`),
  contact: () => url("/contact"),
  onlineClass: (batchId: string) => url(`/online-classes/${batchId}`),
  instructorLogin: () => url("/instructor/login"),
  instructorDashboard: () => url("/instructor/dashboard"),
};
