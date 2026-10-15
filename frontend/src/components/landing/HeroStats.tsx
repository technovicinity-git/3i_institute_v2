"use client";

import { useSiteStats } from "@/hooks/use-site";
import { useFormatter, useTranslations } from "next-intl";

/** Live platform numbers; rendered only once loaded. */
export default function HeroStats() {
  const t = useTranslations("landing.stats");
  const format = useFormatter();
  const { data } = useSiteStats();
  if (!data) return <div className="h-[86px]" />;

  const stats = [
    { key: "learners", value: data.learners },
    { key: "courses", value: data.courses },
    { key: "instructors", value: data.instructors },
  ]
    .filter((stat) => stat.value > 0)
    .map((stat) => ({
      ...stat,
      label: t(stat.key as "learners" | "courses" | "instructors", {
        count: stat.value,
      }),
    }));

  if (stats.length === 0) return null;

  return (
    <div className="flex gap-12 border-t border-gray-200 pt-6 max-w-[624px]">
      {stats.map((stat) => (
        <div key={stat.key} className="min-w-[120px]">
          <p className="font-serif text-[28px] text-[#B8912F] leading-tight">
            {format.number(stat.value)}
          </p>
          <p className="text-[13px] font-medium text-[#64748B] mt-1">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
