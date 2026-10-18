"use client";

import { useFormatter, useLocale, useNow } from "next-intl";
import { formatDate, type DateInput, type DateStyle } from "@/lib/date-format";

/**
 * Dates in the user's language, South Asian style ("18 Oct 2026, 3:45 PM";
 * "১৮ অক্টো ২০২৬" in Bengali). Thin wrapper over `formatDate` in
 * src/lib/date-format.ts that fills in the interface language.
 */
export function useDateFormat() {
  const locale = useLocale();
  const format = useFormatter();
  const now = useNow({ updateInterval: 60 * 1000 });

  const as = (value: DateInput | null | undefined, style: DateStyle) =>
    formatDate(value, style, locale);

  return {
    /** Any style, e.g. `format(value, "weekdayDayMonth")` → "Sun, 18 Oct" */
    format: as,
    /** "18 Oct 2026" */
    date: (value: DateInput | null | undefined) => as(value, "date"),
    /** "18 October 2026" */
    longDate: (value: DateInput | null | undefined) => as(value, "longDate"),
    /** "18 Oct 2026, 3:45 PM" */
    dateTime: (value: DateInput | null | undefined) => as(value, "dateTime"),
    /** "3:45 PM" */
    time: (value: DateInput | null | undefined) => as(value, "time"),
    /** "2 hours ago" */
    relative: (value: DateInput) =>
      format.relativeTime(value instanceof Date ? value : new Date(value), now),
    /** Plain number in the user's numerals */
    number: (value: number) => format.number(value),
  };
}
