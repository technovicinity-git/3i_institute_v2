import {
  button,
  callout,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface WaiverRejectedData {
  firstName: string;
  learnerName: string;
  reason: string;
  contactUrl: string;
}

export const waiverRejected: EmailTemplate<WaiverRejectedData> = ({
  firstName,
  learnerName,
  reason,
  contactUrl,
}) => ({
  subject: `An update on ${learnerName}'s fee waiver request`,
  ...renderLayout({
    preheader: `Your fee waiver request for ${learnerName} was reviewed.`,
    blocks: [
      heading("An update on your waiver request"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        `Thank you for telling us about your situation. After reviewing the fee waiver request for ${learnerName}, we're unable to approve it at this time.`,
      ),
      callout("Reason", reason),
      paragraph(
        "If your circumstances change or you have more information, you're welcome to apply again or get in touch.",
      ),
      button("Contact us", contactUrl),
      signOff(),
    ],
  }),
});
