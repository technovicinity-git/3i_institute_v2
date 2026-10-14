import Link from "next/link";
import { Award, BookOpen, CheckCircle2, Flame } from "lucide-react";
import type { DashboardStats } from "@/types/dashboard";
import { card, serif } from "./utils";

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  const statCards = [
    {
      icon: BookOpen,
      value: stats.coursesInProgress,
      label: "Courses in progress",
      sub: `${stats.coursesCompleted} completed`,
      tint: "bg-[#2563EB]/10 text-[#2563EB]",
    },
    {
      icon: CheckCircle2,
      value: stats.lessonsCompleted,
      label: "Lessons completed",
      sub: `${stats.lessonsThisWeek} this week`,
      tint: "bg-[#22A146]/10 text-[#22A146]",
    },
    {
      icon: Award,
      value: stats.certificatesEarned,
      label: "Certificates earned",
      sub: "View certificates",
      href: "/certificates",
      tint: "bg-[#B8912F]/10 text-[#B8912F]",
    },
    {
      icon: Flame,
      value: stats.currentStreak,
      label: `Day streak`,
      sub:
        stats.currentStreak > 0 && !stats.studiedToday
          ? "Study today to keep it going"
          : `Best: ${stats.longestStreak} day${stats.longestStreak === 1 ? "" : "s"}`,
      tint: "bg-orange-50 text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className={`${card} p-5 flex flex-col gap-3`}>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.tint}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[28px] leading-8 text-[#0C1F33]" style={serif}>
                {stat.value}
              </p>
              <p className="text-[13px] text-[#64748B]">{stat.label}</p>
            </div>
            {stat.href ? (
              <Link
                href={stat.href}
                className="text-[12px] font-semibold text-[#22A146] hover:underline"
              >
                {stat.sub}
              </Link>
            ) : (
              <p className="text-[12px] font-semibold text-[#94A3B8]">
                {stat.sub}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
