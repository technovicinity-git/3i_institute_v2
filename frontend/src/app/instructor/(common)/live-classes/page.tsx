"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  Calendar,
  Clock,
  Users,
  ExternalLink,
  AlertTriangle,
  MessageSquare,
  Plus,
  ChevronRight,
} from "lucide-react";
import {
  useInstructorSessions,
  useInstructorBatches,
} from "@/hooks/use-batches";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
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

function sessionsConflict(
  a: { scheduledAt: string; durationMinutes: number },
  b: { scheduledAt: string; durationMinutes: number },
): boolean {
  const aStart = new Date(a.scheduledAt).getTime();
  const aEnd = aStart + a.durationMinutes * 60 * 1000;
  const bStart = new Date(b.scheduledAt).getTime();
  const bEnd = bStart + b.durationMinutes * 60 * 1000;

  return aStart < bEnd && bStart < aEnd;
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    UPCOMING: {
      label: "UPCOMING",
      className: "bg-[#2563EB]/10 text-[#2563EB]",
    },
    ACTIVE: { label: "ACTIVE", className: "bg-[#22A146]/10 text-[#22A146]" },
    COMPLETED: { label: "COMPLETED", className: "bg-gray-100 text-gray-600" },
    CANCELLED: { label: "CANCELLED", className: "bg-red-50 text-red-600" },
  };
  return (
    statusMap[status] ?? {
      label: status,
      className: "bg-gray-100 text-gray-600",
    }
  );
}

export default function InstructorLiveClassesPage() {
  const router = useRouter();
  const { data: sessions, isLoading: sessionsLoading } =
    useInstructorSessions();
  const { data: batches, isLoading: batchesLoading } = useInstructorBatches();
  const [tab, setTab] = useState<"upcoming" | "batches">("upcoming");

  // Detect schedule conflicts
  const conflicts = useMemo(() => {
    if (!sessions) return new Set<string>();

    const conflictIds = new Set<string>();

    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const a = sessions[i]!;
        const b = sessions[j]!;

        if (
          isSameDay(new Date(a.scheduledAt), new Date(b.scheduledAt)) &&
          sessionsConflict(a, b)
        ) {
          conflictIds.add(a.id);
          conflictIds.add(b.id);
        }
      }
    }

    return conflictIds;
  }, [sessions]);

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

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Live Classes
        </h1>
        <p className="text-base text-[#64748B]">
          {sessions?.length ?? 0} upcoming sessions across{" "}
          {batches?.length ?? 0} batches
        </p>
      </div>

      {/* Conflict alert */}
      {conflicts.size > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              Schedule conflict detected
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              {conflicts.size} sessions overlap with each other. Please review
              and reschedule.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E3E8EF] mb-6">
        <button
          onClick={() => setTab("upcoming")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "upcoming"
              ? "border-[#22A146] text-[#22A146]"
              : "border-transparent text-[#64748B] hover:text-[#0C1F33]"
          }`}
        >
          Upcoming Schedule ({sessions?.length ?? 0})
        </button>
        <button
          onClick={() => setTab("batches")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === "batches"
              ? "border-[#22A146] text-[#22A146]"
              : "border-transparent text-[#64748B] hover:text-[#0C1F33]"
          }`}
        >
          All Batches ({batches?.length ?? 0})
        </button>
      </div>

      {/* Upcoming Tab */}
      {tab === "upcoming" && (
        <>
          {sessionsLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
            </div>
          )}

          {!sessionsLoading && sessions?.length === 0 && (
            <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[#64748B]">No upcoming sessions.</p>
            </div>
          )}

          {!sessionsLoading && sessions && sessions.length > 0 && (
            <div className="space-y-8">
              {Object.entries(groupedSessions).map(([dateKey, daySessions]) => (
                <div key={dateKey}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-bold text-[#0C1F33]">
                      {formatDate(daySessions[0]!.scheduledAt)}
                    </span>
                    <div className="flex-1 h-px bg-[#E3E8EF]" />
                    <span className="text-xs text-[#64748B]">
                      {daySessions.length} session
                      {daySessions.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Sessions */}
                  <div className="space-y-3">
                    {daySessions.map((session) => {
                      const hasConflict = conflicts.has(session.id);

                      return (
                        <div
                          key={session.id}
                          className={`bg-white rounded-xl border p-5 flex items-center justify-between flex-wrap gap-4 ${
                            hasConflict
                              ? "border-yellow-300 bg-yellow-50/30"
                              : "border-[#E3E8EF]"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-14 h-14 rounded-lg bg-[#F9F6F0] flex flex-col items-center justify-center shrink-0">
                              <Clock className="w-4 h-4 text-[#B8912F] mb-1" />
                              <span className="text-[10px] font-bold text-[#64748B]">
                                {formatTime(session.scheduledAt)}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-[#0C1F33] truncate">
                                  {session.title}
                                </p>
                                {hasConflict && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
                                    <AlertTriangle className="w-3 h-3" />
                                    CONFLICT
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#64748B] mt-1 truncate">
                                {session.courseTitle} • {session.batchName}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748B]">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {session.durationMinutes} min
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {session.enrolmentCount} enrolled
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            <button
                              onClick={() =>
                                router.push(
                                  `/chat?courseId=${session.courseId}&courseTitle=${encodeURIComponent(session.courseTitle)}&batchId=${session.batchId}&batchName=${encodeURIComponent(session.batchName)}`,
                                )
                              }
                              className="flex items-center gap-1.5 px-3 py-2 border border-[#E3E8EF] rounded-lg text-xs font-semibold text-[#0C1F33] hover:bg-gray-50"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Chat
                            </button>

                            <button
                              onClick={() =>
                                router.push(
                                  `/instructor/courses/${session.courseId}/batches/${session.batchId}`,
                                )
                              }
                              className="flex items-center gap-1.5 px-3 py-2 border border-[#E3E8EF] rounded-lg text-xs font-semibold text-[#0C1F33] hover:bg-gray-50"
                            >
                              Details
                            </button>

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
                              <span className="text-xs font-semibold text-yellow-600 px-2">
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
        </>
      )}

      {/* Batches Tab */}
      {tab === "batches" && (
        <>
          {batchesLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
            </div>
          )}

          {!batchesLoading && batches?.length === 0 && (
            <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-[#64748B]">No batches created yet.</p>
            </div>
          )}

          {!batchesLoading && batches && batches.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {batches.map((batch) => {
                const status = getStatusBadge(batch.status);
                return (
                  <div
                    key={batch.id}
                    className="bg-white rounded-xl border border-[#E3E8EF] p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-[#0C1F33] truncate">
                          {batch.name}
                        </h3>
                        <p className="text-xs text-[#64748B] mt-1 truncate">
                          {batch.courseTitle}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center bg-[#FBF9F4] rounded-lg py-2.5">
                        <p className="text-base font-bold text-[#0C1F33]">
                          {batch.enrolmentCount}
                        </p>
                        <p className="text-[10px] text-[#64748B] uppercase mt-0.5">
                          Enrolled
                        </p>
                      </div>
                      <div className="text-center bg-[#FBF9F4] rounded-lg py-2.5">
                        <p className="text-base font-bold text-[#0C1F33]">
                          {batch.capacity}
                        </p>
                        <p className="text-[10px] text-[#64748B] uppercase mt-0.5">
                          Capacity
                        </p>
                      </div>
                      <div className="text-center bg-[#FBF9F4] rounded-lg py-2.5">
                        <p className="text-base font-bold text-[#0C1F33]">
                          {batch.sessionCount}
                        </p>
                        <p className="text-[10px] text-[#64748B] uppercase mt-0.5">
                          Sessions
                        </p>
                      </div>
                    </div>

                    {batch.nextSessionAt && (
                      <div className="flex items-center gap-2 mb-4 text-xs text-[#64748B]">
                        <Calendar className="w-3.5 h-3.5 text-[#B8912F]" />
                        Next: {formatDate(batch.nextSessionAt)} at{" "}
                        {formatTime(batch.nextSessionAt)}
                      </div>
                    )}

                    <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                      <button
                        onClick={() =>
                          router.push(
                            `/instructor/courses/${batch.courseId}/batches/${batch.id}`,
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#12304E] text-white rounded-lg text-xs font-semibold hover:bg-[#1a4268]"
                      >
                        View Batch
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/chat?courseId=${batch.courseId}&courseTitle=${encodeURIComponent(batch.courseTitle)}&batchId=${batch.id}&batchName=${encodeURIComponent(batch.name)}`,
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-2 border border-[#E3E8EF] rounded-lg text-xs font-semibold text-[#0C1F33] hover:bg-gray-50"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Chat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
