"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
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

export default function AdminExamAttemptsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const {
    data: attempts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-exam-attempts", examId],
    queryFn: () => adminService.getExamAttempts(examId),
  });

  const [filter, setFilter] = useState<string>("all");

  const filteredAttempts = attempts?.filter((attempt) => {
    if (filter === "graded") return attempt.graded;
    if (filter === "pending") return !attempt.graded;
    if (filter === "passed") return attempt.passed === true;
    if (filter === "failed") return attempt.passed === false;
    return true;
  });

  const pendingCount = attempts?.filter((a) => !a.graded).length ?? 0;
  const passedCount = attempts?.filter((a) => a.passed === true).length ?? 0;
  const failedCount = attempts?.filter((a) => a.passed === false).length ?? 0;

  return (
    <div className="p-6 md:p-10 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/admin/exams")}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to exams
        </button>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Exam Attempts
        </h1>
        <p className="text-base text-[#64748B] mt-1">
          {attempts?.length ?? 0} total attempts
        </p>
      </div>

      {/* Summary cards */}
      {attempts && attempts.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 text-center">
            <p className="text-xl font-bold text-[#0C1F33]">
              {attempts.length}
            </p>
            <p className="text-xs text-[#64748B] mt-1">Total</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 text-center">
            <p className="text-xl font-bold text-[#22A146]">{passedCount}</p>
            <p className="text-xs text-[#64748B] mt-1">Passed</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 text-center">
            <p className="text-xl font-bold text-red-600">{failedCount}</p>
            <p className="text-xs text-[#64748B] mt-1">Failed</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 text-center">
            <p className="text-xl font-bold text-orange-500">{pendingCount}</p>
            <p className="text-xs text-[#64748B] mt-1">Pending Grading</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-3 border-b border-[#E3E8EF] mb-6 overflow-x-auto">
        {[
          { value: "all", label: "All" },
          { value: "graded", label: "Graded" },
          { value: "pending", label: "Pending" },
          { value: "passed", label: "Passed" },
          { value: "failed", label: "Failed" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              filter === tab.value
                ? "border-[#22A146] text-[#22A146]"
                : "border-transparent text-[#64748B] hover:text-[#0C1F33]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filteredAttempts?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No attempts found.</p>
        </div>
      )}

      {/* Attempts list */}
      {!isLoading &&
        !isError &&
        filteredAttempts &&
        filteredAttempts.length > 0 && (
          <div className="space-y-3">
            {filteredAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="bg-white rounded-xl border border-[#E3E8EF] p-5 flex items-center justify-between flex-wrap gap-3"
              >
                {/* Learner info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-[#B8912F]">
                      {attempt.learnerName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0C1F33]">
                      {attempt.learnerName}
                    </p>
                    <p className="text-xs text-[#64748B] mt-1">
                      Attempt #{attempt.attemptNumber} •{" "}
                      {attempt.submittedAt
                        ? `Submitted ${formatDate(attempt.submittedAt)} at ${formatTime(attempt.submittedAt)}`
                        : `Started ${formatDate(attempt.startedAt)}`}
                    </p>
                  </div>
                </div>

                {/* Score + Status */}
                <div className="flex items-center gap-4 shrink-0">
                  {/* Score */}
                  <div className="text-center">
                    <p className="text-sm font-bold text-[#0C1F33]">
                      {attempt.score !== null
                        ? `${attempt.score}/${attempt.totalMarks}`
                        : "—"}
                    </p>
                    <p className="text-[10px] text-[#64748B] uppercase">
                      Score
                    </p>
                  </div>

                  {/* Pass/Fail */}
                  {attempt.passed === true && (
                    <span className="flex items-center gap-1 text-xs font-bold text-[#22A146]">
                      <CheckCircle className="w-4 h-4" />
                      PASSED
                    </span>
                  )}
                  {attempt.passed === false && (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600">
                      <XCircle className="w-4 h-4" />
                      FAILED
                    </span>
                  )}

                  {/* Grading status */}
                  {!attempt.graded && (
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                      <AlertCircle className="w-4 h-4" />
                      PENDING
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
