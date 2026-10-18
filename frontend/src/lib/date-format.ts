/**
 * The one place dates and times are formatted for display.
 *
 * South Asian convention in every language: day before month, 12-hour clock
 * with AM/PM — "18 Oct 2026, 3:45 PM". Month and weekday names and digits
 * come from the language (e.g. "১৮ অক্টো ২০২৬" in Bengali); the order is
 * fixed here so it doesn't change between languages or browsers.
 *
 * React components use `useDateFormat()` (src/i18n/use-date-format.ts), which
 * passes the interface language. Pages that are English-only (admin,
 * instructor) and non-React code call `formatDate` directly.
 */

export type DateInput = string | number | Date;

export type DateStyle =
  /** 18 Oct 2026 */
  | "date"
  /** 18 October 2026 */
  | "longDate"
  /** Sun, 18 Oct 2026 */
  | "weekdayDate"
  /** Sunday, 18 October 2026 */
  | "fullDate"
  /** 18 Oct 2026, 3:45 PM */
  | "dateTime"
  /** Sun, 18 Oct 2026, 3:45 PM */
  | "weekdayDateTime"
  /** Sunday, 18 October 2026, 3:45 PM */
  | "fullDateTime"
  /** 18 Oct */
  | "dayMonth"
  /** 18 Oct, 3:45 PM */
  | "dayMonthTime"
  /** Sun, 18 Oct */
  | "weekdayDayMonth"
  /** 3:45 PM */
  | "time"
  /** Sunday */
  | "weekday"
  /** Sunday */
  | "weekday"
  /** Sunday */
  | "weekday"
  /** Oct */
  | "month"
  /** 18 */
  | "day";

// Regional variant used for each interface language, so numerals and names
// follow South Asian usage (e.g. Bengali as written in Bangladesh).
const REGIONAL_LOCALE: Record<string, string> = {
  en: "en-IN",
  bn: "bn-BD",
  hi: "hi-IN",
  ur: "ur-PK",
  ar: "ar",
};

type Parts = {
  weekday?: "short" | "long";
  month?: "short" | "long";
  day?: boolean;
  year?: boolean;
  time?: boolean;
};

const STYLES: Record<DateStyle, Parts> = {
  date: { day: true, month: "short", year: true },
  longDate: { day: true, month: "long", year: true },
  weekdayDate: { weekday: "short", day: true, month: "short", year: true },
  fullDate: { weekday: "long", day: true, month: "long", year: true },
  dateTime: { day: true, month: "short", year: true, time: true },
  weekdayDateTime: {
    weekday: "short",
    day: true,
    month: "short",
    year: true,
    time: true,
  },
  fullDateTime: {
    weekday: "long",
    day: true,
    month: "long",
    year: true,
    time: true,
  },
  dayMonth: { day: true, month: "short" },
  dayMonthTime: { day: true, month: "short", time: true },
  weekdayDayMonth: { weekday: "short", day: true, month: "short" },
  time: { time: true },
  weekday: { weekday: "long" },
  month: { month: "short" },
  day: { day: true },
};

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(locale: string, parts: Parts): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(parts)}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      weekday: parts.weekday,
      day: parts.day ? "numeric" : undefined,
      month: parts.month,
      year: parts.year ? "numeric" : undefined,
      ...(parts.time
        ? { hour: "numeric", minute: "2-digit", hour12: true }
        : {}),
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

/**
 * Formats a date for display, e.g. `formatDate(value, "dateTime", "bn")`.
 * Shows the viewer's local time. Empty or invalid input returns `fallback`.
 */
export function formatDate(
  value: DateInput | null | undefined,
  style: DateStyle = "date",
  locale = "en",
  fallback = "—",
): string {
  if (value === null || value === undefined || value === "") return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  const parts = STYLES[style];
  const pieces: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  const regional = REGIONAL_LOCALE[locale] ?? locale;
  for (const part of formatterFor(regional, parts).formatToParts(date)) {
    if (part.type !== "literal") pieces[part.type] = part.value;
  }

  // Urdu and Arabic separate with the Arabic comma.
  const comma = locale === "ur" || locale === "ar" ? "، " : ", ";

  // Day, month, year in that order, whatever the locale's own default is.
  const datePart = [pieces.day, pieces.month, pieces.year]
    .filter(Boolean)
    .join(" ");
  const withWeekday = pieces.weekday
    ? datePart
      ? `${pieces.weekday}${comma}${datePart}`
      : pieces.weekday
    : datePart;

  if (!parts.time) return withWeekday;

  // "3:45 PM" — Latin am/pm is upper-cased; other scripts are left as is.
  const period = (pieces.dayPeriod ?? "").replace(/^(am|pm)$/i, (p) =>
    p.toUpperCase(),
  );
  const time = `${pieces.hour}:${pieces.minute}${period ? ` ${period}` : ""}`;
  return withWeekday ? `${withWeekday}${comma}${time}` : time;
}
