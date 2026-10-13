import {
  bold,
  button,
  details,
  heading,
  note,
  paragraph,
  signOff,
} from "#/modules/email/templates/components";
import {
  formatDateTime,
  formatDuration,
  formatNameList,
} from "#/modules/email/templates/format";
import { renderLayout } from "#/modules/email/templates/layout";
import type { EmailTemplate } from "#/modules/email/templates/types";

// Shared by the session emails, which go to the account holder of the
// learner profile(s) enrolled in the batch.
export interface SessionEmailData {
  firstName: string;
  learnerNames: string[];
  sessionTitle: string;
  courseTitle: string;
  batchName: string;
  startsAt: Date;
  durationMinutes: number;
  timeZone: string;
  scheduleUrl: string;
}

export const sessionScheduled: EmailTemplate<SessionEmailData> = ({
  firstName,
  learnerNames,
  sessionTitle,
  courseTitle,
  batchName,
  startsAt,
  durationMinutes,
  timeZone,
  scheduleUrl,
}) => {
  const when = formatDateTime(startsAt, timeZone);
  return {
    subject: `New class scheduled: ${sessionTitle} (${courseTitle})`,
    ...renderLayout({
      preheader: `${sessionTitle} on ${when}.`,
      blocks: [
        heading("New class scheduled"),
        paragraph(`Assalamu alaikum ${firstName},`),
        paragraph(
          "A new live class has been scheduled for ",
          bold(formatNameList(learnerNames)),
          " in ",
          bold(courseTitle),
          ".",
        ),
        details([
          ["Class", sessionTitle],
          ["Course", courseTitle],
          ["Batch", batchName],
          ["When", when],
          ["Duration", formatDuration(durationMinutes)],
        ]),
        button("View class schedule", scheduleUrl),
        note(
          "The join link appears in the class schedule when it's ready. We'll also remind you before the class starts.",
        ),
        signOff(),
      ],
    }),
  };
};
