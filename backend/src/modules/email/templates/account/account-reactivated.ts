import {
  button,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface AccountReactivatedData {
  firstName: string;
  loginUrl: string;
}

export const accountReactivated: EmailTemplate<AccountReactivatedData> = ({
  firstName,
  loginUrl,
}) => ({
  subject: "Your account is active again",
  ...renderLayout({
    preheader: "You can sign in to your 3i Institute account again.",
    blocks: [
      heading("Your account is active again"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "Good news: your 3i Institute account has been reactivated. You can sign in and pick up where you left off.",
      ),
      button("Sign in", loginUrl),
      signOff(),
    ],
  }),
});
