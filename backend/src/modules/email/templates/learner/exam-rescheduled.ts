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

export interface ExamRescheduledData {
  firstName: string;
  learnerNames: string[];
  examTitle: string;
  courseTitle: string;
  opensAt: Date;
  // null: the exam had no fixed start before.
  previousOpensAt: Date | null;
  closesAt: Date | null;
  durationMinutes: number;
  timeZone: string;
  examsUrl: string;
}

export const examRescheduled: EmailTemplate<ExamRescheduledData> = ({
  firstName,
  learnerNames,
  examTitle,
  courseTitle,
  opensAt,
  previousOpensAt,
  closesAt,
  durationMinutes,
  timeZone,
  examsUrl,
}) => {
  const when = formatDateTime(opensAt, timeZone);
  const rows: [string, string][] = [
    ["Exam", examTitle],
    ["Course", courseTitle],
    ["New opening time", when],
    ...(previousOpensAt
      ? ([["Was", formatDateTime(previousOpensAt, timeZone)]] as [
          string,
          string,
        ][])
      : []),
    ...(closesAt
      ? ([["Closes", formatDateTime(closesAt, timeZone)]] as [string, string][])
      : []),
    ["Time allowed", formatDuration(durationMinutes)],
  ];

  return {
    subject: `Exam time changed: ${examTitle} (${courseTitle})`,
    ...renderLayout({
      preheader: `${examTitle} now opens ${when}.`,
      blocks: [
        heading("Exam time changed"),
        paragraph(`Assalamu alaikum ${firstName},`),
        paragraph(
          "The opening time of an exam for ",
          bold(formatNameList(learnerNames)),
          " in ",
          bold(courseTitle),
          " has changed. Please update your calendar.",
        ),
        details(rows),
        button("View exams", examsUrl),
        signOff(),
      ],
    }),
  };
};
