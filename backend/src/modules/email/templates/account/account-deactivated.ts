import {
  button,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface AccountDeactivatedData {
  firstName: string;
  contactUrl: string;
}

export const accountDeactivated: EmailTemplate<AccountDeactivatedData> = ({
  firstName,
  contactUrl,
}) => ({
  subject: "Your account has been deactivated",
  ...renderLayout({
    preheader: "You can no longer sign in to your 3i Institute account.",
    blocks: [
      heading("Your account has been deactivated"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "Your 3i Institute account has been deactivated by an administrator. You've been signed out on all devices and can't sign in for now.",
      ),
      paragraph(
        "If you think this is a mistake, or you'd like to know more, please get in touch with us.",
      ),
      button("Contact support", contactUrl),
      signOff(),
    ],
  }),
});
