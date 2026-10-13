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

export interface PasswordResetData {
  firstName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export const passwordReset: EmailTemplate<PasswordResetData> = ({
  firstName,
  resetUrl,
  expiresInMinutes,
}) => ({
  subject: "Reset your password",
  ...renderLayout({
    preheader: `Use this link within ${expiresInMinutes} minutes to choose a new password.`,
    blocks: [
      heading("Reset your password"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "We received a request to reset the password for your 3i Institute account. Click the button below to choose a new one.",
      ),
      button("Reset password", resetUrl),
      linkFallback(resetUrl),
      note(
        `This link expires in ${expiresInMinutes} minutes and can only be used once. If you didn't ask to reset your password, you can ignore this email: your password won't change.`,
      ),
      signOff(),
    ],
  }),
});
