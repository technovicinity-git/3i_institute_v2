"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  Users,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
} from "lucide-react";
import {
  useSubmissions,
  useGradeSubmissionMutation,
} from "@/hooks/use-assignments";
import type { AssignmentSubmission } from "@/types/assignment";

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

export default function AssignmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const {
    data: submissions,
    isLoading,
    isError,
  } = useSubmissions(assignmentId);
  const gradeMutation = useGradeSubmissionMutation();

  const [selectedSubmission, setSelectedSubmission] =
    useState<AssignmentSubmission | null>(null);
  const [marks, setMarks] = useState<number | "">("");
  const [feedback, setFeedback] = useState("");

  const pendingGrading = submissions?.filter((s) => !s.graded) ?? [];
  const graded = submissions?.filter((s) => s.graded) ?? [];

  const handleOpenGrading = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setMarks(submission.marksAwarded ?? "");
    setFeedback(submission.feedback ?? "");
  };

  const handleCloseGrading = () => {
    setSelectedSubmission(null);
    setMarks("");
    setFeedback("");
  };

  const handleSubmitGrade = () => {
    if (!selectedSubmission || marks === "") return;

    gradeMutation.mutate(
      {
        submissionId: selectedSubmission.id,
        marksAwarded: Number(marks),
        feedback,
      },
      {
        onSuccess: () => {
          handleCloseGrading();
        },
      },
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/instructor/assignments")}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to assignments
        </button>
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Submissions
        </h1>
        <p className="text-base text-[#64748B] mt-1">
          {submissions?.length ?? 0} total • {pendingGrading.length} needs
          grading
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && submissions?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No submissions yet.</p>
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
            {pendingGrading.map((submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-xl border border-orange-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-[#B8912F]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0C1F33]">
                      {submission.learnerName}
                    </p>
                    <p className="text-xs text-[#64748B] mt-1">
                      Submitted: {formatDate(submission.submittedAt)} at{" "}
                      {formatTime(submission.submittedAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenGrading(submission)}
                  className="px-4 py-2 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040]"
                >
                  Grade
                </button>
              </div>
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
            {graded.map((submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-xl border border-[#E3E8EF] p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-[#64748B]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0C1F33]">
                      {submission.learnerName}
                    </p>
                    <p className="text-xs text-[#64748B] mt-1">
                      Marks: {submission.marksAwarded} •{" "}
                      {submission.feedback || "No feedback"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenGrading(submission)}
                  className="text-sm font-semibold text-[#2563EB] hover:underline"
                >
                  Edit Grade
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCloseGrading}
          />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-[600px] max-h-[80vh] overflow-y-auto z-10">
            <h3 className="text-lg font-semibold text-[#0C1F33] mb-1">
              Grade Submission
            </h3>
            <p className="text-sm text-[#64748B] mb-5">
              {selectedSubmission.learnerName} • Submitted{" "}
              {formatDate(selectedSubmission.submittedAt)}
            </p>

            {/* Student's answer */}
            <div className="bg-[#FBF9F4] rounded-lg p-4 mb-4">
              <p className="text-xs font-bold text-[#64748B] uppercase mb-2">
                Student&apos;s Answer
              </p>
              <p className="text-sm text-[#0C1F33] leading-6 whitespace-pre-wrap">
                {selectedSubmission.content}
              </p>
            </div>

            {/* File attachment */}
            {selectedSubmission.fileUrl && (
              <a
                href={selectedSubmission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline mb-4"
              >
                <Download className="w-4 h-4" />
                View attached file
              </a>
            )}

            {/* Marks input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
                Marks Awarded
              </label>
              <input
                type="number"
                min={0}
                value={marks}
                onChange={(e) =>
                  setMarks(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-32 px-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm"
                placeholder="0"
              />
            </div>

            {/* Feedback */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#0C1F33] mb-2">
                Feedback (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                placeholder="Provide feedback to the student..."
                className="w-full px-3 py-2 border border-[#E3E8EF] rounded-lg text-sm"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseGrading}
                className="flex-1 py-2.5 border border-[#E3E8EF] rounded-lg text-sm font-semibold text-[#0C1F33]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitGrade}
                disabled={marks === "" || gradeMutation.isPending}
                className="flex-1 py-2.5 bg-[#22A146] text-white rounded-lg text-sm font-semibold hover:bg-[#1E9040] disabled:opacity-50"
              >
                {gradeMutation.isPending ? "Saving..." : "Submit Grade"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
