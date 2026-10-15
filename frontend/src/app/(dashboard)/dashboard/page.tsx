"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfileStore } from "@/stores/profile-store";
import { useDashboard } from "@/hooks/use-dashboard";
import { GreetingHeader } from "@/components/dashboard/learner/greeting-header";
import { LiveClassBanner } from "@/components/dashboard/learner/live-class-banner";
import { StatsGrid } from "@/components/dashboard/learner/stats-grid";
import { ContinueLearningCard } from "@/components/dashboard/learner/continue-learning-card";
import { LiveClassesCard } from "@/components/dashboard/learner/live-classes-card";
import { DeadlinesCard } from "@/components/dashboard/learner/deadlines-card";
import { WeeklyActivityCard } from "@/components/dashboard/learner/weekly-activity-card";
import { RecentResultsCard } from "@/components/dashboard/learner/recent-results-card";
import { RecentNotes } from "@/components/dashboard/learner/recent-notes";
import { RecommendedCourses } from "@/components/dashboard/learner/recommended-courses";
import { classStatus } from "@/components/dashboard/learner/utils";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("dashboardHome");
  const { activeProfile } = useProfileStore();
  const { data, isLoading, isError } = useDashboard(activeProfile?.id ?? "");

  // Keep "live now" / "starting soon" accurate without a refresh.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !activeProfile) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center flex-col gap-4 h-full py-20">
        <p className="text-red-600 font-medium">{t("loadFailed")}</p>
        <Link
          href="/profiles"
          className="text-[#22A146] font-semibold hover:underline"
        >
          {t("backToProfiles")}
        </Link>
      </div>
    );
  }

  const { stats } = data;
  const hasCourses = stats.coursesInProgress + stats.coursesCompleted > 0;
  const happeningNow = data.liveClasses.find(
    (cls) => classStatus(cls, now) !== "LATER",
  );

  return (
    <div className="p-6 md:p-10 space-y-6 md:space-y-8">
      <GreetingHeader
        displayName={data.learner.displayName}
        hasCourses={hasCourses}
        studiedToday={stats.studiedToday}
      />

      {happeningNow && (
        <LiveClassBanner
          liveClass={happeningNow}
          status={classStatus(happeningNow, now)}
        />
      )}

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <ContinueLearningCard
          courses={data.continueLearning}
          hasCourses={hasCourses}
        />
        <div className="space-y-6">
          <LiveClassesCard liveClasses={data.liveClasses} now={now} />
          <DeadlinesCard deadlines={data.deadlines} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyActivityCard weeks={data.weeklyActivity} />
        <RecentResultsCard results={data.recentResults} />
      </div>

      <RecentNotes notes={data.notes} />
      <RecommendedCourses courses={data.recommended} />
    </div>
  );
}
