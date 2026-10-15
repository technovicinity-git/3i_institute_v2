"use client";

import { useFormatter, useTranslations } from "next-intl";

/** Dates, greetings and due labels for the learner dashboard, in the user's language. */
export function useDashboardFormat() {
  const t = useTranslations("dashboardHome");
  const format = useFormatter();

  const shortDate = (value: string) =>
    format.dateTime(new Date(value), { month: "short", day: "numeric" });

  return {
    shortDate,
    monthShort: (value: string) =>
      format.dateTime(new Date(value), { month: "short" }),
    dayOfMonth: (value: string) =>
      format.dateTime(new Date(value), { day: "numeric" }),
    time: (value: string) =>
      format.dateTime(new Date(value), { hour: "numeric", minute: "2-digit" }),
    /** "2 hours ago"; older than a week shows the date */
    timeAgo: (value: string) => {
      const date = new Date(value);
      const days = (Date.now() - date.getTime()) / 86_400_000;
      return days < 7 ? format.relativeTime(date) : shortDate(value);
    },
    greeting: (name: string) => {
      const hour = new Date().getHours();
      if (hour < 12) return t("greetingMorning", { name });
      if (hour < 17) return t("greetingAfternoon", { name });
      return t("greetingEvening", { name });
    },
    dueLabel: (daysRemaining: number) => {
      if (daysRemaining <= 0) return t("deadlines.dueToday");
      if (daysRemaining === 1) return t("deadlines.dueTomorrow");
      return t("deadlines.dueIn", { count: daysRemaining });
    },
  };
}
