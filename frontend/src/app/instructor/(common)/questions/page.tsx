"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Eye, Search } from "lucide-react";
import {
  useMyQuestions,
  useDeleteQuestionMutation,
} from "@/hooks/use-questions";
import type { Question } from "@/types/question";

function getTypeBadge(type: string) {
  const typeMap: Record<string, { label: string; className: string }> = {
    mcq: { label: "MCQ", className: "bg-[#2563EB]/10 text-[#2563EB]" },
    multi_select: {
      label: "MULTI SELECT",
      className: "bg-[#7C3AED]/10 text-[#7C3AED]",
    },
    true_false: {
      label: "TRUE/FALSE",
      className: "bg-[#22A146]/10 text-[#22A146]",
    },
    short_answer: {
      label: "SHORT ANSWER",
      className: "bg-[#B8912F]/10 text-[#B8912F]",
    },
    essay: { label: "ESSAY", className: "bg-[#EA580C]/10 text-[#EA580C]" },
  };
  return (
    typeMap[type] ?? {
      label: type.toUpperCase(),
      className: "bg-gray-100 text-gray-600",
    }
  );
}

function getDifficultyBadge(difficulty: string) {
  const diffMap: Record<string, string> = {
    easy: "text-[#22A146]",
    medium: "text-[#B8912F]",
    hard: "text-red-600",
  };
  return diffMap[difficulty] ?? "text-gray-500";
}

export default function QuestionsPage() {
  const router = useRouter();
  const { data: questions, isLoading, isError } = useMyQuestions();
  const deleteMutation = useDeleteQuestionMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredQuestions = questions?.filter((q) => {
    const matchesSearch = q.question
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || q.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (questionId: string) => {
    if (confirmDelete === questionId) {
      deleteMutation.mutate(questionId, {
        onSuccess: () => setConfirmDelete(null),
      });
    } else {
      setConfirmDelete(questionId);
    }
  };

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1
            className="text-3xl md:text-[36px] text-[#0C1F33]"
            style={{ fontFamily: "'Marcellus', serif" }}
          >
            Question Bank
          </h1>
          <p className="text-base text-[#64748B]">
            {questions?.length ?? 0} questions
          </p>
        </div>
        <button
          onClick={() => router.push("/instructor/questions/create")}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
        >
          <Plus className="w-4 h-4" />
          Create Question
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 bg-white border border-[#E3E8EF] rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          <option value="mcq">MCQ</option>
          <option value="multi_select">Multi Select</option>
          <option value="true_false">True/False</option>
          <option value="short_answer">Short Answer</option>
          <option value="essay">Essay</option>
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filteredQuestions?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <p className="text-[#64748B]">No questions found.</p>
        </div>
      )}

      {/* Question List */}
      {!isLoading &&
        !isError &&
        filteredQuestions &&
        filteredQuestions.length > 0 && (
          <div className="space-y-3">
            {filteredQuestions.map((question) => {
              const type = getTypeBadge(question.type);
              return (
                <div
                  key={question.id}
                  className="bg-white rounded-xl border border-[#E3E8EF] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${type.className}`}
                        >
                          {type.label}
                        </span>
                        <span
                          className={`text-[11px] font-semibold uppercase ${getDifficultyBadge(question.difficulty)}`}
                        >
                          {question.difficulty}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {question.marks} marks
                        </span>
                      </div>
                      <p className="text-sm text-[#0C1F33] leading-6">
                        {question.question}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(question.id)}
                      disabled={deleteMutation.isPending}
                      className={`p-2 rounded-lg transition-colors shrink-0 ${
                        confirmDelete === question.id
                          ? "bg-red-50 text-red-700"
                          : "hover:bg-red-50 text-red-500"
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {confirmDelete === question.id && (
                    <p className="text-xs text-red-600 mt-2">
                      Click again to confirm delete
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
