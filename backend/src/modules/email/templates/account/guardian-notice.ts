import {
  bold,
  button,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface GuardianNoticeData {
  guardianName: string;
  studentName: string;
  studentEmail: string;
  contactUrl: string;
}

// Sent to the guardian a 13–17 year old named when signing up.
export const guardianNotice: EmailTemplate<GuardianNoticeData> = ({
  guardianName,
  studentName,
  studentEmail,
  contactUrl,
}) => ({
  subject: `${studentName} has joined 3i Institute`,
  ...renderLayout({
    preheader: `${studentName} listed you as their guardian on 3i Institute.`,
    blocks: [
      heading("You've been listed as a guardian"),
      paragraph(`Assalamu alaikum ${guardianName},`),
      paragraph(
        bold(studentName),
        " has created a 3i Institute account with the email ",
        bold(studentEmail),
        " and named you as their parent or guardian.",
      ),
      paragraph(
        "3i Institute is an online Islamic learning platform. Because they are under 18, we let guardians know when an account is created. You don't need to do anything.",
      ),
      paragraph(
        "If you don't recognise this, or you don't agree to this account being created, please contact us and we'll help.",
      ),
      button("Contact us", contactUrl),
      signOff(),
    ],
  }),
});
