"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Calendar,
} from "lucide-react";
import {
  useSessionAttendance,
  useMarkAttendanceMutation,
} from "@/hooks/use-attendance";

function formatDate(dateStr: string): string {
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

const STATUS_OPTIONS = [
  {
    value: "present",
    label: "Present",
    icon: CheckCircle,
    color: "text-[#22A146]",
    activeBg: "bg-[#22A146]",
  },
  {
    value: "late",
    label: "Late",
    icon: Clock,
    color: "text-[#B8912F]",
    activeBg: "bg-[#B8912F]",
  },
  {
    value: "absent",
    label: "Absent",
    icon: XCircle,
    color: "text-red-600",
    activeBg: "bg-red-600",
  },
  {
    value: "excused",
    label: "Excused",
    icon: UserCheck,
    color: "text-[#2563EB]",
    activeBg: "bg-[#2563EB]",
  },
] as const;

export default function AttendancePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const { data, isLoading, isError } = useSessionAttendance(sessionId);
  const markMutation = useMarkAttendanceMutation();

  const [localStatuses, setLocalStatuses] = useState<
    Record<string, string | null>
  >({});

  const getStatus = (
    learnerId: string,
    originalStatus: string | null,
  ): string | null => {
    if (learnerId in localStatuses) {
      return localStatuses[learnerId];
    }
    return originalStatus;
  };

  const handleMark = (learnerId: string, status: string) => {
    // Optimistic update
    setLocalStatuses((prev) => ({ ...prev, [learnerId]: status }));

    markMutation.mutate({
      sessionId,
      learnerProfileId: learnerId,
      status,
    });
  };

  const markAllPresent = () => {
    if (!data) return;
    data.learners.forEach((learner) => {
      handleMark(learner.learnerProfileId, "present");
    });
  };

  const presentCount =
    data?.learners.filter(
      (l) => getStatus(l.learnerProfileId, l.status) === "present",
    ).length ?? 0;
  const totalCount = data?.learners.length ?? 0;

  return (
    <div className="p-6 md:p-10 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Mark Attendance
        </h1>
        {data && (
          <p className="text-base text-[#64748B] mt-2">
            {data.sessionTitle} • {formatDate(data.scheduledAt)} at{" "}
            {formatTime(data.scheduledAt)}
          </p>
        )}
      </div>

      {/* Summary bar */}
      {data && (
        <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#64748B]" />
            <span className="text-sm text-[#64748B]">
              {presentCount} of {totalCount} marked present
            </span>
          </div>
          <button
            onClick={markAllPresent}
            className="px-4 py-2 bg-[#12304E] text-white rounded-lg text-sm font-semibold hover:bg-[#1a4268]"
          >
            Mark All Present
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && data?.learners.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No learners enrolled in this batch.</p>
        </div>
      )}

      {/* Learner List */}
      {!isLoading && !isError && data && data.learners.length > 0 && (
        <div className="space-y-2">
          {data.learners.map((learner) => {
            const currentStatus = getStatus(
              learner.learnerProfileId,
              learner.status,
            );

            return (
              <div
                key={learner.learnerProfileId}
                className="bg-white rounded-xl border border-[#E3E8EF] p-4 flex items-center justify-between flex-wrap gap-3"
              >
                {/* Learner info */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#B8912F]">
                      {learner.learnerName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-[#0C1F33]">
                    {learner.learnerName}
                  </span>
                </div>

                {/* Status buttons */}
                <div className="flex items-center gap-2">
                  {STATUS_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isActive = currentStatus === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleMark(learner.learnerProfileId, option.value)
                        }
                        disabled={markMutation.isPending}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          isActive
                            ? `${option.activeBg} text-white border-transparent`
                            : "border-[#E3E8EF] text-[#64748B] hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
