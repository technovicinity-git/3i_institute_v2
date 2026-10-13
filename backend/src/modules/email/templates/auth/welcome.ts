import {
  button,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface WelcomeData {
  firstName: string;
  coursesUrl: string;
}

export const welcome: EmailTemplate<WelcomeData> = ({
  firstName,
  coursesUrl,
}) => ({
  subject: "Welcome to 3i Institute",
  ...renderLayout({
    preheader: "Your account is ready. Start exploring courses.",
    blocks: [
      heading("Welcome to 3i Institute"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "Your account is ready. You can now browse courses, enrol your learners and follow their progress, all in one place.",
      ),
      button("Explore courses", coursesUrl),
      paragraph(
        "If you have any questions, just reply to this email. We're happy to help.",
      ),
      signOff(),
    ],
  }),
});
