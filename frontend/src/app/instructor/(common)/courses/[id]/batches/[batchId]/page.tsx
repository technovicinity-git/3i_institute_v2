"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  Clock,
  Plus,
  Video,
  MessageSquare,
  ChevronLeft,
  Edit3,
} from "lucide-react";
import { batchService } from "@/services/batch.service";
import { useQuery } from "@tanstack/react-query";
import { CreateSessionModal } from "@/components/instructor/create-session-modal";
import { EditSessionModal } from "@/components/instructor/edit-session-modal";
import Link from "next/link";
import type { Session } from "@/types/batch";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function BatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const batchId = params.batchId as string;

  const {
    data: batch,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["batch", batchId],
    queryFn: () => batchService.getBatchById(batchId),
  });

  const [showCreateSession, setShowCreateSession] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
          </div>
        )}

        {isError && (
          <div className="text-center py-20">
            <p className="text-red-600">Failed to load batch</p>
          </div>
        )}

        {!isLoading && batch && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h1
                  className="text-3xl md:text-[36px] text-[#0C1F33]"
                  style={{ fontFamily: "'Marcellus', serif" }}
                >
                  {batch.name}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {batch.enrolmentCount}/{batch.capacity} enrolled
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {batch.sessions.length} sessions
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/chat?courseId=${courseId}&courseTitle=${encodeURIComponent(batch.course?.title ?? "Course")}&batchId=${batchId}&batchName=${encodeURIComponent(batch.name)}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#12304E] text-white rounded-lg text-sm font-semibold hover:bg-[#1a4268]"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Chat
                </Link>
                <button
                  onClick={() => setShowCreateSession(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
                >
                  <Plus className="w-4 h-4" />
                  Add Session
                </button>
              </div>
            </div>

            {/* Sessions list */}
            {batch.sessions.length === 0 ? (
              <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-[#64748B] mb-4">No sessions yet.</p>
                <button
                  onClick={() => setShowCreateSession(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
                >
                  <Plus className="w-4 h-4" />
                  Add First Session
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {batch.sessions.map((session, index) => {
                  const isPast = new Date(session.scheduledAt) < new Date();
                  return (
                    <div
                      key={session.id}
                      className="bg-white border border-[#E3E8EF] rounded-xl p-5 flex items-center gap-4 flex-wrap"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-[#B8912F]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0C1F33]">
                          Session {index + 1}: {session.title}
                        </p>
                        <p className="text-xs text-[#64748B]">
                          {formatDate(session.scheduledAt)} at{" "}
                          {formatTime(session.scheduledAt)} •{" "}
                          {session.durationMinutes} min
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {session.meetingLink && !isPast && (
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-sm font-semibold text-[#22A146] hover:bg-emerald-100 transition-colors"
                          >
                            <Video className="w-4 h-4" />
                            Join
                          </a>
                        )}

                        <Link
                          href={`/instructor/attendance/${session.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm font-semibold text-[#2563EB] hover:bg-blue-100 transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          Attendance
                        </Link>

                        <button
                          onClick={() => setEditingSession(session)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-[#64748B] hover:bg-gray-100 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>

                        {isPast && (
                          <span className="inline-flex items-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateSession && (
        <CreateSessionModal
          batchId={batchId}
          onClose={() => setShowCreateSession(false)}
        />
      )}

      {/* Edit Session Modal */}
      {editingSession && (
        <EditSessionModal
          session={editingSession}
          onClose={() => setEditingSession(null)}
        />
      )}
    </div>
  );
}
