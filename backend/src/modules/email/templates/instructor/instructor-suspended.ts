import {
  button,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface InstructorSuspendedData {
  firstName: string;
  suspendedCourseCount: number;
  contactUrl: string;
}

export const instructorSuspended: EmailTemplate<InstructorSuspendedData> = ({
  firstName,
  suspendedCourseCount,
  contactUrl,
}) => ({
  subject: "Your instructor account has been suspended",
  ...renderLayout({
    preheader: "You no longer have access to the instructor dashboard.",
    blocks: [
      heading("Your instructor account has been suspended"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "An administrator has suspended your instructor account on 3i Institute. You no longer have access to the instructor dashboard.",
      ),
      paragraph(
        suspendedCourseCount > 0
          ? `Your ${suspendedCourseCount === 1 ? "course has" : `${suspendedCourseCount} courses have`} also been suspended: ${suspendedCourseCount === 1 ? "it's" : "they're"} hidden from the catalogue and new learners can't enrol.`
          : "None of your courses were live, so learners aren't affected.",
      ),
      paragraph(
        "If you'd like to know why, or what's needed to restore your account, please get in touch with us.",
      ),
      button("Contact us", contactUrl),
      signOff(),
    ],
  }),
});
