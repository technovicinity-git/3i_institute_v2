import {
  bold,
  button,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface CourseApprovedData {
  firstName: string;
  courseTitle: string;
  courseUrl: string;
  manageUrl: string;
}

export const courseApproved: EmailTemplate<CourseApprovedData> = ({
  firstName,
  courseTitle,
  courseUrl,
  manageUrl,
}) => ({
  subject: `Your course "${courseTitle}" is now live`,
  ...renderLayout({
    preheader: `"${courseTitle}" has been approved and published.`,
    blocks: [
      heading("Your course is live!"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "Great news: ",
        bold(courseTitle),
        " has been reviewed and approved. It's now published on 3i Institute, and learners can find and enrol in it.",
      ),
      button("View your course", courseUrl),
      paragraph(
        "You can keep adding lessons, materials and exams, or schedule classes, from your instructor dashboard.",
      ),
      button("Manage course", manageUrl),
      signOff(),
    ],
  }),
});
