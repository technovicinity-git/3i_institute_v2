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

export interface VerifyEmailData {
  firstName: string;
  verifyUrl: string;
  expiresInHours: number;
}

export const verifyEmail: EmailTemplate<VerifyEmailData> = ({
  firstName,
  verifyUrl,
  expiresInHours,
}) => ({
  subject: "Verify your email address",
  ...renderLayout({
    preheader: "Confirm your email to finish setting up your 3i Institute account.",
    blocks: [
      heading("Verify your email address"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "Welcome to 3i Institute! Please confirm your email address to finish setting up your account.",
      ),
      button("Verify email", verifyUrl),
      linkFallback(verifyUrl),
      note(
        `This link expires in ${expiresInHours} hours. If you didn't create an account, you can safely ignore this email.`,
      ),
      signOff(),
    ],
  }),
});
