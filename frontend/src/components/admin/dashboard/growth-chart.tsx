import type { AdminDashboardTrend } from "@/types/admin-dashboard";
import { card, formatShortDate } from "./utils";

/** Weekly sign-ups and enrolments as paired bars. */
export function GrowthChart({ trends }: { trends: AdminDashboardTrend[] }) {
  const maxTrend = Math.max(
    1,
    ...trends.flatMap((t) => [t.signups, t.enrolments]),
  );
  const totals = trends.reduce(
    (acc, t) => ({
      signups: acc.signups + t.signups,
      enrolments: acc.enrolments + t.enrolments,
    }),
    { signups: 0, enrolments: 0 },
  );

  return (
    <section className={`${card} p-6`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold text-[#0C1F33]">Growth</h2>
          <p className="text-xs text-[#64748B]">
            Weekly sign-ups and enrolments · last {trends.length} weeks
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
            Sign-ups ({totals.signups})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#22A146]" />
            Enrolments ({totals.enrolments})
          </span>
        </div>
      </div>
      <div className="flex items-end gap-1.5 sm:gap-3 h-[200px]">
        {trends.map((week, index) => {
          const weekLabel = formatShortDate(`${week.weekStart}T00:00:00Z`);
          return (
            <div
              key={week.weekStart}
              className="flex-1 h-full flex flex-col justify-end items-center gap-1.5"
              title={`Week of ${weekLabel}: ${week.signups} sign-ups, ${week.enrolments} enrolments`}
            >
              <div className="flex items-end gap-0.5 w-full justify-center h-[170px]">
                {[
                  { value: week.signups, color: "bg-[#2563EB]" },
                  { value: week.enrolments, color: "bg-[#22A146]" },
                ].map((bar, i) => (
                  <div
                    key={i}
                    className={`w-full max-w-[14px] rounded-t ${bar.color}`}
                    style={{
                      height: `${Math.max((bar.value / maxTrend) * 170, 2)}px`,
                      opacity: bar.value ? 1 : 0.2,
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#94A3B8] whitespace-nowrap">
                {index === trends.length - 1
                  ? "This wk"
                  : index % 2 === 0
                    ? weekLabel
                    : ""}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
