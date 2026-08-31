"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useExamAttempts } from "@/hooks/use-exams";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
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

export default function ExamAttemptsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const examId = params.examId as string;

  const { data: attempts, isLoading, isError } = useExamAttempts(examId);

  const pendingGrading = attempts?.filter((a) => !a.graded) ?? [];
  const graded = attempts?.filter((a) => a.graded) ?? [];

  return (
    <div className="p-6 md:p-10 max-w-[900px] mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.push(`/instructor/courses/${courseId}/exams`)}
          className="text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          ← Back to exams
        </button>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Exam Attempts
        </h1>
        <p className="text-base text-[#64748B]">
          {attempts?.length ?? 0} total attempts • {pendingGrading.length} needs
          grading
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && !isError && attempts?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No attempts yet.</p>
        </div>
      )}

      {/* Pending Grading */}
      {pendingGrading.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[#0C1F33] mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Needs Grading
          </h2>
          <div className="space-y-3">
            {pendingGrading.map((attempt) => (
              <Link
                key={attempt.id}
                href={`/instructor/attempts/${attempt.id}/grade`}
                className="bg-white rounded-xl border border-orange-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0C1F33]">
                    {attempt.learnerName} — Attempt #{attempt.attemptNumber}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">
                    Submitted:{" "}
                    {formatDate(attempt.submittedAt ?? attempt.startedAt)} at{" "}
                    {formatTime(attempt.submittedAt ?? attempt.startedAt)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
                  Grade Now
                  <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Graded */}
      {graded.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-[#0C1F33] mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#22A146]" />
            Graded
          </h2>
          <div className="space-y-3">
            {graded.map((attempt) => (
              <div
                key={attempt.id}
                className="bg-white rounded-xl border border-[#E3E8EF] p-5 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0C1F33]">
                    {attempt.learnerName} — Attempt #{attempt.attemptNumber}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">
                    Score: {attempt.score}/{attempt.totalMarks} •{" "}
                    {attempt.passed ? "Passed" : "Failed"}
                  </p>
                </div>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                    attempt.passed
                      ? "bg-[#22A146]/10 text-[#22A146]"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {attempt.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
