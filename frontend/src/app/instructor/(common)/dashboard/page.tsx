"use client";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Users,
  Video,
  Award,
  Star,
  Clock,
  UserPlus,
  AlertCircle,
  ExternalLink,
  FileText,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useInstructorDashboard } from "@/hooks/use-instructor-dashboard";
import { isGradingOverdue, waitingLabel } from "@/lib/grading";
import { formatDate } from "@/lib/date-format";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour(s) ago`;
  if (diffDays < 7) return `${diffDays} day(s) ago`;
  return formatDate(dateStr, "dayMonth");
}

export default function InstructorDashboardPage() {
  const { data, isLoading, isError } = useInstructorDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">Failed to load dashboard</p>
      </div>
    );
  }

  const stats = [
    {
      icon: BookOpen,
      label: "My Courses",
      value: String(data.stats.totalCourses),
      color: "bg-[#22A146]",
    },
    {
      icon: Users,
      label: "Total Students",
      value: String(data.stats.totalStudents),
      color: "bg-[#2563EB]",
    },
    {
      icon: Video,
      label: "Upcoming Sessions",
      value: String(data.stats.upcomingSessions),
      color: "bg-[#7C3AED]",
    },
    {
      icon: Award,
      label: "Certificates",
      value: String(data.stats.totalCertificates),
      color: "bg-[#B8912F]",
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Welcome */}
      <div>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33] mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Instructor Dashboard
        </h1>
        <p className="text-base text-[#64748B]">
          Overview of your courses and students.
        </p>
      </div>

      {/* Pending grading */}
      {data.stats.pendingGrading > 0 && (
        <div className="bg-white rounded-xl border border-yellow-200 overflow-hidden">
          <div className="flex items-center gap-3 bg-yellow-50 px-5 py-3 border-b border-yellow-200">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
            <p className="flex-1 text-sm text-yellow-800">
              <strong>{data.stats.pendingGrading}</strong> exam{" "}
              {data.stats.pendingGrading === 1 ? "attempt is" : "attempts are"}{" "}
              waiting for grading
            </p>
            <Link
              href="/instructor/grading"
              className="text-sm font-semibold text-yellow-800 hover:underline shrink-0"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(data.pendingAttempts ?? []).map((attempt) => {
              const overdue = isGradingOverdue(attempt.submittedAt);
              return (
              <Link
                key={attempt.id}
                href={`/instructor/courses/${attempt.courseId}/exams/${attempt.examId}/attempts/${attempt.id}/grade`}
                className={`group flex items-center gap-3 px-5 py-3 transition-colors ${
                  overdue ? "bg-red-50/40 hover:bg-red-50" : "hover:bg-[#F8FAFC]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    overdue ? "bg-red-100" : "bg-[#F9F6F0]"
                  }`}
                >
                  {overdue ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#B8912F]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C1F33] truncate">
                    {attempt.learnerName}
                    <span className="font-normal text-[#64748B]">
                      {" "}
                      · {attempt.examTitle}
                      {attempt.attemptNumber > 1 &&
                        ` (attempt ${attempt.attemptNumber})`}
                    </span>
                  </p>
                  <p className="text-xs text-[#64748B] truncate">
                    {attempt.courseTitle} •{" "}
                    <span className={overdue ? "font-semibold text-red-600" : ""}>
                      {waitingLabel(attempt.submittedAt)}
                    </span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-[#12304E] px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-[#1a4268]">
                  Grade
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
              );
            })}
          </div>
          {data.stats.pendingGrading > (data.pendingAttempts?.length ?? 0) && (
            <p className="px-5 py-2.5 text-xs text-[#64748B] bg-[#F8FAFC] border-t border-gray-100">
              Showing the {data.pendingAttempts?.length ?? 0} oldest of{" "}
              {data.stats.pendingGrading} submissions.
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0C1F33]">
                  {stat.value}
                </p>
                <p className="text-sm text-[#64748B]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Courses + Upcoming Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Courses */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0C1F33]">Your Courses</h2>
            <Link
              href="/instructor/courses"
              className="text-sm font-semibold text-[#22A146] hover:underline"
            >
              View all
            </Link>
          </div>
          {data.recentCourses.length === 0 ? (
            <p className="text-sm text-[#64748B]">No courses yet.</p>
          ) : (
            <div className="space-y-4">
              {data.recentCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-4">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      width={56}
                      height={56}
                      className="rounded-lg object-cover w-14 h-14"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-[#F9F6F0] flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-[#B8912F]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0C1F33] truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {course.enrolmentCount} students
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm shrink-0">
                    <Star className="w-3.5 h-3.5 text-[#B8912F] fill-[#B8912F]" />
                    <span className="text-[#0C1F33] font-medium">
                      {course.averageRating ?? "New"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#0C1F33]">
              Upcoming Classes
            </h2>
            <Link
              href="/instructor/live-classes"
              className="text-sm font-semibold text-[#22A146] hover:underline"
            >
              View all
            </Link>
          </div>
          {data.upcomingClasses.length === 0 ? (
            <p className="text-sm text-[#64748B]">No upcoming sessions.</p>
          ) : (
            <div className="space-y-4">
              {data.upcomingClasses.map((cls) => (
                <div
                  key={cls.sessionId}
                  className="flex items-center gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-[#64748B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0C1F33] truncate">
                      {cls.title}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {formatDate(cls.scheduledAt, "dayMonth")} •{" "}
                      {formatDate(cls.scheduledAt, "time")}
                    </p>
                  </div>
                  {cls.meetingLink && (
                    <a
                      href={cls.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-gray-50"
                    >
                      <ExternalLink className="w-4 h-4 text-[#22A146]" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Enrolments */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#0C1F33]">
            Recent Enrolments
          </h2>
          <Link
            href="/instructor/students"
            className="text-sm font-semibold text-[#22A146] hover:underline"
          >
            View all students
          </Link>
        </div>
        {data.recentEnrolments.length === 0 ? (
          <p className="text-sm text-[#64748B]">No enrolments yet.</p>
        ) : (
          <div className="space-y-3">
            {data.recentEnrolments.map((enrolment) => (
              <div key={enrolment.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4 text-[#B8912F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C1F33]">
                    {enrolment.learnerName}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Enrolled in {enrolment.courseTitle}
                  </p>
                </div>
                <span className="text-xs text-[#64748B] shrink-0">
                  {timeAgo(enrolment.enrolledAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
