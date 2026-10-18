// Admin and security actions shown in the admin Activity Log. Only actions
// listed here are ever returned: the AuditLog table also stores app data
// (lesson notes, chat reports, device swaps, applications) that must not
// appear in the log.

export type ActivityCategory =
  | "accounts"
  | "instructors"
  | "courses"
  | "billing"
  | "moderation"
  | "content";

export const ACTIVITY_CATEGORY_LABEL: Record<ActivityCategory, string> = {
  accounts: "Accounts",
  instructors: "Instructors",
  courses: "Courses",
  billing: "Subscriptions & waivers",
  moderation: "Moderation",
  content: "Site content",
};

interface ActivityAction {
  label: string;
  category: ActivityCategory;
  /** Shown in red/orange in the UI. */
  tone?: "danger" | "warning" | "success";
}

const action = (
  label: string,
  category: ActivityCategory,
  tone?: ActivityAction["tone"],
): ActivityAction => ({ label, category, ...(tone && { tone }) });

export const ACTIVITY_ACTIONS = {
  // Accounts
  USER_DEACTIVATED: action("Deactivated user", "accounts", "warning"),
  USER_REACTIVATED: action("Reactivated user", "accounts", "success"),
  USER_DELETED: action("Deleted user", "accounts", "danger"),
  LEARNER_PROFILE_ARCHIVED: action("Archived learner profile", "accounts", "warning"),
  LEARNER_PROFILE_RESTORED: action("Restored learner profile", "accounts", "success"),

  // Instructors
  INSTRUCTOR_APPROVED: action("Approved instructor application", "instructors", "success"),
  INSTRUCTOR_REJECTED: action("Rejected instructor application", "instructors", "danger"),
  INSTRUCTOR_SUSPENDED: action("Suspended instructor", "instructors", "warning"),
  INSTRUCTOR_REINSTATED: action("Reinstated instructor", "instructors", "success"),

  // Courses
  COURSE_APPROVED: action("Approved course", "courses", "success"),
  COURSE_REJECTED: action("Rejected course", "courses", "danger"),
  COURSE_SUSPENDED: action("Suspended course", "courses", "warning"),
  COURSE_REACTIVATED: action("Reactivated course", "courses", "success"),
  CERTIFICATE_REVOKED: action("Revoked certificate", "courses", "danger"),
  CATEGORY_CREATED: action("Created category", "courses"),
  CATEGORY_UPDATED: action("Updated category", "courses"),
  CATEGORY_DELETED: action("Deleted category", "courses", "danger"),

  // Subscriptions & waivers
  SUBSCRIPTION_REQUEST_APPROVED: action("Approved subscription payment", "billing", "success"),
  SUBSCRIPTION_REQUEST_REJECTED: action("Rejected subscription payment", "billing", "danger"),
  WAIVER_APPROVED: action("Approved fee waiver", "billing", "success"),
  WAIVER_REJECTED: action("Rejected fee waiver", "billing", "danger"),
  WAIVER_REVOKED: action("Revoked fee waiver", "billing", "warning"),
  PAYMENT_SETTINGS_UPDATED: action("Updated payment details", "billing"),

  // Moderation
  CHAT_MODERATION: action("Moderated chat message", "moderation"),
  RATING_HIDDEN: action("Hid course review", "moderation", "warning"),

  // Site content
  SITE_PAGE_SAVED: action("Saved site page", "content"),
  SITE_PAGE_UNPUBLISHED: action("Unpublished site page", "content", "warning"),
  SITE_PAGE_DELETED: action("Deleted site page", "content", "danger"),
  SITE_SETTINGS_UPDATED: action("Updated site settings", "content"),
} as const satisfies Record<string, ActivityAction>;

export type ActivityActionName = keyof typeof ACTIVITY_ACTIONS;

export const ACTIVITY_ACTION_NAMES = Object.keys(
  ACTIVITY_ACTIONS,
) as ActivityActionName[];

export function isActivityAction(name: string): name is ActivityActionName {
  return name in ACTIVITY_ACTIONS;
}

export function actionsInCategory(category: string): ActivityActionName[] {
  return ACTIVITY_ACTION_NAMES.filter(
    (name) => ACTIVITY_ACTIONS[name].category === category,
  );
}
