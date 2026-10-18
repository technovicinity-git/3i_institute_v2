import Link from "next/link";
import { CheckCircle2, Hourglass, XCircle, type LucideIcon } from "lucide-react";
import type { RecentResult } from "@/types/dashboard";
import { EmptyText, SectionHeader } from "./section-header";
import { card, resultHref } from "./utils";
import { useTranslations } from "next-intl";
import { useDashboardFormat } from "./use-dashboard-format";

const STATUS_META: Record<
  RecentResult["status"],
  { icon: LucideIcon; className: string }
> = {
  PASSED: { icon: CheckCircle2, className: "text-[#22A146] bg-[#22A146]/10" },
  FAILED: { icon: XCircle, className: "text-red-600 bg-red-50" },
  GRADED: { icon: CheckCircle2, className: "text-[#2563EB] bg-[#2563EB]/10" },
  AWAITING_GRADE: { icon: Hourglass, className: "text-yellow-700 bg-yellow-50" },
};

export function RecentResultsCard({ results }: { results: RecentResult[] }) {
  const t = useTranslations("dashboardHome");
  const fmt = useDashboardFormat();
  return (
    <div className={`${card} p-6`}>
      <SectionHeader title={t("results.title")} href="/exams" />
      {results.length === 0 ? (
        <EmptyText>{t("results.none")}</EmptyText>
      ) : (
        <div className="space-y-1">
          {results.map((result) => {
            const meta = STATUS_META[result.status];
            const Icon = meta.icon;
            return (
              <Link
                key={`${result.kind}-${result.id}`}
                href={resultHref(result)}
                className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-[#F8FAFC]"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${meta.className}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#0C1F33] truncate">
                    {result.title}
                  </p>
                  <p className="text-[11px] text-[#64748B] truncate">
                    {result.kind === "EXAM"
                      ? t("deadlines.exam")
                      : t("deadlines.assignment")}{" "}
                    · {result.courseTitle} • {fmt.timeAgo(result.submittedAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {result.score !== null ? (
                    <p className="text-sm font-bold text-[#0C1F33]">
                      {result.score}/{result.totalMarks}
                    </p>
                  ) : null}
                  <p
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${meta.className}`}
                  >
                    {t(`results.${result.status}`)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
