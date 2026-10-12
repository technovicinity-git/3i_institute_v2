"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileWarning,
  GraduationCap,
  MessageSquareWarning,
  ShieldAlert,
  Star,
  UserPlus,
  Users,
  Video,
} from "lucide-react";

interface AdminDashboard {
  kpis: {
    accounts: { total: number; last30Days: number; previous30Days: number };
    learnerProfiles: number;
    activeInstructors: number;
    courses: { published: number; total: number };
    subscriptions: {
      active: number;
      activeSeats: number;
      estimatedMonthlyRevenue: number;
    };
    enrolments: { total: number; last30Days: number; previous30Days: number };
    certificates: { total: number; last30Days: number };
  };
  attention: {
    pendingInstructorApplications: number;
    pendingCourses: number;
    pendingWaivers: number;
    openChatReports: number;
    pastDueSubscriptions: number;
    overdueGrading: number;
  };
  trends: Array<{ weekStart: string; signups: number; enrolments: number }>;
  topCourses: Array<{
    id: string;
    title: string;
    type: string;
    instructor: string;
    enrolmentsLast30Days: number;
    totalEnrolments: number;
    averageRating: number | null;
  }>;
  recentAccounts: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  todaysSessions: Array<{
    id: string;
    title: string;
    scheduledAt: string;
    durationMinutes: number;
    hasMeetingLink: boolean;
    batchName: string;
    courseId: string;
    courseTitle: string;
    instructor: string;
    enrolled: number;
  }>;
}

const card = "bg-white rounded-xl border border-[#E3E8EF]";
const serif = { fontFamily: "'Marcellus', serif" };

function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function timeAgo(value: string): string {
  const hours = Math.floor((Date.now() - new Date(value).getTime()) / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(value);
}

/** Percentage change of the last 30 days vs the 30 days before. */
function Change({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    return current > 0 ? (
      <span className="text-xs font-semibold text-[#22A146]">New activity</span>
    ) : (
      <span className="text-xs text-[#94A3B8]">No change</span>
    );
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-[#22A146]" : "text-red-600"}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {Math.abs(pct)}% vs prior 30d
    </span>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel = "View all",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-[#0C1F33]">{title}</h2>
      {href && (
        <Link
          href={href}
          className="text-sm font-semibold text-[#22A146] hover:underline"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  // Captured once so render stays pure; good enough for "live now" labels.
  const [now] = useState(() => Date.now());
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () =>
      (await apiClient.get("/admin/dashboard")).data.data as AdminDashboard,
    staleTime: 60 * 1000,
  });

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

  const { kpis, attention } = data;

  const attentionItems = [
    {
      count: attention.pendingInstructorApplications,
      label: "Instructor applications",
      hint: "Awaiting approval",
      icon: GraduationCap,
      href: "/admin/instructors",
    },
    {
      count: attention.pendingCourses,
      label: "Courses to review",
      hint: "Submitted for publishing",
      icon: BookOpen,
      href: "/admin/courses",
    },
    {
      count: attention.pendingWaivers,
      label: "Waiver requests",
      hint: "Awaiting a decision",
      icon: FileWarning,
      href: "/admin/waivers",
    },
    {
      count: attention.openChatReports,
      label: "Reported messages",
      hint: "Chat moderation queue",
      icon: MessageSquareWarning,
      href: "/admin/moderation",
    },
    {
      count: attention.pastDueSubscriptions,
      label: "Past-due subscriptions",
      hint: "Payment failed",
      icon: CreditCard,
      href: "/admin/subscriptions",
    },
    {
      count: attention.overdueGrading,
      label: "Overdue grading",
      hint: "Exam submissions waiting 3+ days",
      icon: ClipboardCheck,
      href: "/admin/exams",
    },
  ];
  const openItems = attentionItems.filter((item) => item.count > 0);

  const kpiCards = [
    {
      icon: Users,
      label: "Accounts",
      value: kpis.accounts.total,
      detail: `${kpis.learnerProfiles} learner profiles`,
      change: (
        <Change
          current={kpis.accounts.last30Days}
          previous={kpis.accounts.previous30Days}
        />
      ),
      sub: `+${kpis.accounts.last30Days} in last 30 days`,
      color: "bg-[#2563EB]",
      href: "/admin/users",
    },
    {
      icon: UserPlus,
      label: "Enrolments",
      value: kpis.enrolments.total,
      detail: `+${kpis.enrolments.last30Days} in last 30 days`,
      change: (
        <Change
          current={kpis.enrolments.last30Days}
          previous={kpis.enrolments.previous30Days}
        />
      ),
      color: "bg-[#22A146]",
      href: "/admin/reports",
    },
    {
      icon: CreditCard,
      label: "Active subscriptions",
      value: kpis.subscriptions.active,
      detail: `${kpis.subscriptions.activeSeats} seats`,
      change: (
        <span className="text-xs font-semibold text-[#0C1F33]">
          ${kpis.subscriptions.estimatedMonthlyRevenue.toFixed(2)}
          <span className="font-normal text-[#64748B]"> est. / month</span>
        </span>
      ),
      color: "bg-[#EA580C]",
      href: "/admin/subscriptions",
    },
    {
      icon: BookOpen,
      label: "Published courses",
      value: kpis.courses.published,
      detail: `${kpis.courses.total} total incl. drafts`,
      change: (
        <span className="text-xs text-[#64748B]">
          {kpis.activeInstructors} active instructors
        </span>
      ),
      color: "bg-[#7C3AED]",
      href: "/admin/courses",
    },
    {
      icon: Award,
      label: "Certificates issued",
      value: kpis.certificates.total,
      detail: `+${kpis.certificates.last30Days} in last 30 days`,
      change: null,
      color: "bg-[#B8912F]",
      href: "/admin/certificates",
    },
  ];

  const maxTrend = Math.max(
    1,
    ...data.trends.flatMap((t) => [t.signups, t.enrolments]),
  );
  const trendTotals = data.trends.reduce(
    (acc, t) => ({
      signups: acc.signups + t.signups,
      enrolments: acc.enrolments + t.enrolments,
    }),
    { signups: 0, enrolments: 0 },
  );

  return (
    <div className="p-6 md:p-10 space-y-6 md:space-y-8">
      <div>
        <h1 className="text-3xl md:text-[36px] text-[#0C1F33]" style={serif}>
          Admin Dashboard
        </h1>
        <p className="text-base text-[#64748B]">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}{" "}
          · Platform overview
        </p>
      </div>

      {/* Needs attention */}
      <section className={`${card} overflow-hidden`}>
        <div
          className={`flex items-center gap-3 px-5 py-3 border-b ${
            openItems.length
              ? "bg-yellow-50 border-yellow-200"
              : "bg-[#22A146]/5 border-[#E3E8EF]"
          }`}
        >
          {openItems.length ? (
            <ShieldAlert className="w-5 h-5 text-yellow-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#22A146]" />
          )}
          <p
            className={`text-sm font-semibold ${openItems.length ? "text-yellow-800" : "text-[#1D8F3D]"}`}
          >
            {openItems.length
              ? `Needs your attention · ${openItems.reduce((sum, i) => sum + i.count, 0)} items`
              : "All clear — nothing waiting for review."}
          </p>
        </div>
        {openItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 divide-y sm:divide-y-0 divide-[#E3E8EF]">
            {openItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFC] sm:border-b sm:border-[#F1F5F9]"
                >
                  <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-yellow-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0C1F33]">
                      <span className="text-lg mr-1.5">{item.count}</span>
                      {item.label}
                    </p>
                    <p className="text-xs text-[#64748B] truncate">
                      {item.hint}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0C1F33]" />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className={`${card} p-5 flex flex-col gap-3 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color}`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0C1F33]">
                  {kpi.value.toLocaleString()}
                </p>
                <p className="text-sm text-[#0C1F33]">{kpi.label}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{kpi.detail}</p>
              </div>
              {kpi.change && <div className="mt-auto">{kpi.change}</div>}
            </Link>
          );
        })}
      </div>

      {/* Growth trend + Today's classes */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <section className={`${card} p-6`}>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-[#0C1F33]">Growth</h2>
              <p className="text-xs text-[#64748B]">
                Weekly sign-ups and enrolments · last {data.trends.length} weeks
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#2563EB]" />
                Sign-ups ({trendTotals.signups})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#22A146]" />
                Enrolments ({trendTotals.enrolments})
              </span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 sm:gap-3 h-[200px]">
            {data.trends.map((week, index) => (
              <div
                key={week.weekStart}
                className="flex-1 h-full flex flex-col justify-end items-center gap-1.5"
                title={`Week of ${formatShortDate(`${week.weekStart}T00:00:00Z`)}: ${week.signups} sign-ups, ${week.enrolments} enrolments`}
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
                  {index === data.trends.length - 1
                    ? "This wk"
                    : index % 2 === 0
                      ? formatShortDate(`${week.weekStart}T00:00:00Z`)
                      : ""}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className={`${card} p-5`}>
          <SectionHeader title="Today's live classes" />
          {data.todaysSessions.length === 0 ? (
            <p className="text-sm text-[#64748B]">
              No live classes scheduled today.
            </p>
          ) : (
            <div className="space-y-3">
              {data.todaysSessions.map((s) => {
                const start = new Date(s.scheduledAt).getTime();
                const live =
                  now >= start && now <= start + s.durationMinutes * 60_000;
                return (
                  <Link
                    key={s.id}
                    href={`/admin/courses/${s.courseId}`}
                    className="flex items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-[#F8FAFC]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4 text-[#B8912F]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0C1F33] truncate">
                        {s.title}
                      </p>
                      <p className="text-xs text-[#64748B] truncate">
                        {live ? (
                          <span className="font-semibold text-[#22A146]">
                            Live now
                          </span>
                        ) : (
                          formatTime(s.scheduledAt)
                        )}{" "}
                        · {s.courseTitle} · {s.instructor}
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        {s.enrolled} enrolled
                        {!s.hasMeetingLink && (
                          <span className="ml-2 inline-flex items-center gap-1 font-semibold text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            No meeting link
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Top courses + Recent sign-ups */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <section className={`${card} p-6`}>
          <SectionHeader title="Top courses · last 30 days" href="/admin/courses" />
          {data.topCourses.length === 0 ? (
            <p className="text-sm text-[#64748B]">
              No enrolments in the last 30 days.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-[#64748B] border-b border-[#E3E8EF]">
                    <th className="pb-2 font-semibold">Course</th>
                    <th className="pb-2 font-semibold text-right">New</th>
                    <th className="pb-2 font-semibold text-right">Total</th>
                    <th className="pb-2 font-semibold text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {data.topCourses.map((course, index) => (
                    <tr key={course.id}>
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/courses/${course.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <span className="w-6 text-xs font-bold text-[#94A3B8]">
                            #{index + 1}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-semibold text-[#0C1F33] truncate group-hover:underline">
                              {course.title}
                            </span>
                            <span className="block text-xs text-[#64748B] truncate">
                              {course.instructor}
                              {course.type === "ONLINE_CLASS" && " · Live class"}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 text-right font-semibold text-[#22A146]">
                        +{course.enrolmentsLast30Days}
                      </td>
                      <td className="py-3 text-right text-[#0C1F33]">
                        {course.totalEnrolments}
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[#0C1F33]">
                          <Star className="w-3.5 h-3.5 text-[#B8912F] fill-[#B8912F]" />
                          {course.averageRating ?? "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={`${card} p-5`}>
          <SectionHeader title="Recent sign-ups" href="/admin/users" />
          <div className="space-y-3">
            {data.recentAccounts.map((account) => {
              const isInstructor = account.role === "Instructor";
              const row = (
                <>
                  <div className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center shrink-0 text-xs font-bold text-[#12304E]">
                    {account.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0C1F33] truncate">
                      {account.name}
                    </p>
                    <p className="text-xs text-[#64748B] truncate">
                      {account.email}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#F1F5F9] text-[#64748B]">
                      {account.role}
                    </span>
                    <p className="text-[11px] text-[#94A3B8] mt-1">
                      {timeAgo(account.createdAt)}
                    </p>
                  </div>
                </>
              );
              return isInstructor ? (
                <Link
                  key={account.id}
                  href={`/admin/instructors/${account.id}`}
                  className="flex items-center gap-3 rounded-lg p-1 -m-1 hover:bg-[#F8FAFC]"
                >
                  {row}
                </Link>
              ) : (
                <div key={account.id} className="flex items-center gap-3">
                  {row}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
