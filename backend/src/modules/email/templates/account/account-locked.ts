import {
  button,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface AccountLockedData {
  firstName: string;
  lockedMinutes: number;
  forgotPasswordUrl: string;
}

export const accountLocked: EmailTemplate<AccountLockedData> = ({
  firstName,
  lockedMinutes,
  forgotPasswordUrl,
}) => ({
  subject: "Your account is temporarily locked",
  ...renderLayout({
    preheader: "We locked sign-in after several failed attempts.",
    blocks: [
      heading("Your account is temporarily locked"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        `There were several unsuccessful attempts to sign in to your 3i Institute account, so we've locked sign-in for ${lockedMinutes} minutes to keep it safe.`,
      ),
      paragraph(
        "If this was you, wait a few minutes and try again, or reset your password. If it wasn't you, we recommend resetting your password now.",
      ),
      button("Reset password", forgotPasswordUrl),
      signOff(),
    ],
  }),
});
