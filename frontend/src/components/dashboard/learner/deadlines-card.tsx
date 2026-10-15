import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  FileText,
} from "lucide-react";
import type { Deadline } from "@/types/dashboard";
import { EmptyText, SectionHeader } from "./section-header";
import { card, deadlineHref } from "./utils";
import { useTranslations } from "next-intl";
import { useDashboardFormat } from "./use-dashboard-format";

export function DeadlinesCard({ deadlines }: { deadlines: Deadline[] }) {
  const t = useTranslations("dashboardHome.deadlines");
  const fmt = useDashboardFormat();
  return (
    <div className={`${card} p-5`}>
      <SectionHeader title={t("title")} />
      {deadlines.length === 0 ? (
        <EmptyText>{t("none")}</EmptyText>
      ) : (
        <div className="space-y-1">
          {deadlines.map((deadline) => {
            const urgent = deadline.daysRemaining <= 1;
            const Icon = deadline.kind === "EXAM" ? FileText : ClipboardList;
            return (
              <Link
                key={`${deadline.kind}-${deadline.id}`}
                href={deadlineHref(deadline)}
                className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-[#F8FAFC]"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    urgent ? "bg-red-50" : "bg-[#F1F5F9]"
                  }`}
                >
                  {urgent ? (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Icon className="w-4 h-4 text-[#64748B]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#0C1F33] truncate">
                    {deadline.title}
                  </p>
                  <p className="text-[11px] text-[#64748B] truncate">
                    <span className={urgent ? "font-semibold text-red-500" : ""}>
                      {fmt.dueLabel(deadline.daysRemaining)}
                    </span>{" "}
                    • {deadline.kind === "EXAM" ? t("exam") : t("assignment")} ·{" "}
                    {deadline.courseTitle}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
