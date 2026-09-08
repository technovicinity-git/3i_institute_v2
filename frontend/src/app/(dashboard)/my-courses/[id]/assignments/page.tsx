"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import {
  useCourseAssignments,
  useSubmitAssignmentMutation,
} from "@/hooks/use-learner-assignments";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "No deadline";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CourseAssignmentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { activeProfile } = useProfileStore();

  const { data: assignments, isLoading } = useCourseAssignments(
    courseId,
    activeProfile?.id ?? "",
  );
  const submitMutation = useSubmitAssignmentMutation();

  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(
    null,
  );
  const [content, setContent] = useState("");

  const handleSubmit = (assignmentId: string) => {
    if (!activeProfile || !content.trim()) return;

    submitMutation.mutate(
      {
        assignmentId,
        learnerProfileId: activeProfile.id,
        content: content.trim(),
      },
      {
        onSuccess: () => {
          setSelectedAssignment(null);
          setContent("");
        },
      },
    );
  };

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
          Assignments
        </h1>
        <p className="text-base text-[#64748B]">
          {assignments?.length ?? 0} assignments for this course
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && assignments?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No assignments for this course yet.</p>
        </div>
      )}

      {!isLoading && assignments && assignments.length > 0 && (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white rounded-xl border border-[#E3E8EF] p-6"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h2
                      className="text-lg font-semibold text-[#0C1F33]"
                      style={{ fontFamily: "'Marcellus', serif" }}
                    >
                      {assignment.title}
                    </h2>
                    {assignment.submitted && assignment.submission?.graded && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#22A146]/10 text-[#22A146]">
                        GRADED
                      </span>
                    )}
                    {assignment.submitted && !assignment.submission?.graded && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-yellow-50 text-yellow-700">
                        SUBMITTED
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#64748B] mb-3">
                    {assignment.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due: {formatDate(assignment.dueDate)}
                    </span>
                    <span>{assignment.totalMarks} marks</span>
                  </div>
                </div>
              </div>

              {/* Submission status */}
              {assignment.submitted ? (
                <div className="bg-[#F9F6F0] rounded-lg p-4">
                  <p className="text-xs font-bold text-[#64748B] uppercase mb-2">
                    Your Submission
                  </p>
                  <p className="text-sm text-[#0C1F33] leading-6">
                    {assignment.submission?.content}
                  </p>
                  {assignment.submission?.graded && (
                    <div className="mt-3 pt-3 border-t border-[#E3E8EF]">
                      <p className="text-sm font-bold text-[#22A146]">
                        Marks: {assignment.submission.marksAwarded}/
                        {assignment.totalMarks}
                      </p>
                      {assignment.submission.feedback && (
                        <p className="text-sm text-[#0C1F33] mt-1">
                          <strong>Feedback:</strong>{" "}
                          {assignment.submission.feedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {selectedAssignment === assignment.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={5}
                        placeholder="Write your answer..."
                        className="w-full px-4 py-3 border border-[#E3E8EF] rounded-lg text-sm"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedAssignment(null);
                            setContent("");
                          }}
                          className="px-5 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubmit(assignment.id)}
                          disabled={!content.trim() || submitMutation.isPending}
                          className="px-5 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                        >
                          {submitMutation.isPending
                            ? "Submitting..."
                            : "Submit Assignment"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedAssignment(assignment.id)}
                      className="px-5 py-2.5 bg-[#12304E] text-white rounded-lg text-sm font-semibold hover:bg-[#1a4268]"
                    >
                      Submit Assignment
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
