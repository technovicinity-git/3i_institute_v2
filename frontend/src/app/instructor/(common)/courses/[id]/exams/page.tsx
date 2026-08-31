"use client";

import { useParams, useRouter } from "next/navigation";
import { FileText, Clock, Plus, CheckCircle, AlertCircle } from "lucide-react";
import { useCourseExams } from "@/hooks/use-exams";

function getTypeBadge(type: string) {
  return type === "final"
    ? { label: "FINAL", className: "bg-red-50 text-red-600" }
    : { label: "PRACTICE", className: "bg-[#2563EB]/10 text-[#2563EB]" };
}

export default function ExamsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { data: exams, isLoading, isError } = useCourseExams(courseId);

  return (
    <div className="p-6 md:p-10 max-w-[1000px] mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.push("/instructor/courses")}
          className="text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          ← Back to courses
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-3xl md:text-[36px] text-[#0C1F33]"
              style={{ fontFamily: "'Marcellus', serif" }}
            >
              Exams
            </h1>
            <p className="text-base text-[#64748B]">
              {exams?.length ?? 0} exams for this course
            </p>
          </div>
          <button
            onClick={() =>
              router.push(`/instructor/courses/${courseId}/exams/create`)
            }
            className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
          >
            <Plus className="w-4 h-4" />
            Create Exam
          </button>
        </div>
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
            No exams yet. Create your first exam.
          </p>
        </div>
      )}

      {!isLoading && !isError && exams && exams.length > 0 && (
        <div className="space-y-4">
          {exams.map((exam) => {
            const type = getTypeBadge(exam.type);
            return (
              <div
                key={exam.id}
                className="bg-white rounded-xl border border-[#E3E8EF] p-6"
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${type.className}`}
                      >
                        {type.label}
                      </span>
                      {exam.openDate &&
                        new Date(exam.openDate) > new Date() && (
                          <span className="text-[11px] font-semibold text-yellow-600">
                            SCHEDULED
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
                        {exam.duration} minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {exam.questions.length} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Pass: {exam.passMark}%
                      </span>
                      <span>Max attempts: {exam.maxAttempts}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
