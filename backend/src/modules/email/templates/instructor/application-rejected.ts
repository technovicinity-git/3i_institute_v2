import {
  button,
  callout,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface ApplicationRejectedData {
  firstName: string;
  reason?: string | null;
  contactUrl: string;
}

export const applicationRejected: EmailTemplate<ApplicationRejectedData> = ({
  firstName,
  reason,
  contactUrl,
}) => ({
  subject: "An update on your instructor application",
  ...renderLayout({
    preheader: "Your 3i Institute instructor application was reviewed.",
    blocks: [
      heading("An update on your application"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "Thank you for your interest in teaching at 3i Institute. After reviewing your application, we're unable to approve it at this time.",
      ),
      ...(reason?.trim() ? [callout("Reason", reason.trim())] : []),
      paragraph(
        "If you have questions, or you'd like to apply again with updated details, please get in touch.",
      ),
      button("Contact us", contactUrl),
      signOff(),
    ],
  }),
});
