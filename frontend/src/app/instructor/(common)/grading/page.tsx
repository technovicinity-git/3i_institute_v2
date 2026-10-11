"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
} from "lucide-react";
import { usePendingAttempts } from "@/hooks/use-exams";
import {
  GRADING_OVERDUE_DAYS,
  isGradingOverdue,
  waitingLabel,
} from "@/lib/grading";

export default function GradingPage() {
  const { data: attempts, isLoading, isError } = usePendingAttempts();

  const [courseId, setCourseId] = useState("");
  const [examId, setExamId] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Filter options come from the pending attempts themselves, so only
  // courses and exams with something to grade are offered.
  const courses = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of attempts ?? []) map.set(a.courseId, a.courseTitle);
    return [...map].map(([id, title]) => ({ id, title }));
  }, [attempts]);

  const exams = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of attempts ?? []) {
      if (!courseId || a.courseId === courseId) map.set(a.examId, a.examTitle);
    }
    return [...map].map(([id, title]) => ({ id, title }));
  }, [attempts, courseId]);

  const filtered = (attempts ?? []).filter(
    (a) =>
      (!courseId || a.courseId === courseId) &&
      (!examId || a.examId === examId) &&
      (!overdueOnly || isGradingOverdue(a.submittedAt)),
  );

  const overdueCount = (attempts ?? []).filter((a) =>
    isGradingOverdue(a.submittedAt),
  ).length;

  const selectClass =
    "h-10 rounded-lg border border-[#E3E8EF] bg-white px-3 text-sm text-[#0C1F33] focus:outline-none focus:ring-2 focus:ring-[#12304E]/20";

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Needs Grading
        </h1>
        <p className="text-base text-[#64748B]">
          {attempts?.length ?? 0} submission
          {attempts?.length === 1 ? "" : "s"} waiting, oldest first
          {overdueCount > 0 && (
            <span className="text-red-600">
              {" "}
              · {overdueCount} overdue
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      {(attempts?.length ?? 0) > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setExamId("");
            }}
            className={selectClass}
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <select
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            className={selectClass}
          >
            <option value="">All exams</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-[#0C1F33] cursor-pointer">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="h-4 w-4 accent-[#12304E]"
            />
            Overdue only ({GRADING_OVERDUE_DAYS}+ days)
          </label>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center py-20">
          <p className="text-red-600 font-medium">
            Failed to load submissions.
          </p>
        </div>
      )}

      {/* All caught up */}
      {!isLoading && !isError && attempts?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <CheckCircle2 className="w-12 h-12 text-[#22A146] mx-auto mb-4" />
          <p className="font-semibold text-[#0C1F33]">All caught up</p>
          <p className="mt-1 text-sm text-[#64748B]">
            There are no exam submissions waiting for grading.
          </p>
        </div>
      )}

      {/* Filters matched nothing */}
      {!isLoading &&
        !isError &&
        (attempts?.length ?? 0) > 0 &&
        filtered.length === 0 && (
          <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
            <p className="text-[#64748B]">
              No submissions match these filters.
            </p>
          </div>
        )}

      {/* List */}
      {filtered.length > 0 && (
        <div className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden divide-y divide-[#E3E8EF]">
          {filtered.map((attempt) => {
            const overdue = isGradingOverdue(attempt.submittedAt);
            return (
              <Link
                key={attempt.id}
                href={`/instructor/courses/${attempt.courseId}/exams/${attempt.examId}/attempts/${attempt.id}/grade`}
                className={`group flex items-center gap-4 px-5 py-4 transition-colors ${
                  overdue
                    ? "bg-red-50/40 hover:bg-red-50"
                    : "hover:bg-[#F8FAFC]"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    overdue ? "bg-red-100" : "bg-[#F9F6F0]"
                  }`}
                >
                  {overdue ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-[#B8912F]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C1F33] truncate">
                    {attempt.learnerName}
                    <span className="font-normal text-[#64748B]">
                      {" "}
                      · {attempt.examTitle}
                      {attempt.attemptNumber > 1 &&
                        ` (attempt ${attempt.attemptNumber})`}
                    </span>
                  </p>
                  <p className="text-xs text-[#64748B] truncate mt-0.5">
                    {attempt.courseTitle} •{" "}
                    <span
                      className={overdue ? "font-semibold text-red-600" : ""}
                    >
                      {waitingLabel(attempt.submittedAt)}
                    </span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 shrink-0 rounded-lg bg-[#12304E] px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-[#1a4268]">
                  Grade
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
