import { paragraph } from "#/modules/email/templates/components";
import { renderLayout } from "#/modules/email/templates/layout";
import {
  markdownBlock,
  markdownPreheader,
} from "#/modules/email/templates/markdown";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface CustomEmailData {
  subject: string;
  // Markdown from the admin's rich text editor.
  body: string;
  // When set, the email opens with "Assalamu alaikum <firstName>,".
  firstName?: string;
}

export const customEmail: EmailTemplate<CustomEmailData> = ({
  subject,
  body,
  firstName,
}) => ({
  subject,
  ...renderLayout({
    preheader: markdownPreheader(body),
    blocks: [
      ...(firstName ? [paragraph(`Assalamu alaikum ${firstName},`)] : []),
      markdownBlock(body),
    ],
    footerNote:
      "You received this email because you have an account with 3i International Islamic Institute.",
  }),
});
