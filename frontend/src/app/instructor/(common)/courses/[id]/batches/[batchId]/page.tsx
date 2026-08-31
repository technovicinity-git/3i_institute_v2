"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Calendar, Clock, Plus, Video } from "lucide-react";
import { batchService } from "@/services/batch.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useAddSessionMutation,
  useCloseBatchMutation,
} from "@/hooks/use-batches";

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
  const queryClient = useQueryClient();

  const {
    data: batch,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["batch", batchId],
    queryFn: () => batchService.getBatchById(batchId),
  });

  const addSessionMutation = useAddSessionMutation();
  const closeBatchMutation = useCloseBatchMutation();

  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    scheduledAt: "",
    durationMinutes: 60,
    meetingLink: "",
    notes: "",
  });

  const handleAddSession = () => {
    if (!newSession.title || !newSession.scheduledAt) {
      toast.error("Title and date/time are required");
      return;
    }

    addSessionMutation.mutate(
      {
        batchId,
        input: {
          title: newSession.title,
          scheduledAt: new Date(newSession.scheduledAt).toISOString(),
          durationMinutes: Number(newSession.durationMinutes),
          meetingLink: newSession.meetingLink || undefined,
          notes: newSession.notes || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowAddSession(false);
          setNewSession({
            title: "",
            scheduledAt: "",
            durationMinutes: 60,
            meetingLink: "",
            notes: "",
          });
          toast.success("Session added successfully");
          queryClient.invalidateQueries({
            queryKey: ["batch", batchId],
          });
        },
      },
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-[900px] mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.push(`/instructor/courses/${courseId}/batches`)}
          className="text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          ← Back to batches
        </button>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
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
              <button
                onClick={() => setShowAddSession(!showAddSession)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Session
              </button>
            </div>

            {/* Add session form */}
            {showAddSession && (
              <div className="bg-white border border-[#E3E8EF] rounded-xl p-6 mb-6 space-y-4">
                <h3 className="font-semibold text-[#0C1F33]">
                  Add New Session
                </h3>
                <input
                  value={newSession.title}
                  onChange={(e) =>
                    setNewSession({ ...newSession, title: e.target.value })
                  }
                  placeholder="Session title"
                  className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="datetime-local"
                    value={newSession.scheduledAt}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        scheduledAt: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={newSession.durationMinutes}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        durationMinutes: Number(e.target.value),
                      })
                    }
                    placeholder="Duration (min)"
                    className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm"
                  />
                </div>
                <input
                  value={newSession.meetingLink}
                  onChange={(e) =>
                    setNewSession({
                      ...newSession,
                      meetingLink: e.target.value,
                    })
                  }
                  placeholder="Meeting link (optional)"
                  className="w-full px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddSession(false)}
                    className="px-4 py-2 border border-[#E3E8EF] rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSession}
                    disabled={addSessionMutation.isPending}
                    className="px-4 py-2 bg-[#22A146] text-white rounded-lg text-sm font-semibold"
                  >
                    {addSessionMutation.isPending ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            )}

            {/* Sessions list */}
            <div className="space-y-3">
              {batch.sessions.map((session, index) => {
                const isPast = new Date(session.scheduledAt) < new Date();
                return (
                  <div
                    key={session.id}
                    className="bg-white border border-[#E3E8EF] rounded-xl p-5 flex items-center gap-4"
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
                    {session.meetingLink && (
                      <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm font-semibold text-[#22A146] hover:underline shrink-0"
                      >
                        <Video className="w-4 h-4" />
                        Join
                      </a>
                    )}
                    {isPast && (
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Completed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
