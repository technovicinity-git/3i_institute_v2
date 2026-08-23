"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock, Award, Flame, AlertTriangle } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useDashboard } from "@/hooks/use-dashboard";

export default function DashboardPage() {
  const { activeProfile } = useProfileStore();
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useDashboard(activeProfile?.id ?? "");

  if (isLoading || !activeProfile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="flex items-center justify-center flex-col gap-4 h-full">
        <p className="text-red-600 font-medium">Failed to load dashboard</p>
        <Link
          href="/profiles"
          className="text-[#22A146] font-semibold hover:underline"
        >
          Go back to profiles
        </Link>
      </div>
    );
  }

  const stats = [
    {
      icon: BookOpen,
      value: String(dashboardData.stats.coursesInProgress),
      label: "Courses in Progress",
      badge: `+${dashboardData.stats.coursesInProgressDelta} This week`,
      badgeColor: "text-[#22A146]",
    },
    {
      icon: Clock,
      value: String(dashboardData.stats.hoursLearned),
      label: "Hours learned this month",
      badge: `${dashboardData.stats.hoursLearnedDelta}% of Goal`,
      badgeColor: "text-[#22A146]",
    },
    {
      icon: Award,
      value: String(dashboardData.stats.certificatesEarned),
      label: "Certificates Earned",
      badge: `${dashboardData.stats.certificatesPending} pending`,
      badgeColor: "text-[#B8912F]",
    },
    {
      icon: Flame,
      value: `${dashboardData.stats.currentStreak} Days`,
      label: "Current Streak",
      badge: "Personal Record",
      badgeColor: "text-[#22A146]",
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 flex flex-col gap-3 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#F0FDF4] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#22A146]" />
                </div>
                <span
                  className={`text-[12px] font-semibold ${stat.badgeColor}`}
                >
                  {stat.badge}
                </span>
              </div>
              <div>
                <p className="font-serif text-[28px] text-[#12304E]">
                  {stat.value}
                </p>
                <p className="text-[12px] text-[#64748B]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Learning + Live Classes */}
      <div className="grid grid-cols-[1fr_380px] gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="font-serif text-[18px] text-[#12304E] mb-5">
            Continue learning
          </h2>
          {dashboardData.continueLearning.length === 0 ? (
            <p className="text-sm text-[#64748B]">No courses enrolled yet.</p>
          ) : (
            <div className="space-y-4">
              {dashboardData.continueLearning.map((course) => (
                <div key={course.id} className="flex items-center gap-4">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      width={80}
                      height={56}
                      className="rounded-lg object-cover w-[80px] h-[56px]"
                    />
                  ) : (
                    <div className="w-[80px] h-[56px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      Course
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#12304E] truncate">
                      {course.title}
                    </p>
                    <p className="text-[12px] text-[#64748B] truncate">
                      {course.moduleInfo}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#22A146] rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-[12px] font-semibold text-[#12304E] w-8">
                      {course.progress}%
                    </span>
                  </div>
                  <Link
                    href={`/courses/${course.id}`}
                    className="px-4 py-2 bg-[#12304E] text-white text-[12px] font-semibold rounded-lg hover:bg-[#1a4268]"
                  >
                    Resume
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Live Classes */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="text-[16px] font-bold text-[#12304E] mb-4">
              Upcoming live classes
            </h3>
            {dashboardData.liveClasses.length === 0 ? (
              <p className="text-sm text-[#64748B]">
                No upcoming live classes.
              </p>
            ) : (
              <div className="space-y-3">
                {dashboardData.liveClasses.map((cls, index) => (
                  <div key={cls.id} className="flex items-center gap-3">
                    <div className="w-10 h-12 bg-[#FBF9F4] rounded-lg flex flex-col items-center justify-center border border-gray-100">
                      <span className="text-[16px] font-serif text-[#12304E] leading-none">
                        {cls.date}
                      </span>
                      <span className="text-[10px] font-bold text-[#64748B] uppercase">
                        {cls.month}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#12304E] truncate">
                        {cls.title}
                      </p>
                      <p className="text-[10px] text-[#64748B] truncate">
                        {cls.instructor} • {cls.time}
                      </p>
                    </div>
                    <button
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold ${
                        index === 0
                          ? "bg-[#22A146] text-white"
                          : "border border-[#12304E] text-[#12304E] hover:bg-[#12304E] hover:text-white"
                      }`}
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deadlines */}
          <div className="bg-white rounded-xl p-5 border border-gray-100">
            <h3 className="text-[16px] font-bold text-[#12304E] mb-4">
              Deadlines
            </h3>
            {dashboardData.deadlines.length === 0 ? (
              <p className="text-sm text-[#64748B]">No upcoming deadlines.</p>
            ) : (
              <div className="space-y-3">
                {dashboardData.deadlines.map((d) => (
                  <div key={d.id} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${d.urgent ? "bg-red-50" : "bg-gray-50"}`}
                    >
                      <AlertTriangle
                        className={`w-4 h-4 ${d.urgent ? "text-red-500" : "text-gray-400"}`}
                      />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[#12304E]">
                        {d.title}
                      </p>
                      <p
                        className={`text-[10px] font-semibold ${d.urgent ? "text-red-500" : "text-[#64748B]"}`}
                      >
                        {d.urgent
                          ? "Due tomorrow"
                          : `Due in ${d.daysRemaining} days`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress + Notes */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-serif text-[18px] text-[#12304E]">
                Your Progress
              </h2>
              <p className="text-[12px] text-[#64748B]">Weekly study hours</p>
            </div>
          </div>
          <div className="flex items-end justify-between h-[180px] px-2">
            {dashboardData.weeklyProgress.map((week) => {
              const maxHours = Math.max(
                ...dashboardData.weeklyProgress.map((w) => w.hours),
              );
              return (
                <div
                  key={week.week}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div
                    className="w-full max-w-[40px] bg-[#12304E] rounded-t-md"
                    style={{ height: `${(week.hours / maxHours) * 140}px` }}
                  />
                  <span className="text-[10px] text-[#64748B]">
                    W{week.week}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-[18px] text-[#12304E]">
              Recent notes
            </h2>
            <Link
              href="/notes"
              className="text-[12px] font-semibold text-[#22A146] hover:underline"
            >
              View All Notes
            </Link>
          </div>
          {dashboardData.notes.length === 0 ? (
            <p className="text-sm text-[#64748B]">No notes yet.</p>
          ) : (
            <div className="space-y-4">
              {dashboardData.notes.map((note) => (
                <div
                  key={note.id}
                  className="border-l-[3px] border-[#B8912F] pl-4"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#B8912F] uppercase">
                      {note.subject}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      {note.timeAgo}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#4B5563] leading-relaxed">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended */}
      <div>
        <h2 className="font-serif text-[18px] text-[#12304E] mb-5">
          Recommended for you
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {dashboardData.recommended.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl overflow-hidden border border-gray-100"
            >
              <div className="relative h-[160px]">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    Course
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-white bg-[#22A146] px-2.5 py-1 rounded-full">
                    {course.level}
                  </span>
                  <span className="text-[12px] font-semibold text-[#B8912F]">
                    ★ {course.rating}
                  </span>
                </div>
                <h3 className="font-serif text-[18px] text-[#12304E] mb-1 leading-tight">
                  {course.title}
                </h3>
                <p className="text-[13px] text-[#64748B] mb-4">
                  {course.instructor}
                </p>
                <Link
                  href={`/courses/${course.id}`}
                  className="text-[13px] font-semibold text-[#22A146] hover:underline"
                >
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
