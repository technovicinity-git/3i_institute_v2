"use client";

import { useMemo } from "react";
import {
  Video,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  MessageSquare,
  CheckCircle,
  XCircle,
  UserCheck,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useProfileStore } from "@/stores/profile-store";
import { useLearnerLiveClasses } from "@/hooks/use-learner-live-classes";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getRelativeDay(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, tomorrow)) return "Tomorrow";

  const diffDays = Math.floor(
    (date.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays > 0 && diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  return formatDate(dateStr);
}

function getAttendanceBadge(status: string | null) {
  if (!status) return null;
  const map: Record<string, { label: string; className: string }> = {
    present: { label: "PRESENT", className: "bg-[#22A146]/10 text-[#22A146]" },
    absent: { label: "ABSENT", className: "bg-red-50 text-red-600" },
    late: { label: "LATE", className: "bg-yellow-50 text-yellow-700" },
    excused: { label: "EXCUSED", className: "bg-[#2563EB]/10 text-[#2563EB]" },
  };
  return map[status] ?? null;
}

export default function LearnerLiveClassesPage() {
  const { activeProfile } = useProfileStore();
  const {
    data: sessions,
    isLoading,
    isError,
  } = useLearnerLiveClasses(activeProfile?.id ?? "");

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    if (!sessions) return {};

    const groups: Record<string, typeof sessions> = {};

    sessions.forEach((session) => {
      const dateKey = new Date(session.scheduledAt).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey]!.push(session);
    });

    return groups;
  }, [sessions]);

  // Find next upcoming session
  const nextSession = sessions?.[0] ?? null;

  return (
    <div className="p-6 md:p-10 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Live Classes
        </h1>
        <p className="text-base text-[#64748B]">
          {sessions?.length ?? 0} upcoming sessions
        </p>
      </div>

      {/* Next session highlight */}
      {nextSession &&
        isSameDay(new Date(nextSession.scheduledAt), new Date()) && (
          <div className="mb-6 bg-[#22A146]/10 border border-[#22A146]/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#22A146] flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#22A146] uppercase tracking-wide">
                  Happening Today
                </p>
                <p className="text-sm font-semibold text-[#0C1F33]">
                  {nextSession.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#64748B] mb-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTime(nextSession.scheduledAt)} •{" "}
                {nextSession.durationMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                {nextSession.instructorName}
              </span>
            </div>
            {nextSession.meetingLink ? (
              <a
                href={nextSession.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
              >
                <ExternalLink className="w-4 h-4" />
                Join Class Now
              </a>
            ) : (
              <span className="text-xs font-semibold text-yellow-600">
                Meeting link will be shared soon
              </span>
            )}
          </div>
        )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load sessions.</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && sessions?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B] mb-2">No upcoming live classes.</p>
          <p className="text-xs text-[#94A3B8]">
            You&apos;ll see sessions here once your instructor schedules them.
          </p>
        </div>
      )}

      {/* Sessions grouped by date */}
      {!isLoading && !isError && sessions && sessions.length > 0 && (
        <div className="space-y-8">
          {Object.entries(groupedSessions).map(([dateKey, daySessions]) => (
            <div key={dateKey}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <p className="text-sm font-bold text-[#0C1F33]">
                    {getRelativeDay(daySessions[0]!.scheduledAt)}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {formatDateFull(daySessions[0]!.scheduledAt)}
                  </p>
                </div>
                <div className="flex-1 h-px bg-[#E3E8EF]" />
                <span className="text-xs text-[#64748B]">
                  {daySessions.length} session
                  {daySessions.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Sessions */}
              <div className="space-y-3">
                {daySessions.map((session) => {
                  const attendance = getAttendanceBadge(
                    session.attendanceStatus,
                  );

                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-xl border border-[#E3E8EF] p-5 flex items-center justify-between flex-wrap gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Time box */}
                        <div className="w-16 h-16 rounded-lg bg-[#F9F6F0] flex flex-col items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-[#B8912F] mb-1" />
                          <span className="text-[11px] font-bold text-[#0C1F33]">
                            {formatTime(session.scheduledAt)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-[#0C1F33] truncate">
                              {session.title}
                            </p>
                            {attendance && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${attendance.className}`}
                              >
                                {attendance.label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#64748B] mt-1 truncate">
                            {session.courseTitle} • {session.batchName}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748B] flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.durationMinutes} min
                            </span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {session.instructorName}
                            </span>
                          </div>
                          {session.notes && (
                            <p className="text-xs text-[#94A3B8] mt-1.5 italic truncate">
                              {session.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Link
                          href={`/chat?courseId=${session.courseId}&courseTitle=${encodeURIComponent(session.courseTitle)}&batchId=${session.batchId}&batchName=${encodeURIComponent(session.batchName)}`}
                          className="flex items-center gap-1.5 px-3 py-2 border border-[#E3E8EF] rounded-lg text-xs font-semibold text-[#0C1F33] hover:bg-gray-50"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </Link>

                        {session.meetingLink ? (
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#22A146] text-white rounded-lg text-xs font-semibold hover:bg-[#1E9040]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Join
                          </a>
                        ) : (
                          <span className="text-xs font-semibold text-yellow-600 px-3 py-2">
                            No link yet
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
