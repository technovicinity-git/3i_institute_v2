"use client";

import { useRouter } from "next/navigation";
import { Award, Download, FileText, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDateFormat } from "@/i18n/use-date-format";
import {
  downloadExamCertificatePdf,
  type ExamCertificate,
} from "@/services/learner-certificate.service";

interface CourseCompletionCardProps {
  courseId: string;
  courseProgress: number;
  certificate: ExamCertificate | null | undefined;
  hasExamAttempt: boolean;
  isGenerating: boolean;
  onGenerateCertificate: () => void;
  className?: string;
}

/**
 * Compact exam + certificate panel for REGULAR courses.
 * Exam unlocks at 90% progress; certificate after at least one exam attempt.
 */
export function CourseCompletionCard({
  courseId,
  courseProgress,
  certificate,
  hasExamAttempt,
  isGenerating,
  onGenerateCertificate,
  className = "",
}: CourseCompletionCardProps) {
  const t = useTranslations("lesson");
  const format = useDateFormat();
  const router = useRouter();
  const isExamUnlocked = courseProgress >= 90;
  const canGenerate = hasExamAttempt && !isGenerating;

  // One helper line, reflecting the learner's next step
  const hint = certificate
    ? t("issuedOn", { date: format.date(certificate.issuedAt) })
    : !isExamUnlocked
      ? t("examLocked", { progress: courseProgress })
      : hasExamAttempt
        ? t("certificateHint")
        : t("examUnlocked");

  const buttonBase =
    "flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors";

  return (
    <div className={className}>
      {/* Progress */}
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-semibold text-[#0C1F33]">{t("courseProgress")}</span>
        <span className="text-[#64748B]">{courseProgress}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isExamUnlocked ? "bg-[#22A146]" : "bg-[#F59E0B]"
          }`}
          style={{ width: `${Math.min(100, courseProgress)}%` }}
        />
      </div>

      {/* Exam + certificate actions */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => router.push(`/my-courses/${courseId}/exams`)}
          disabled={!isExamUnlocked}
          className={`${buttonBase} ${
            isExamUnlocked
              ? "bg-[#22A146] text-white hover:bg-[#1E9040]"
              : "bg-gray-100 text-[#94A3B8] cursor-not-allowed"
          }`}
        >
          {isExamUnlocked ? (
            <FileText className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Lock className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="truncate">{t("takeExam")}</span>
        </button>

        {certificate ? (
          <button
            onClick={() => downloadExamCertificatePdf(certificate)}
            className={`${buttonBase} bg-[#12304E] text-white hover:bg-[#0C1F33]`}
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t("downloadPdf")}</span>
          </button>
        ) : (
          <button
            onClick={onGenerateCertificate}
            disabled={!canGenerate}
            className={`${buttonBase} ${
              canGenerate
                ? "border border-[#12304E] text-[#12304E] hover:bg-gray-50"
                : "bg-gray-100 text-[#94A3B8] cursor-not-allowed"
            }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {isGenerating ? t("generating") : t("generateCertificate")}
            </span>
          </button>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-4 text-[#64748B]">
        {certificate && <Award className="inline w-3 h-3 me-1 text-[#22A146] align-[-2px]" />}
        {hint}
      </p>
    </div>
  );
}
