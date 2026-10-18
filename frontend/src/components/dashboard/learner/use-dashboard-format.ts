"use client";

import { useTranslations } from "next-intl";
import { useDateFormat } from "@/i18n/use-date-format";

/** Dates, greetings and due labels for the learner dashboard, in the user's language. */
export function useDashboardFormat() {
  const t = useTranslations("dashboardHome");
  const dates = useDateFormat();

  const shortDate = (value: string) => dates.format(value, "dayMonth");

  return {
    shortDate,
    monthShort: (value: string) => dates.format(value, "month"),
    dayOfMonth: (value: string) => dates.format(value, "day"),
    time: (value: string) => dates.format(value, "time"),
    /** "2 hours ago"; older than a week shows the date */
    timeAgo: (value: string) => {
      const date = new Date(value);
      const days = (Date.now() - date.getTime()) / 86_400_000;
      // dates.relative passes `now`, so server and browser agree.
      return days < 7 ? dates.relative(date) : shortDate(value);
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
