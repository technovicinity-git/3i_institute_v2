import {
  bold,
  button,
  details,
  heading,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import {
  formatDateTime,
  formatNameList,
} from "#/modules/email/templates/format";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface SessionCancelledData {
  firstName: string;
  learnerNames: string[];
  sessionTitle: string;
  courseTitle: string;
  batchName: string;
  scheduledAt: Date;
  timeZone: string;
  scheduleUrl: string;
}

export const sessionCancelled: EmailTemplate<SessionCancelledData> = ({
  firstName,
  learnerNames,
  sessionTitle,
  courseTitle,
  batchName,
  scheduledAt,
  timeZone,
  scheduleUrl,
}) => {
  const when = formatDateTime(scheduledAt, timeZone);
  return {
    subject: `Class cancelled: ${sessionTitle} (${courseTitle})`,
    ...renderLayout({
      preheader: `${sessionTitle} on ${when} will not take place.`,
      blocks: [
        heading("Class cancelled"),
        paragraph(`Assalamu alaikum ${firstName},`),
        paragraph(
          "A live class for ",
          bold(formatNameList(learnerNames)),
          " in ",
          bold(courseTitle),
          " has been cancelled and will not take place.",
        ),
        details([
          ["Class", sessionTitle],
          ["Batch", batchName],
          ["Was scheduled for", when],
        ]),
        paragraph(
          "You can see the rest of the class schedule, including any replacement class, in the app.",
        ),
        button("View class schedule", scheduleUrl),
        signOff(),
      ],
    }),
  };
};
