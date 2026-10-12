"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  Flame,
  GraduationCap,
  Hourglass,
  NotebookPen,
  PlayCircle,
  Star,
  XCircle,
} from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useDashboard } from "@/hooks/use-dashboard";
import type {
  ContinueLearningCourse,
  Deadline,
  LiveClass,
  RecentResult,
} from "@/types/dashboard";

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
    hour12: true,
  });
}

function timeAgo(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(value);
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function dueLabel(daysRemaining: number): string {
  if (daysRemaining <= 0) return "Due today";
  if (daysRemaining === 1) return "Due tomorrow";
  return `Due in ${daysRemaining} days`;
}

function continueHref(course: ContinueLearningCourse): string {
  if (course.type === "ONLINE_CLASS" && course.batchId) {
    return `/online-classes/${course.batchId}`;
  }
  if (course.nextLessonId) {
    return `/my-courses/${course.id}/lessons/${course.nextLessonId}`;
  }
  return "/my-courses";
}

function deadlineHref(deadline: Deadline): string {
  return deadline.kind === "EXAM"
    ? `/my-courses/${deadline.courseId}/exams`
    : `/my-courses/${deadline.courseId}/assignments`;
}

function resultHref(result: RecentResult): string {
  return result.kind === "EXAM" && result.examId
    ? `/my-courses/${result.courseId}/exams/${result.examId}/result`
    : `/my-courses/${result.courseId}/assignments`;
}

type ClassStatus = "LIVE" | "SOON" | "LATER";

function classStatus(cls: LiveClass, now: Date): ClassStatus {
  const start = new Date(cls.scheduledAt).getTime();
  const end = start + cls.durationMinutes * 60_000;
  if (now.getTime() >= start && now.getTime() <= end) return "LIVE";
  if (start - now.getTime() <= 30 * 60_000) return "SOON";
  return "LATER";
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
      <h2 className="text-[18px] text-[#0C1F33]" style={serif}>
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-[13px] font-semibold text-[#22A146] hover:underline"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#64748B]">{children}</p>;
}

export default function DashboardPage() {
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

  const { stats } = data;
  const hasCourses = stats.coursesInProgress + stats.coursesCompleted > 0;
  const happeningNow = data.liveClasses.find(
    (cls) => classStatus(cls, now) !== "LATER",
  );
  const maxWeekly = Math.max(
    1,
    ...data.weeklyActivity.map((w) => w.lessonsCompleted),
  );
  const weeklyTotal = data.weeklyActivity.reduce(
    (sum, w) => sum + w.lessonsCompleted,
    0,
  );

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
    <div className="p-6 md:p-10 space-y-6 md:space-y-8">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-3xl md:text-[36px] text-[#0C1F33]"
            style={serif}
          >
            {greeting()}, {data.learner.displayName}
          </h1>
          <p className="text-base text-[#64748B]">
            {!hasCourses
              ? "Find your first course to start learning."
              : stats.studiedToday
                ? "Nice work today — keep the momentum going."
                : "Pick up where you left off."}
          </p>
        </div>
        <Link
          href="/courses"
          className="text-sm font-semibold text-[#12304E] border border-[#E3E8EF] bg-white px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          Browse courses
        </Link>
      </div>

      {/* Live / starting-soon banner */}
      {happeningNow && (
        <div
          className={`rounded-xl px-5 py-4 flex flex-wrap items-center gap-4 ${
            classStatus(happeningNow, now) === "LIVE"
              ? "bg-[#22A146] text-white"
              : "bg-[#12304E] text-white"
          }`}
        >
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {classStatus(happeningNow, now) === "LIVE"
                ? "Your class is live now"
                : `Your class starts at ${formatTime(happeningNow.scheduledAt)}`}
              : {happeningNow.title}
            </p>
            <p className="text-xs text-white/80 truncate">
              {happeningNow.courseTitle} • {happeningNow.instructor}
            </p>
          </div>
          {happeningNow.meetingLink ? (
            <a
              href={happeningNow.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0C1F33] hover:bg-white/90"
            >
              <ExternalLink className="w-4 h-4" />
              Join class
            </a>
          ) : (
            <Link
              href={`/online-classes/${happeningNow.batchId}`}
              className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25"
            >
              View schedule
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
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

      {/* Continue learning + Live classes / Deadlines */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        <div className={`${card} p-6`}>
          <SectionHeader title="Continue learning" href="/my-courses" />
          {data.continueLearning.length === 0 ? (
            <div className="rounded-lg bg-[#FBF9F4] p-6 text-center">
              <GraduationCap className="w-10 h-10 text-[#B8912F] mx-auto mb-3" />
              <p className="text-sm text-[#0C1F33] font-semibold">
                {hasCourses
                  ? "You've finished all your courses!"
                  : "You haven't started a course yet"}
              </p>
              <Link
                href="/courses"
                className="inline-block mt-3 text-sm font-semibold text-[#22A146] hover:underline"
              >
                Browse courses
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {data.continueLearning.map((course) => {
                const isOnline = course.type === "ONLINE_CLASS";
                return (
                  <div
                    key={course.id}
                    className="flex flex-wrap sm:flex-nowrap items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="relative w-[88px] h-[60px] rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-[#12304E] to-[#2a5070]">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40">
                          <BookOpen className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0C1F33] truncate">
                        {course.title}
                      </p>
                      <p className="text-xs text-[#64748B] truncate mt-0.5">
                        {course.nextLessonTitle
                          ? `Next: ${course.nextLessonTitle}`
                          : isOnline
                            ? "Live online class"
                            : "No lessons yet"}
                      </p>
                      {course.totalLessons > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 max-w-[220px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#22A146] rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-[#64748B] whitespace-nowrap">
                            {course.completedLessons}/{course.totalLessons} lessons
                          </span>
                        </div>
                      )}
                    </div>
                    <Link
                      href={continueHref(course)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#12304E] text-white text-xs font-semibold rounded-lg hover:bg-[#1a4268] shrink-0"
                    >
                      {isOnline ? (
                        <CalendarDays className="w-3.5 h-3.5" />
                      ) : (
                        <PlayCircle className="w-3.5 h-3.5" />
                      )}
                      {isOnline
                        ? "Schedule"
                        : course.completedLessons > 0
                          ? "Resume"
                          : "Start"}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Live classes */}
          <div className={`${card} p-5`}>
            <SectionHeader title="Upcoming live classes" href="/online-classes" />
            {data.liveClasses.length === 0 ? (
              <EmptyText>No upcoming live classes.</EmptyText>
            ) : (
              <div className="space-y-3">
                {data.liveClasses.map((cls) => {
                  const status = classStatus(cls, now);
                  const date = new Date(cls.scheduledAt);
                  return (
                    <div key={cls.id} className="flex items-center gap-3">
                      <div className="w-11 h-12 bg-[#F9F6F0] rounded-lg flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[#B8912F] uppercase">
                          {date.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-[16px] font-bold text-[#0C1F33] leading-none">
                          {date.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#0C1F33] truncate">
                          {cls.title}
                        </p>
                        <p className="text-[11px] text-[#64748B] truncate">
                          {status === "LIVE" ? (
                            <span className="font-semibold text-[#22A146]">
                              Live now
                            </span>
                          ) : (
                            formatTime(cls.scheduledAt)
                          )}{" "}
                          • {cls.courseTitle}
                        </p>
                      </div>
                      {status !== "LATER" && cls.meetingLink ? (
                        <a
                          href={cls.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#22A146] text-white hover:bg-[#1E9040]"
                        >
                          Join
                        </a>
                      ) : (
                        <Link
                          href={`/online-classes/${cls.batchId}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E3E8EF] text-[#12304E] hover:bg-gray-50"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Deadlines */}
          <div className={`${card} p-5`}>
            <SectionHeader title="Deadlines" />
            {data.deadlines.length === 0 ? (
              <EmptyText>Nothing due — you&apos;re all set.</EmptyText>
            ) : (
              <div className="space-y-1">
                {data.deadlines.map((deadline) => {
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
                          <span
                            className={
                              urgent ? "font-semibold text-red-500" : ""
                            }
                          >
                            {dueLabel(deadline.daysRemaining)}
                          </span>{" "}
                          • {deadline.kind === "EXAM" ? "Exam" : "Assignment"} ·{" "}
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
        </div>
      </div>

      {/* Weekly activity + Recent results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${card} p-6`}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-[18px] text-[#0C1F33]" style={serif}>
                Your activity
              </h2>
              <p className="text-[12px] text-[#64748B]">
                Lessons completed per week · {weeklyTotal} in the last{" "}
                {data.weeklyActivity.length} weeks
              </p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-[160px]">
            {data.weeklyActivity.map((week, index) => {
              const isCurrent = index === data.weeklyActivity.length - 1;
              const height = (week.lessonsCompleted / maxWeekly) * 120;
              return (
                <div
                  key={week.weekStart}
                  className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full"
                  title={`Week of ${formatShortDate(`${week.weekStart}T00:00:00`)}: ${week.lessonsCompleted} lesson${week.lessonsCompleted === 1 ? "" : "s"}`}
                >
                  <span className="text-[10px] font-semibold text-[#64748B]">
                    {week.lessonsCompleted > 0 ? week.lessonsCompleted : ""}
                  </span>
                  <div
                    className={`w-full max-w-[36px] rounded-t-md ${
                      isCurrent ? "bg-[#22A146]" : "bg-[#12304E]"
                    }`}
                    style={{ height: `${Math.max(height, 4)}px`, opacity: week.lessonsCompleted ? 1 : 0.15 }}
                  />
                  <span
                    className={`text-[10px] whitespace-nowrap ${
                      isCurrent ? "font-semibold text-[#22A146]" : "text-[#94A3B8]"
                    }`}
                  >
                    {isCurrent
                      ? "This wk"
                      : formatShortDate(`${week.weekStart}T00:00:00`)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${card} p-6`}>
          <SectionHeader title="Recent results" href="/exams" />
          {data.recentResults.length === 0 ? (
            <EmptyText>
              Your exam and assignment results will appear here.
            </EmptyText>
          ) : (
            <div className="space-y-1">
              {data.recentResults.map((result) => {
                const meta = {
                  PASSED: {
                    icon: CheckCircle2,
                    label: "Passed",
                    className: "text-[#22A146] bg-[#22A146]/10",
                  },
                  FAILED: {
                    icon: XCircle,
                    label: "Not passed",
                    className: "text-red-600 bg-red-50",
                  },
                  GRADED: {
                    icon: CheckCircle2,
                    label: "Graded",
                    className: "text-[#2563EB] bg-[#2563EB]/10",
                  },
                  AWAITING_GRADE: {
                    icon: Hourglass,
                    label: "Awaiting grade",
                    className: "text-yellow-700 bg-yellow-50",
                  },
                }[result.status];
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
                        {result.kind === "EXAM" ? "Exam" : "Assignment"} ·{" "}
                        {result.courseTitle} • {timeAgo(result.submittedAt)}
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
                        {meta.label}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent notes */}
      {data.notes.length > 0 && (
        <div>
          <SectionHeader title="Recent notes" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {data.notes.map((note) => (
              <Link
                key={note.id}
                href={`/my-courses/${note.courseId}/lessons/${note.lessonId}`}
                className={`${card} p-5 border-l-[3px] border-l-[#B8912F] hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#B8912F] uppercase mb-1">
                  <NotebookPen className="w-3 h-3" />
                  <span className="truncate">{note.courseTitle}</span>
                </div>
                <p className="text-[13px] font-semibold text-[#0C1F33] truncate mb-1.5">
                  {note.lessonTitle}
                </p>
                <p className="text-[13px] text-[#4B5563] leading-relaxed line-clamp-3 whitespace-pre-line">
                  {note.text}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recommended */}
      {data.recommended.length > 0 && (
        <div>
          <SectionHeader
            title="Recommended for you"
            href="/courses"
            linkLabel="Browse all"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {data.recommended.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className={`${card} overflow-hidden hover:shadow-md transition-shadow`}
              >
                <div className="relative h-[150px] bg-gradient-to-br from-[#12304E] to-[#2a5070]">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30">
                      <BookOpen className="w-10 h-10" />
                    </div>
                  )}
                  {course.type === "ONLINE_CLASS" && (
                    <span className="absolute top-3 left-3 text-[9px] font-bold text-white bg-[#7C3AED] px-2 py-0.5 rounded">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3
                    className="text-[17px] text-[#0C1F33] leading-tight line-clamp-2"
                    style={serif}
                  >
                    {course.title}
                  </h3>
                  <p className="text-[13px] text-[#64748B] mt-1 truncate">
                    {course.instructor}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-[12px]">
                    <Star className="w-3.5 h-3.5 text-[#B8912F] fill-[#B8912F]" />
                    <span className="font-semibold text-[#0C1F33]">
                      {course.rating ?? "New"}
                    </span>
                    {course.ratingCount > 0 && (
                      <span className="text-[#94A3B8]">
                        ({course.ratingCount})
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
