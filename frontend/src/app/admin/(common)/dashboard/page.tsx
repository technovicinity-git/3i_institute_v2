"use client";

import { useState } from "react";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { serif } from "@/components/admin/dashboard/utils";
import { AttentionPanel } from "@/components/admin/dashboard/attention-panel";
import { KpiGrid } from "@/components/admin/dashboard/kpi-grid";
import { GrowthChart } from "@/components/admin/dashboard/growth-chart";
import { TodaysSessionsCard } from "@/components/admin/dashboard/todays-sessions-card";
import { TopCoursesTable } from "@/components/admin/dashboard/top-courses-table";
import { RecentSignupsCard } from "@/components/admin/dashboard/recent-signups-card";

export default function AdminDashboardPage() {
  // Captured once so render stays pure; good enough for "live now" labels.
  const [now] = useState(() => Date.now());
  const { data, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-red-600 font-medium">Failed to load dashboard.</p>
        <button
          onClick={() => refetch()}
          className="text-sm font-semibold text-[#22A146] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-3xl md:text-[36px] text-[#0C1F33]" style={serif}>
          Admin Dashboard
        </h1>
        <p className="text-base text-[#64748B]">
          {new Date(now).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}{" "}
          · Platform overview
        </p>
      </div>

      <AttentionPanel attention={data.attention} />

      <KpiGrid kpis={data.kpis} />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <GrowthChart trends={data.trends} />
        <TodaysSessionsCard sessions={data.todaysSessions} now={now} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <TopCoursesTable courses={data.topCourses} />
        <RecentSignupsCard accounts={data.recentAccounts} />
      </div>
    </div>
  );
}
