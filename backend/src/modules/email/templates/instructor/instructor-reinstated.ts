import {
  button,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface InstructorReinstatedData {
  firstName: string;
  restoredCourseCount: number;
  dashboardUrl: string;
}

export const instructorReinstated: EmailTemplate<InstructorReinstatedData> = ({
  firstName,
  restoredCourseCount,
  dashboardUrl,
}) => ({
  subject: "Your instructor account has been reinstated",
  ...renderLayout({
    preheader: "You can access the instructor dashboard again.",
    blocks: [
      heading("Welcome back!"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "Your instructor account on 3i Institute has been reinstated, and you have access to the instructor dashboard again.",
      ),
      ...(restoredCourseCount > 0
        ? [
            paragraph(
              restoredCourseCount === 1
                ? "Your course is live again and open to learners."
                : `Your ${restoredCourseCount} courses are live again and open to learners.`,
            ),
          ]
        : []),
      button("Go to instructor dashboard", dashboardUrl),
      signOff(),
    ],
  }),
});
