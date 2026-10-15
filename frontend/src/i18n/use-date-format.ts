"use client";

import { useFormatter, useNow } from "next-intl";

type DateInput = string | number | Date;

const toDate = (value: DateInput) =>
  value instanceof Date ? value : new Date(value);

/**
 * Dates in the user's language, e.g. "15 অক্টো, 2026" for Bengali.
 * Replaces hardcoded `toLocaleDateString("en-US", …)` calls.
 */
export function useDateFormat() {
  const format = useFormatter();
  const now = useNow({ updateInterval: 60 * 1000 });

  return {
    /** "Oct 15, 2026" */
    date: (value: DateInput) =>
      format.dateTime(toDate(value), {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    /** "October 15, 2026" */
    longDate: (value: DateInput) =>
      format.dateTime(toDate(value), {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    /** "Oct 15, 2026, 3:30 PM" */
    dateTime: (value: DateInput) =>
      format.dateTime(toDate(value), {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    /** "3:30 PM" */
    time: (value: DateInput) =>
      format.dateTime(toDate(value), { hour: "numeric", minute: "2-digit" }),
    /** "2 hours ago" */
    relative: (value: DateInput) => format.relativeTime(toDate(value), now),
    /** Plain number in the user's numerals */
    number: (value: number) => format.number(value),
  };
}
