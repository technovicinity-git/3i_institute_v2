import {
  button,
  callout,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface WaiverRevokedData {
  firstName: string;
  learnerName: string;
  reason: string;
  contactUrl: string;
}

export const waiverRevoked: EmailTemplate<WaiverRevokedData> = ({
  firstName,
  learnerName,
  reason,
  contactUrl,
}) => ({
  subject: `${learnerName}'s fee waiver was withdrawn`,
  ...renderLayout({
    preheader: `The fee waiver for ${learnerName} can no longer be used.`,
    blocks: [
      heading("Your fee waiver was withdrawn"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        `The fee waiver approved for ${learnerName} has been withdrawn and can no longer be used on a subscription.`,
      ),
      callout("Reason", reason),
      paragraph("If you think this is a mistake, please get in touch."),
      button("Contact us", contactUrl),
      signOff(),
    ],
  }),
});
