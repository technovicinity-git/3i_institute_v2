// Every notification type the platform can send, with its category and the
// default channels. Rules are documented in docs/notification-rules.md.
//
// `push` and `email` are the channel defaults used by the delivery worker
// (phases 2–3). Phase 1 delivers in-app only; every notification is in-app.
//
// `email: true` means "the delivery worker emails this notification". Leave
// it false for events whose email is sent directly by `emailService`
// (modules/email): auth, account security, instructor application
// decisions, course decisions (approved, rejected, suspended by an
// admin), new, rescheduled or cancelled class sessions and new or
// rescheduled exams in courses with live classes (to account holders, via
// account-emails.ts).
// Flagging them here too would send the user two emails.

export type NotificationCategory =
  | "schedule" // sessions, reminders, batches
  | "learning" // exams, assignments, materials
  | "enrolment"
  | "certificate"
  | "chat"
  | "billing"
  | "account"
  | "course" // instructor course lifecycle + activity
  | "admin"
  | "announcement"; // custom notifications from admins and instructors

export type NotificationPriority = "low" | "normal" | "high";

interface NotificationEventDefinition {
  category: NotificationCategory;
  priority: NotificationPriority;
  push: boolean;
  email: boolean;
  // Mandatory notifications ignore user opt-outs (security, failed payments).
  mandatory?: boolean;
}

const event = (
  category: NotificationCategory,
  options: Partial<Omit<NotificationEventDefinition, "category">> = {},
): NotificationEventDefinition => ({
  category,
  priority: options.priority ?? "normal",
  push: options.push ?? false,
  email: options.email ?? false,
  ...(options.mandatory ? { mandatory: true } : {}),
});

export const NOTIFICATION_EVENTS = {
  // ── Learner profile ──────────────────────────
  // session.scheduled/rescheduled/cancelled are emailed directly (see note
  // at the top).
  "session.scheduled": event("schedule", { push: true }),
  "session.rescheduled": event("schedule", { push: true, priority: "high" }),
  "session.link_updated": event("schedule", { push: true }),
  "session.updated": event("schedule"),
  "session.cancelled": event("schedule", { push: true, priority: "high" }),
  "batch.closed": event("schedule", { push: true }),
  // exam.published/rescheduled are emailed directly for ONLINE_CLASS/MIXED
  // courses (see note at the top).
  "exam.published": event("learning", { push: true }),
  "exam.rescheduled": event("learning", { push: true, priority: "high" }),
  "exam.graded": event("learning", { push: true }),
  "assignment.published": event("learning", { push: true }),
  "assignment.graded": event("learning", { push: true }),
  "material.published": event("learning", { priority: "low" }),
  "enrolment.confirmed": event("enrolment", { email: true }),
  "enrolment.waitlisted": event("enrolment"),
  "enrolment.waitlist_promoted": event("enrolment", {
    push: true,
    email: true,
    priority: "high",
  }),
  "certificate.issued": event("certificate", { push: true, email: true }),

  // ── Account holder ───────────────────────────
  "billing.payment_succeeded": event("billing", { email: true }),
  "billing.payment_failed": event("billing", {
    push: true,
    email: true,
    priority: "high",
    mandatory: true,
  }),
  "billing.subscription_cancelled": event("billing", { email: true }),
  "subscription.approved": event("billing", { push: true, email: true }),
  "subscription.rejected": event("billing", { push: true, email: true }),
  "subscription.expired": event("billing", {
    push: true,
    email: true,
    priority: "high",
  }),
  "waiver.approved": event("billing", { push: true, email: true }),
  "waiver.rejected": event("billing", { push: true, email: true }),
  "waiver.revoked": event("billing", { push: true, email: true }),

  // ── Instructor ───────────────────────────────
  // Emailed directly by instructor/service.ts (see note at the top).
  "instructor.application_approved": event("account"),
  "instructor.application_rejected": event("account"),
  // course.approved/rejected/suspended are emailed directly by
  // course/service.ts and admin/service.ts (see note at the top).
  "course.approved": event("course", { push: true }),
  "course.rejected": event("course", { push: true, priority: "high" }),
  "course.suspended": event("course", { push: true, priority: "high" }),
  "course.new_enrolment": event("course", { priority: "low" }),
  "batch.full": event("course"),
  "exam.needs_grading": event("course", { push: true }),
  "assignment.submitted": event("course", { priority: "low" }),
  "course.rated": event("course", { priority: "low" }),

  // ── Admin ────────────────────────────────────
  "admin.instructor_application": event("admin", { email: true }),
  "admin.course_review_requested": event("admin", { email: true }),
  "admin.waiver_requested": event("admin", { email: true }),
  "admin.subscription_requested": event("admin", { email: true }),
  "admin.chat_reported": event("admin", {
    push: true,
    email: true,
    priority: "high",
  }),
  "admin.payment_failed": event("admin"),

  // ── Custom (sent from the admin / instructor panels) ──
  "announcement.admin": event("announcement", { push: true }),
  "announcement.instructor": event("announcement", { push: true }),
} as const satisfies Record<string, NotificationEventDefinition>;

export type NotificationType = keyof typeof NOTIFICATION_EVENTS;

export function getNotificationEvent(
  type: NotificationType,
): NotificationEventDefinition {
  return NOTIFICATION_EVENTS[type];
}
