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
import type { EmailTemplate } from "#/modules/email/templates/types";

export interface ExamPublishedData {
  firstName: string;
  learnerNames: string[];
  examTitle: string;
  courseTitle: string;
  // null: available now, with no fixed start.
  opensAt: Date | null;
  closesAt: Date | null;
  durationMinutes: number;
  maxAttempts: number;
  timeZone: string;
  examsUrl: string;
}

export const examPublished: EmailTemplate<ExamPublishedData> = ({
  firstName,
  learnerNames,
  examTitle,
  courseTitle,
  opensAt,
  closesAt,
  durationMinutes,
  maxAttempts,
  timeZone,
  examsUrl,
}) => {
  const scheduled = opensAt !== null && opensAt.getTime() > Date.now();
  const rows: [string, string][] = [
    ["Exam", examTitle],
    ["Course", courseTitle],
    ["Opens", scheduled ? formatDateTime(opensAt, timeZone) : "Now"],
    ...(closesAt
      ? ([["Closes", formatDateTime(closesAt, timeZone)]] as [string, string][])
      : []),
    ["Time allowed", formatDuration(durationMinutes)],
    ["Attempts", String(maxAttempts)],
  ];

  return {
    subject: scheduled
      ? `New exam scheduled: ${examTitle} (${courseTitle})`
      : `New exam available: ${examTitle} (${courseTitle})`,
    ...renderLayout({
      preheader: scheduled
        ? `${examTitle} opens ${formatDateTime(opensAt, timeZone)}.`
        : `${examTitle} is available now.`,
      blocks: [
        heading(scheduled ? "New exam scheduled" : "New exam available"),
        paragraph(`Assalamu alaikum ${firstName},`),
        paragraph(
          "A new exam has been set for ",
          bold(formatNameList(learnerNames)),
          " in ",
          bold(courseTitle),
          scheduled
            ? ". Please make sure there's time set aside when it opens."
            : ". It can be taken now.",
        ),
        details(rows),
        button("View exams", examsUrl),
        signOff(),
      ],
    }),
  };
};
