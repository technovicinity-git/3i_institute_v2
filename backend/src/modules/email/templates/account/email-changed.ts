import {
  bold,
  button,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface EmailChangedData {
  firstName: string;
  newEmail: string;
  contactUrl: string;
}

// Security alert sent to the OLD address after an email change.
export const emailChanged: EmailTemplate<EmailChangedData> = ({
  firstName,
  newEmail,
  contactUrl,
}) => ({
  subject: "Your account email was changed",
  ...renderLayout({
    preheader: "The email address on your 3i Institute account was changed.",
    blocks: [
      heading("Your account email was changed"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "The email address on your 3i Institute account was changed to ",
        bold(newEmail),
        ". From now on, account emails will go to that address.",
      ),
      paragraph(
        "If you made this change, there's nothing else to do. If you didn't, contact us straight away so we can secure your account.",
      ),
      button("Contact support", contactUrl),
      signOff(),
    ],
  }),
});
