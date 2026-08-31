"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { FileText, Clock } from "lucide-react";
import { useGradeAnswerMutation } from "@/hooks/use-exams";
import type { ExamAttempt } from "@/types/exam";
import type { Question } from "@/types/question";

export default function GradeAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const gradeMutation = useGradeAnswerMutation();

  const [marksMap, setMarksMap] = useState<Record<string, number>>({});

  const { data: attemptData, isLoading } = useQuery({
    queryKey: ["attempt-details", attemptId],
    queryFn: async () => {
      const [attemptResponse, questionsResponse] = await Promise.all([
        apiClient.get(`/exams/attempts-details/${attemptId}`),
        apiClient.get(`/exams/questions`),
      ]);
      return {
        attempt: attemptResponse.data.data as ExamAttempt,
        questions: questionsResponse.data.data as Question[],
      };
    },
  });

  const attempt = attemptData?.attempt;
  const questions = attemptData?.questions ?? [];

  // Get questions that need manual grading (short_answer, essay)
  const writtenQuestions = questions.filter(
    (q) => q.type === "short_answer" || q.type === "essay",
  );

  const handleSubmitGrade = (questionId: string) => {
    const marksAwarded = marksMap[questionId];
    if (marksAwarded === undefined || marksAwarded < 0) return;

    gradeMutation.mutate({
      attemptId,
      input: {
        questionId,
        marksAwarded,
      },
    });
  };

  if (isLoading || !attempt) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          ← Back
        </button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-3xl md:text-[36px] text-[#0C1F33]"
              style={{ fontFamily: "'Marcellus', serif" }}
            >
              Grade Attempt
            </h1>
            <p className="text-base text-[#64748B] mt-1">
              {attempt.learnerName} • Attempt #{attempt.attemptNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm text-[#64748B]">
              <Clock className="w-4 h-4" />
              {attempt.totalMarks} total marks
            </span>
            <span
              className={`text-sm font-bold px-3 py-1 rounded-full ${
                attempt.graded
                  ? "bg-[#22A146]/10 text-[#22A146]"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              {attempt.graded ? "GRADED" : "PENDING"}
            </span>
          </div>
        </div>
      </div>

      {/* Written Questions */}
      {writtenQuestions.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E3E8EF] p-10 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            No written questions to grade. This exam is fully auto-graded.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {writtenQuestions.map((question) => {
            const studentAnswer = attempt.answers[question.id] as
              | string
              | undefined;
            const awardedMarks = marksMap[question.id];
            const isGraded = awardedMarks !== undefined && awardedMarks >= 0;

            return (
              <div
                key={question.id}
                className="bg-white rounded-xl border border-[#E3E8EF] p-6"
              >
                {/* Question */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#64748B] uppercase">
                      {question.type === "essay"
                        ? "Essay Question"
                        : "Short Answer"}
                    </span>
                    <span className="text-sm font-semibold text-[#0C1F33]">
                      Max Marks: {question.marks}
                    </span>
                  </div>
                  <p className="text-base text-[#0C1F33] leading-6">
                    {question.question}
                  </p>
                </div>

                {/* Student Answer */}
                <div className="bg-[#FBF9F4] rounded-lg p-4 mb-4">
                  <p className="text-xs font-bold text-[#64748B] uppercase mb-2">
                    Student&apos;s Answer
                  </p>
                  <p className="text-sm text-[#0C1F33] leading-6 whitespace-pre-wrap">
                    {studentAnswer || "No answer submitted"}
                  </p>
                </div>

                {/* Suggested Answer (for reference) */}
                {question.suggestedAnswer && (
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <p className="text-xs font-bold text-[#22A146] uppercase mb-2">
                      Suggested Answer
                    </p>
                    <p className="text-sm text-[#0C1F33] leading-6 whitespace-pre-wrap">
                      {question.suggestedAnswer}
                    </p>
                  </div>
                )}

                {/* Grading Input */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-[#0C1F33]">
                    Marks Awarded:
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={question.marks}
                    value={awardedMarks ?? ""}
                    onChange={(e) =>
                      setMarksMap({
                        ...marksMap,
                        [question.id]: Number(e.target.value),
                      })
                    }
                    className="w-24 px-3 py-2 border border-[#E3E8EF] rounded-lg text-sm"
                  />
                  <span className="text-sm text-[#64748B]">
                    / {question.marks}
                  </span>
                  <button
                    onClick={() => handleSubmitGrade(question.id)}
                    disabled={
                      awardedMarks === undefined ||
                      awardedMarks < 0 ||
                      gradeMutation.isPending
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isGraded
                        ? "bg-[#22A146]/10 text-[#22A146]"
                        : "bg-[#22A146] text-white hover:bg-[#1E9040]"
                    } disabled:opacity-50`}
                  >
                    {isGraded ? "✓ Graded" : "Submit Grade"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <div className="mt-8 flex items-center justify-between bg-white rounded-xl border border-[#E3E8EF] p-5">
        <div>
          <p className="text-sm font-semibold text-[#0C1F33]">
            Grading Summary
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            {writtenQuestions.length} written question(s) to grade manually.
            MCQ/True-False are auto-graded.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 border border-[#E3E8EF] text-[#0C1F33] rounded-lg text-sm font-semibold hover:bg-gray-50"
        >
          Done
        </button>
      </div>
    </div>
  );
}
