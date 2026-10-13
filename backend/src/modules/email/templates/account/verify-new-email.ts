import {
  button,
  heading,
  linkFallback,
  note,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface VerifyNewEmailData {
  firstName: string;
  verifyUrl: string;
  expiresInHours: number;
}

// Sent to the new address after an email change.
export const verifyNewEmail: EmailTemplate<VerifyNewEmailData> = ({
  firstName,
  verifyUrl,
  expiresInHours,
}) => ({
  subject: "Confirm your new email address",
  ...renderLayout({
    preheader: "Confirm this address for your 3i Institute account.",
    blocks: [
      heading("Confirm your new email address"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "You changed the email address on your 3i Institute account to this one. Please confirm it so we can keep sending you important account updates.",
      ),
      button("Confirm email", verifyUrl),
      linkFallback(verifyUrl),
      note(
        `This link expires in ${expiresInHours} hours. If you didn't make this change, please contact us.`,
      ),
      signOff(),
    ],
  }),
});
