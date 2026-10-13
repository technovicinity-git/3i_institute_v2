import {
  button,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface ApplicationApprovedData {
  firstName: string;
  dashboardUrl: string;
}

export const applicationApproved: EmailTemplate<ApplicationApprovedData> = ({
  firstName,
  dashboardUrl,
}) => ({
  subject: "Welcome aboard: your instructor application is approved",
  ...renderLayout({
    preheader: "You can now create courses on 3i Institute.",
    blocks: [
      heading("Welcome aboard!"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "Your application to teach at 3i Institute has been approved. You now have access to the instructor dashboard, where you can create courses, schedule classes and connect with your learners.",
      ),
      button("Go to instructor dashboard", dashboardUrl),
      paragraph(
        "When your first course is ready, submit it for review and our team will take a look.",
      ),
      signOff(),
    ],
  }),
});
