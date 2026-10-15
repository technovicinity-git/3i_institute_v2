import {
  button,
  details,
  heading,
  note,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { formatDateTime } from "#/modules/email/templates/format";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface WaiverApprovedData {
  firstName: string;
  learnerName: string;
  percent: number;
  expiresAt: Date;
  timeZone: string;
  subscriptionUrl: string;
}

export const waiverApproved: EmailTemplate<WaiverApprovedData> = ({
  firstName,
  learnerName,
  percent,
  expiresAt,
  timeZone,
  subscriptionUrl,
}) => ({
  subject: `${learnerName}'s fee waiver was approved`,
  ...renderLayout({
    preheader: `A ${percent}% waiver is ready to use on ${learnerName}'s subscription.`,
    blocks: [
      heading("Your fee waiver was approved"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        percent === 100
          ? `Good news: ${learnerName}'s next month of learning is free. Apply for the subscription and no payment will be needed.`
          : `Good news: ${learnerName} has a ${percent}% discount on their next one-month subscription. It's applied automatically when you apply for the subscription.`,
      ),
      details([
        ["Learner", learnerName],
        ["Discount", `${percent}%`],
        ["Use by", formatDateTime(expiresAt, timeZone)],
      ]),
      button("Apply for subscription", subscriptionUrl),
      note(
        "The waiver covers one subscription and expires if it isn't used by the date above.",
      ),
      signOff(),
    ],
  }),
});
