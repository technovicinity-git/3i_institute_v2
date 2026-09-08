"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useCourseExams } from "@/hooks/use-learner-exams";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No deadline";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CourseExamsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { activeProfile } = useProfileStore();

  const {
    data: exams,
    isLoading,
    isError,
  } = useCourseExams(courseId, activeProfile?.id ?? "");

  return (
    <div className="p-6 md:p-10 max-w-[800px] mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.push("/my-courses")}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to My Courses
        </button>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Exams
        </h1>
        <p className="text-base text-[#64748B]">
          {exams?.length ?? 0} exams available
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && !isError && exams?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            No exams available for this course yet.
          </p>
        </div>
      )}

      {!isLoading && !isError && exams && exams.length > 0 && (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-[#E3E8EF] p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        exam.type === "final"
                          ? "bg-red-50 text-red-600"
                          : "bg-[#2563EB]/10 text-[#2563EB]"
                      }`}
                    >
                      {exam.type.toUpperCase()}
                    </span>
                    {exam.passed && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#22A146]/10 text-[#22A146]">
                        PASSED
                      </span>
                    )}
                  </div>
                  <h2
                    className="text-lg font-semibold text-[#0C1F33]"
                    style={{ fontFamily: "'Marcellus', serif" }}
                  >
                    {exam.title}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[#64748B] flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {exam.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {exam.questions.length} questions
                    </span>
                    <span>Pass: {exam.passMark}%</span>
                    <span>
                      Attempts: {exam.attemptCount}/{exam.maxAttempts}
                    </span>
                  </div>
                  {exam.bestScore !== null && (
                    <p className="text-xs text-[#22A146] mt-2 font-semibold">
                      Best Score: {exam.bestScore}/{exam.totalMarks}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  {exam.attemptCount >= exam.maxAttempts ? (
                    <span className="flex items-center gap-1 text-sm font-semibold text-[#64748B]">
                      <XCircle className="w-4 h-4" />
                      Max Attempts Reached
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        router.push(
                          `/my-courses/${courseId}/exams/${exam.id}/take`,
                        )
                      }
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
                    >
                      Take Exam
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
