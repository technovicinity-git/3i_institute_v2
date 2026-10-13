import {
  bold,
  button,
  callout,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface CourseRejectedData {
  firstName: string;
  courseTitle: string;
  reason?: string | null;
  manageUrl: string;
}

export const courseRejected: EmailTemplate<CourseRejectedData> = ({
  firstName,
  courseTitle,
  reason,
  manageUrl,
}) => ({
  subject: `Your course "${courseTitle}" needs changes`,
  ...renderLayout({
    preheader: `"${courseTitle}" wasn't approved yet. Here's what to update.`,
    blocks: [
      heading("Your course needs a few changes"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "Thank you for submitting ",
        bold(courseTitle),
        ". Our team has reviewed it, and it needs some changes before it can be published.",
      ),
      ...(reason?.trim() ? [callout("Reviewer's feedback", reason.trim())] : []),
      paragraph(
        "Please update your course and submit it for review again. We'll take another look as soon as it's back with us.",
      ),
      button("Update course", manageUrl),
      paragraph("If anything is unclear, just reply to this email."),
      signOff(),
    ],
  }),
});
