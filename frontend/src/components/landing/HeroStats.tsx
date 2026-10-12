"use client";

import { useSiteStats } from "@/hooks/use-site";

/** Live platform numbers; rendered only once loaded. */
export default function HeroStats() {
  const { data } = useSiteStats();
  if (!data) return <div className="h-[86px]" />;

  const stats = [
    { value: data.learners, label: data.learners === 1 ? "Active Learner" : "Active Learners" },
    { value: data.courses, label: data.courses === 1 ? "Course" : "Courses" },
    {
      value: data.instructors,
      label: data.instructors === 1 ? "Instructor" : "Instructors",
    },
  ].filter((stat) => stat.value > 0);

  if (stats.length === 0) return null;

  return (
    <div className="flex gap-12 border-t border-gray-200 pt-6 max-w-[624px]">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-[120px]">
          <p className="font-serif text-[28px] text-[#B8912F] leading-tight">
            {stat.value.toLocaleString()}
          </p>
          <p className="text-[13px] font-medium text-[#64748B] mt-1">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
