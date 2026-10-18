import type { WeeklyActivity } from "@/types/dashboard";
import { card, serif } from "./utils";
import { useTranslations } from "next-intl";
import { useDashboardFormat } from "./use-dashboard-format";

export function WeeklyActivityCard({ weeks }: { weeks: WeeklyActivity[] }) {
  const t = useTranslations("dashboardHome.activity");
  const fmt = useDashboardFormat();
  const maxWeekly = Math.max(1, ...weeks.map((w) => w.lessonsCompleted));
  const weeklyTotal = weeks.reduce((sum, w) => sum + w.lessonsCompleted, 0);

  return (
    <div className={`${card} p-6`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-[18px] text-[#0C1F33]" style={serif}>
            {t("title")}
          </h2>
          <p className="text-[12px] text-[#64748B]">
            {t("subtitle", { total: weeklyTotal, weeks: weeks.length })}
          </p>
        </div>
      </div>
      <div className="flex items-end gap-2 h-[160px]">
        {weeks.map((week, index) => {
          const isCurrent = index === weeks.length - 1;
          const height = (week.lessonsCompleted / maxWeekly) * 120;
          const weekLabel = fmt.shortDate(`${week.weekStart}T00:00:00`);
          return (
            <div
              key={week.weekStart}
              className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full"
              title={t("weekTooltip", {
                date: weekLabel,
                count: week.lessonsCompleted,
              })}
            >
              <span className="text-[10px] font-semibold text-[#64748B]">
                {week.lessonsCompleted > 0 ? week.lessonsCompleted : ""}
              </span>
              <div
                className={`w-full max-w-[36px] rounded-t-md ${
                  isCurrent ? "bg-[#22A146]" : "bg-[#12304E]"
                }`}
                style={{
                  height: `${Math.max(height, 4)}px`,
                  opacity: week.lessonsCompleted ? 1 : 0.15,
                }}
              />
              <span
                className={`text-[10px] whitespace-nowrap ${
                  isCurrent ? "font-semibold text-[#22A146]" : "text-[#94A3B8]"
                }`}
              >
                {isCurrent ? t("thisWeek") : weekLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
