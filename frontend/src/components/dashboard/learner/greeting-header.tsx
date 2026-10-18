import Link from "next/link";
import { serif } from "./utils";
import { useTranslations } from "next-intl";
import { useDashboardFormat } from "./use-dashboard-format";

export function GreetingHeader({
  displayName,
  hasCourses,
  studiedToday,
}: {
  displayName: string;
  hasCourses: boolean;
  studiedToday: boolean;
}) {
  const t = useTranslations("dashboardHome");
  const fmt = useDashboardFormat();
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl md:text-[36px] text-[#0C1F33]" style={serif}>
          {fmt.greeting(displayName)}
        </h1>
        <p className="text-base text-[#64748B]">
          {!hasCourses
            ? t("findFirstCourse")
            : studiedToday
              ? t("niceWork")
              : t("pickUp")}
        </p>
      </div>
      <Link
        href="/courses"
        className="text-sm font-semibold text-[#12304E] border border-[#E3E8EF] bg-white px-4 py-2 rounded-lg hover:bg-gray-50"
      >
        {t("browseCourses")}
      </Link>
    </div>
  );
}
