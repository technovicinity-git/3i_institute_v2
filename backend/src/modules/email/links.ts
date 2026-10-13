import { env } from "#/config/env";

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
  verifyEmail: (token: string) => url("/verify-email", { token }),
  resetPassword: (token: string) => url("/reset-password", { token }),
  forgotPassword: () => url("/forgot-password"),
  login: () => url("/login"),
  courses: () => url("/courses"),
  contact: () => url("/contact"),
  instructorLogin: () => url("/instructor/login"),
  instructorDashboard: () => url("/instructor/dashboard"),
};
