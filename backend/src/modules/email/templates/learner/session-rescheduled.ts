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
  formatDuration,
  formatNameList,
} from "#/modules/email/templates/format";
import { renderLayout } from "#/modules/email/templates/layout";
import type { SessionEmailData } from "#/modules/email/templates/learner/session-scheduled";
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface SessionRescheduledData extends SessionEmailData {
  previousStartsAt: Date;
}

export const sessionRescheduled: EmailTemplate<SessionRescheduledData> = ({
  firstName,
  learnerNames,
  sessionTitle,
  courseTitle,
  batchName,
  startsAt,
  previousStartsAt,
  durationMinutes,
  timeZone,
  scheduleUrl,
}) => {
  const when = formatDateTime(startsAt, timeZone);
  const timeMoved = startsAt.getTime() !== previousStartsAt.getTime();
  return {
    subject: `Class time changed: ${sessionTitle} (${courseTitle})`,
    ...renderLayout({
      preheader: `${sessionTitle} is now on ${when}.`,
      blocks: [
        heading("Class time changed"),
        paragraph(`Assalamu alaikum ${firstName},`),
        paragraph(
          "The time of a live class for ",
          bold(formatNameList(learnerNames)),
          " in ",
          bold(courseTitle),
          " has changed. Please update your calendar.",
        ),
        details([
          ["Class", sessionTitle],
          ["Batch", batchName],
          ["New time", when],
          // Only the duration changed: the start time stays the same.
          ...(timeMoved
            ? ([["Was", formatDateTime(previousStartsAt, timeZone)]] as [
                string,
                string,
              ][])
            : []),
          ["Duration", formatDuration(durationMinutes)],
        ]),
        button("View class schedule", scheduleUrl),
        signOff(),
      ],
    }),
  };
};
