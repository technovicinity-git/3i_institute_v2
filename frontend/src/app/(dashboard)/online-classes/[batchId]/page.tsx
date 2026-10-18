"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CalendarDays,
  ChevronLeft,
  Clock,
  ExternalLink,
  GraduationCap,
  CheckCircle2,
  Download,
  MessageSquare,
} from "lucide-react";

import { useLearnerBatch } from "@/hooks/use-batches";
import { useProfileStore } from "@/stores/profile-store";
import { useLearnerCertificates } from "@/hooks/use-learner-certificates";
import { downloadExamCertificatePdf } from "@/services/learner-certificate.service";
import { useTranslations } from "next-intl";
import { useDateFormat } from "@/i18n/use-date-format";

type SessionStatus = "LIVE" | "STARTING_SOON" | "UPCOMING" | "COMPLETED";

interface SessionWithStatus {
  id: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string | null;
  notes: string | null;
  status: {
    key: SessionStatus;
    className: string;
    dotClassName: string;
  };
}

function PageHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
}) {
  const t = useTranslations("schedule");
  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        {t("back")}
      </button>
      <h1
        className="text-3xl md:text-[36px] text-[#0C1F33]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h1>
      {subtitle && <p className="text-base text-[#64748B]">{subtitle}</p>}
    </div>
  );
}

export default function OnlineClassBatchPage() {
  const t = useTranslations("schedule");
  const tClasses = useTranslations("classes");
  const fmt = useDateFormat();
  const { format } = useDateFormat();
  const formatDate = (date: string) => format(date, "weekdayDate");
  const formatMonth = (date: string) => format(date, "month");
  const router = useRouter();
  const params = useParams<{ batchId: string }>();

  const batchId = params.batchId;

  const { activeProfile } = useProfileStore();
  const { data: certificates } = useLearnerCertificates(activeProfile?.id ?? "");

  const {
    data: batch,
    isLoading,
    isError,
  } = useLearnerBatch(activeProfile?.id ?? "", batchId);

  /*
   * Keep the current time in state so session statuses
   * automatically update without refreshing the page.
   */
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  const goBack = () => router.push("/online-classes");

  /*
   * Determine the current status of a session.
   */
  const getSessionStatus = (scheduledAt: string, durationMinutes: number) => {
    const start = new Date(scheduledAt);

    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    const minutesUntilStart = (start.getTime() - now.getTime()) / (1000 * 60);

    /*
     * Session is currently running.
     */
    if (now >= start && now <= end) {
      return {
        key: "LIVE" as const,
        className: "bg-[#22A146]/10 text-[#22A146]",
        dotClassName: "bg-[#22A146]",
      };
    }

    /*
     * Session starts within the next 30 minutes.
     */
    if (minutesUntilStart > 0 && minutesUntilStart <= 30) {
      return {
        key: "STARTING_SOON" as const,
        className: "bg-yellow-50 text-yellow-700",
        dotClassName: "bg-yellow-500",
      };
    }

    /*
     * Session is more than 30 minutes away.
     */
    if (minutesUntilStart > 30) {
      return {
        key: "UPCOMING" as const,
        className: "bg-[#2563EB]/10 text-[#2563EB]",
        dotClassName: "bg-[#2563EB]",
      };
    }

    /*
     * Session has already ended.
     */
    return {
      key: "COMPLETED" as const,
      className: "bg-slate-100 text-[#64748B]",
      dotClassName: "bg-[#94A3B8]",
    };
  };

  /*
   * Loading state.
   */
  if (isLoading) {
    return (
      <div className="p-6 md:p-10">
        <PageHeader title={t("title")} onBack={goBack} />
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  /*
   * Error / unavailable state.
   */
  if (isError || !batch) {
    return (
      <div className="p-6 md:p-10">
        <PageHeader title={t("title")} onBack={goBack} />
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="font-semibold text-[#0C1F33]">
            {t("unavailable")}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#64748B]">
            {t("unavailableBody")}
          </p>
        </div>
      </div>
    );
  }

  /*
   * Add current status to every session.
   */
  const sessionsWithStatus: SessionWithStatus[] = batch.sessions.map(
    (session) => ({
      ...session,
      status: getSessionStatus(session.scheduledAt, session.durationMinutes),
    }),
  );

  /*
   * Group sessions by status.
   */
  const sections = (
    ["LIVE", "STARTING_SOON", "UPCOMING", "COMPLETED"] as const
  )
    .map((key) => ({ key, label: t(`section.${key}`) }))
    .map((section) => ({
      ...section,
      sessions: sessionsWithStatus.filter(
        (session) => session.status.key === section.key,
      ),
    }))
    .filter((section) => section.sessions.length > 0);

  const completionCertificate = certificates?.find(
    (certificate) =>
      certificate.courseId === batch.course.id &&
      certificate.type === "COMPLETION",
  );

  // A batch is upcoming only while every scheduled session is still in the
  // future. Once any session has started or finished, the batch is ongoing.
  const isUpcomingBatch =
    sessionsWithStatus.length > 0
      ? sessionsWithStatus.every(
          (session) => new Date(session.scheduledAt).getTime() > now.getTime(),
        )
      : batch.status !== "ACTIVE";

  /*
   * Reusable session card.
   */
  const renderSession = (session: SessionWithStatus) => {
    const sessionNumber =
      batch.sessions.findIndex((item) => item.id === session.id) + 1;
    const isLive = session.status.key === "LIVE";
    const isJoinable = isLive || session.status.key === "STARTING_SOON";
    const isCompleted = session.status.key === "COMPLETED";

    return (
      <div
        key={session.id}
        className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow ${
          isLive ? "border-[#22A146]/40" : "border-[#E3E8EF]"
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Date box */}
            <div
              className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center shrink-0 ${
                isCompleted ? "bg-[#F8FAFC]" : "bg-[#F9F6F0]"
              }`}
            >
              <span
                className={`text-[10px] font-bold tracking-wide ${
                  isCompleted ? "text-[#94A3B8]" : "text-[#B8912F]"
                }`}
              >
                {formatMonth(session.scheduledAt)}
              </span>
              <span
                className={`text-xl font-bold leading-6 ${
                  isCompleted ? "text-[#64748B]" : "text-[#0C1F33]"
                }`}
              >
                {format(session.scheduledAt, "day")}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#E3E8EF] text-[#0C1F33]">
                  {t("sessionNumber", { number: sessionNumber })}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${session.status.className}`}
                >
                  {t(`status.${session.status.key}`)}
                </span>
              </div>
              <p
                className={`text-sm font-semibold mt-1.5 truncate ${
                  isCompleted ? "text-[#64748B]" : "text-[#0C1F33]"
                }`}
              >
                {session.title}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748B] flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(session.scheduledAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {fmt.time(session.scheduledAt)} •{" "}
                  {t("minutes", { count: session.durationMinutes })}
                </span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center gap-2 shrink-0">
            {isJoinable && session.meetingLink ? (
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-xs font-semibold transition-colors ${
                  isLive
                    ? "bg-[#22A146] hover:bg-[#1E9040]"
                    : "bg-[#12304E] hover:bg-[#1a4268]"
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {isLive ? t("joinClass") : t("joinSoon")}
              </a>
            ) : isJoinable ? (
              <span className="text-xs font-semibold text-yellow-600 px-3 py-2">
                {t("noLinkYet")}
              </span>
            ) : isCompleted ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-[#94A3B8] px-3 py-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t("completed")}
              </span>
            ) : (
              <span className="text-xs font-semibold text-[#94A3B8] px-3 py-2">
                {t("notStarted")}
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        {session.notes && (
          <div className="mt-4 rounded-lg bg-[#F8FAFC] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
              {t("sessionNotes")}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#64748B]">
              {session.notes}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        title={t("title")}
        subtitle={t("scheduled", { count: batch.sessions.length })}
        onBack={goBack}
      />

      {/* Course / Batch summary */}
      <div className="bg-white border border-[#E3E8EF] rounded-xl p-5 mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-[#12304E] to-[#2a5070]">
              {batch.course.thumbnailUrl ? (
                <Image
                  src={batch.course.thumbnailUrl}
                  alt={batch.course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <BookOpen className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[9px] font-bold text-white bg-[#7C3AED] px-2 py-0.5 rounded">
                  {tClasses("live")}
                </span>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    isUpcomingBatch
                      ? "bg-[#F9F6F0] text-[#9A7624]"
                      : "bg-[#22A146]/10 text-[#22A146]"
                  }`}
                >
                  {isUpcomingBatch ? t("upcomingBatch") : t("ongoingBatch")}
                </span>
              </div>
              <h2
                className="text-base text-[#0C1F33] leading-5 line-clamp-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {batch.course.title}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-[#64748B] flex-wrap">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {batch.name}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  {batch.course.instructorName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {t("enrolledOn", { date: fmt.date(batch.enrolledAt) })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/chat?courseId=${batch.course.id}&courseTitle=${encodeURIComponent(batch.course.title)}&batchId=${batchId}&batchName=${encodeURIComponent(batch.name)}`,
                )
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#12304E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a4268] transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {tClasses("chat")}
            </button>

            {completionCertificate && (
              <button
                type="button"
                onClick={() => downloadExamCertificatePdf(completionCertificate)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#22A146] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E9040]"
              >
                <Download className="h-3.5 w-3.5" />
                {tClasses("certificate")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Schedule */}
      {batch.sessions.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B] mb-2">{t("none")}</p>
          <p className="text-xs text-[#94A3B8]">{t("noneHint")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.key}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`h-2 w-2 rounded-full ${
                    section.sessions[0]!.status.dotClassName
                  } ${section.key === "LIVE" ? "animate-pulse" : ""}`}
                />
                <p className="text-sm font-bold text-[#0C1F33]">
                  {section.label}
                </p>
                <div className="flex-1 h-px bg-[#E3E8EF]" />
                <span className="text-xs text-[#64748B]">
                  {t("sessionCount", { count: section.sessions.length })}
                </span>
              </div>

              <div className="space-y-3">
                {section.sessions.map((session) => renderSession(session))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
