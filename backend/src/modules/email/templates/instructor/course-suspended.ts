import {
  bold,
  button,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface CourseSuspendedData {
  firstName: string;
  courseTitle: string;
  contactUrl: string;
}

export const courseSuspended: EmailTemplate<CourseSuspendedData> = ({
  firstName,
  courseTitle,
  contactUrl,
}) => ({
  subject: `Your course "${courseTitle}" has been suspended`,
  ...renderLayout({
    preheader: `"${courseTitle}" is no longer available to learners.`,
    blocks: [
      heading("Your course has been suspended"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "An administrator has suspended ",
        bold(courseTitle),
        ". While it's suspended, the course is hidden from the catalogue and new learners can't enrol.",
      ),
      paragraph(
        "If you'd like to know why, or what's needed to restore it, please get in touch with us.",
      ),
      button("Contact us", contactUrl),
      signOff(),
    ],
  }),
});
