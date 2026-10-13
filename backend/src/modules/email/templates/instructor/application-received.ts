import {
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface ApplicationReceivedData {
  firstName: string;
}

export const applicationReceived: EmailTemplate<ApplicationReceivedData> = ({
  firstName,
}) => ({
  subject: "We've received your instructor application",
  ...renderLayout({
    preheader: "Thank you for applying to teach at 3i Institute.",
    blocks: [
      heading("Thank you for applying"),
      paragraph(`Assalamu alaikum ${firstName},`),
      paragraph(
        "We've received your application to teach at 3i Institute. Our team will review your details and documents, and we'll email you as soon as a decision has been made.",
      ),
      paragraph(
        "In the meantime, please make sure you've verified your email address so we can reach you.",
      ),
      signOff(),
    ],
  }),
});
