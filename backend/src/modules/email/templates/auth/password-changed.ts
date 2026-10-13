import {
  bold,
  button,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { formatDateTime } from "#/modules/email/templates/format";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface PasswordChangedData {
  firstName: string;
  changedAt: Date;
  timeZone: string;
  forgotPasswordUrl: string;
}

export const passwordChanged: EmailTemplate<PasswordChangedData> = ({
  firstName,
  changedAt,
  timeZone,
  forgotPasswordUrl,
}) => ({
  subject: "Your password was changed",
  ...renderLayout({
    preheader: "The password for your 3i Institute account was just changed.",
    blocks: [
      heading("Your password was changed"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "The password for your 3i Institute account was changed on ",
        bold(formatDateTime(changedAt, timeZone)),
        ".",
      ),
      paragraph(
        "If this was you, there's nothing else to do. If you didn't change it, reset your password right away to secure your account.",
      ),
      button("Reset password", forgotPasswordUrl),
      signOff(),
    ],
  }),
});
