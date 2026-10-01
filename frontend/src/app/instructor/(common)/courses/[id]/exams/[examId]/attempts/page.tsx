"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Award, CheckCircle, ChevronLeft, Eye, Users } from "lucide-react";
import {
  useCourseExams,
  useExamAttempts,
  useIssueOnlineFinalExamCertificatesMutation,
} from "@/hooks/use-exams";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";
import { CourseActions } from "@/components/instructor/CourseActions";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Not submitted";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ExamAttemptsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const examId = params.examId as string;

  const { data: attempts, isLoading, isError } = useExamAttempts(examId);
  const { data: courseExams } = useCourseExams(courseId);
  const { data: courses } = useInstructorCourses();
  const course = courses?.find((item) => item.id === courseId);
  const exam = courseExams?.find((item) => item.id === examId);
  const issueCertificatesMutation = useIssueOnlineFinalExamCertificatesMutation();
  const pendingCount = attempts?.filter((attempt) => !attempt.graded).length ?? 0;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <button
          onClick={() => router.push(`/instructor/courses/${courseId}/exams`)}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back to exams
        </button>
        {course && <CourseActions courseId={courseId} courseType={course.type} />}
        <h1 className="text-3xl md:text-[36px] text-[#0C1F33]" style={{ fontFamily: "'Marcellus', serif" }}>
          Exam Attempts
        </h1>
        <p className="text-base text-[#64748B]">
          {attempts?.length ?? 0} total attempts · {pendingCount} needs grading
        </p>
        {course?.type === "ONLINE_CLASS" && exam?.type === "final" && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => issueCertificatesMutation.mutate(examId)}
              disabled={issueCertificatesMutation.isPending || isLoading || !attempts?.length}
              className="inline-flex items-center gap-2 rounded-lg bg-[#12304E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0C1F33] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Award className="h-4 w-4" />
              {issueCertificatesMutation.isPending
                ? "Issuing certificates..."
                : "Issue certificates for all learners"}
            </button>
            <span className="text-xs text-[#64748B]">
              Latest passed attempts qualify. All attempts must be graded first.
            </span>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {isError && <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Could not load exam attempts.</p>}

      {!isLoading && !isError && attempts?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No attempts yet.</p>
        </div>
      )}

      {!isLoading && !isError && !!attempts?.length && (
        <div className="overflow-x-auto rounded-xl border border-[#E3E8EF] bg-white">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-[#FBF9F4] text-xs uppercase tracking-wide text-[#64748B]">
              <tr>
                <th className="px-5 py-4 font-semibold">Learner</th>
                <th className="px-5 py-4 font-semibold">Attempt</th>
                <th className="px-5 py-4 font-semibold">Submitted</th>
                <th className="px-5 py-4 font-semibold">Result</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EF]">
              {attempts?.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-gray-50/70">
                  <td className="px-5 py-4 text-sm font-semibold text-[#0C1F33]">{attempt.learnerName}</td>
                  <td className="px-5 py-4 text-sm text-[#475569]">#{attempt.attemptNumber}</td>
                  <td className="px-5 py-4 text-sm text-[#475569]">{formatDate(attempt.submittedAt)}</td>
                  <td className="px-5 py-4 text-sm text-[#0C1F33]">
                    {attempt.graded ? `${attempt.score ?? 0} / ${attempt.totalMarks}` : "—"}
                  </td>
                  <td className="px-5 py-4">
                    {attempt.graded ? (
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${attempt.passed ? "bg-[#22A146]/10 text-[#22A146]" : "bg-red-50 text-red-600"}`}>
                        <CheckCircle className="h-3.5 w-3.5" />
                        {attempt.passed ? "PASSED" : "FAILED"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                        <AlertCircle className="h-3.5 w-3.5" /> Needs grading
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/instructor/courses/${courseId}/exams/${examId}/attempts/${attempt.id}/grade`}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${attempt.graded ? "border border-[#E3E8EF] text-[#12304E] hover:bg-gray-50" : "bg-[#22A146] text-white hover:bg-[#1E9040]"}`}
                    >
                      {attempt.graded ? <><Eye className="h-4 w-4" /> View</> : "Grade now"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
