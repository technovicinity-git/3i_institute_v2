import { customEmail } from "#/modules/email/templates/admin/custom-email";
import { waiverApproved } from "#/modules/email/templates/billing/waiver-approved";
import { waiverRejected } from "#/modules/email/templates/billing/waiver-rejected";
import { waiverRevoked } from "#/modules/email/templates/billing/waiver-revoked";
import { passwordChanged } from "#/modules/email/templates/auth/password-changed";
import { passwordReset } from "#/modules/email/templates/auth/password-reset";
import { verifyEmail } from "#/modules/email/templates/auth/verify-email";
import { welcome } from "#/modules/email/templates/auth/welcome";
import { accountDeactivated } from "#/modules/email/templates/account/account-deactivated";
import { accountLocked } from "#/modules/email/templates/account/account-locked";
import { accountReactivated } from "#/modules/email/templates/account/account-reactivated";
import { emailChanged } from "#/modules/email/templates/account/email-changed";
import { guardianNotice } from "#/modules/email/templates/account/guardian-notice";
import { verifyNewEmail } from "#/modules/email/templates/account/verify-new-email";
import { applicationApproved } from "#/modules/email/templates/instructor/application-approved";
import { applicationReceived } from "#/modules/email/templates/instructor/application-received";
import { applicationRejected } from "#/modules/email/templates/instructor/application-rejected";
import { courseApproved } from "#/modules/email/templates/instructor/course-approved";
import { courseRejected } from "#/modules/email/templates/instructor/course-rejected";
import { courseSuspended } from "#/modules/email/templates/instructor/course-suspended";
import { instructorReinstated } from "#/modules/email/templates/instructor/instructor-reinstated";
import { instructorSuspended } from "#/modules/email/templates/instructor/instructor-suspended";
import { examRescheduled } from "#/modules/email/templates/learner/exam-rescheduled";
import { examPublished } from "#/modules/email/templates/learner/exam-published";
import { sessionCancelled } from "#/modules/email/templates/learner/session-cancelled";
import { sessionRescheduled } from "#/modules/email/templates/learner/session-rescheduled";
import { sessionScheduled } from "#/modules/email/templates/learner/session-scheduled";
import type { EmailTemplate } from "#/modules/email/templates/types";

// Every email the platform sends. To add one: create the template file,
// register it here, then call `emailService.send({ template: "<name>", … })`.
// The `data` argument is type-checked against the template.
export const emailTemplates = {
  // Auth
  "auth.verify-email": verifyEmail,
  "auth.welcome": welcome,
  "auth.password-reset": passwordReset,
  "auth.password-changed": passwordChanged,

  // Account & security
  "account.verify-new-email": verifyNewEmail,
  "account.email-changed": emailChanged,
  "account.locked": accountLocked,
  "account.deactivated": accountDeactivated,
  "account.reactivated": accountReactivated,
  "account.guardian-notice": guardianNotice,

  // Instructor
  "instructor.application-received": applicationReceived,
  "instructor.application-approved": applicationApproved,
  "instructor.application-rejected": applicationRejected,
  "instructor.course-approved": courseApproved,
  "instructor.course-rejected": courseRejected,
  "instructor.course-suspended": courseSuspended,
  "instructor.suspended": instructorSuspended,
  "instructor.reinstated": instructorReinstated,

  // Learner (sent to the account holder)
  "learner.session-scheduled": sessionScheduled,
  "learner.session-rescheduled": sessionRescheduled,
  "learner.session-cancelled": sessionCancelled,
  "learner.exam-published": examPublished,
  "learner.exam-rescheduled": examRescheduled,

  // Billing (sent to the account holder)
  "billing.waiver-approved": waiverApproved,
  "billing.waiver-rejected": waiverRejected,
  "billing.waiver-revoked": waiverRevoked,

  // Admin (written by an admin on the Send Email page)
  "admin.custom-email": customEmail,
} as const satisfies Record<string, EmailTemplate<never>>;

export type EmailTemplateName = keyof typeof emailTemplates;

export type EmailTemplateData<TName extends EmailTemplateName> = Parameters<
  (typeof emailTemplates)[TName]
>[0];
