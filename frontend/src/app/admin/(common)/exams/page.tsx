"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle, Users, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTypeBadge(type: string) {
  return type === "final"
    ? { label: "FINAL", className: "bg-red-50 text-red-600" }
    : { label: "PRACTICE", className: "bg-[#2563EB]/10 text-[#2563EB]" };
}

const TYPE_TABS = [
  { value: "", label: "All" },
  { value: "practice", label: "Practice" },
  { value: "final", label: "Final" },
];

export default function AdminExamsPage() {
  const [tab, setTab] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-exams", page, tab],
    queryFn: () => adminService.getExams(page, tab || undefined),
  });

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Exams
        </h1>
        <p className="text-base text-[#64748B]">
          {data?.total ?? 0} total exams
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E3E8EF] mb-6 overflow-x-auto">
        {TYPE_TABS.map((typeTab) => (
          <button
            key={typeTab.value}
            onClick={() => {
              setTab(typeTab.value);
              setPage(1);
            }}
            className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              tab === typeTab.value
                ? "border-[#22A146] text-[#22A146]"
                : "border-transparent text-[#64748B] hover:text-[#0C1F33]"
            }`}
          >
            {typeTab.label}
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
      {!isLoading && !isError && data?.exams.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No exams found.</p>
        </div>
      )}

      {/* Exam List */}
      {!isLoading && !isError && data && data.exams.length > 0 && (
        <div className="space-y-3">
          {data.exams.map((exam) => {
            const type = getTypeBadge(exam.type);
            return (
              <div
                key={exam.id}
                className="bg-white rounded-xl border border-[#E3E8EF] p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-semibold text-[#0C1F33]">
                        {exam.title}
                      </h2>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${type.className}`}
                      >
                        {type.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Course: {exam.courseTitle}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#64748B] flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {exam.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {exam.questionCount} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Pass: {exam.passMark}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {exam.attemptCount} attempts
                      </span>
                      <span>Max attempts: {exam.maxAttempts}</span>
                      <span className="text-[#94A3B8]">
                        Created: {formatDate(exam.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* View link */}
                  <Link
                    href={`/admin/exams/${exam.id}/attempts`}
                    className="flex items-center gap-1 text-sm font-semibold text-[#22A146] hover:underline shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                    View Attempts
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-md border border-[#E3E8EF] disabled:opacity-40"
          >
            ←
          </button>
          <span className="text-sm py-2">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={data.exams.length < 20}
            className="w-9 h-9 rounded-md border border-[#E3E8EF] disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
