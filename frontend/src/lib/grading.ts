// Submissions waiting longer than this are flagged as overdue so learners
// aren't left waiting on results and certificates.
export const GRADING_OVERDUE_DAYS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysWaiting(submittedAt: string): number {
  return Math.floor((Date.now() - new Date(submittedAt).getTime()) / DAY_MS);
}

export function isGradingOverdue(submittedAt: string): boolean {
  return daysWaiting(submittedAt) >= GRADING_OVERDUE_DAYS;
}

export function waitingLabel(submittedAt: string): string {
  const diffMs = Date.now() - new Date(submittedAt).getTime();
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours < 1) return "Submitted just now";
  if (hours < 24) return `Submitted ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(diffMs / DAY_MS);
  return `Waiting ${days} day${days === 1 ? "" : "s"}`;
}
