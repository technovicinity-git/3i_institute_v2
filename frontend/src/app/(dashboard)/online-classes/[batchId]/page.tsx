"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Clock,
  ExternalLink,
  GraduationCap,
  Video,
  User,
  CheckCircle2,
} from "lucide-react";

import { useLearnerBatch } from "@/hooks/use-batches";
import { useProfileStore } from "@/stores/profile-store";

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
    label: string;
    className: string;
    dotClassName: string;
  };
}

export default function OnlineClassBatchPage() {
  const router = useRouter();
  const params = useParams<{ batchId: string }>();

  const batchId = params.batchId;

  const { activeProfile } = useProfileStore();

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
        label: "Live Now",
        className: "bg-green-50 text-green-700",
        dotClassName: "bg-green-500",
      };
    }

    /*
     * Session starts within the next 30 minutes.
     */
    if (minutesUntilStart > 0 && minutesUntilStart <= 30) {
      return {
        key: "STARTING_SOON" as const,
        label: "Starting Soon",
        className: "bg-amber-50 text-amber-700",
        dotClassName: "bg-amber-500",
      };
    }

    /*
     * Session is more than 30 minutes away.
     */
    if (minutesUntilStart > 30) {
      return {
        key: "UPCOMING" as const,
        label: "Upcoming",
        className: "bg-blue-50 text-blue-700",
        dotClassName: "bg-blue-500",
      };
    }

    /*
     * Session has already ended.
     */
    return {
      key: "COMPLETED" as const,
      label: "Completed",
      className: "bg-slate-100 text-slate-500",
      dotClassName: "bg-slate-400",
    };
  };

  /*
   * Loading state.
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 h-5 w-32 animate-pulse rounded bg-slate-200" />

          <div className="overflow-hidden rounded-2xl border border-[#E3E8EF] bg-white">
            <div className="h-48 animate-pulse bg-slate-100 sm:h-56" />

            <div className="space-y-4 p-6">
              <div className="h-7 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl border border-[#E3E8EF] bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /*
   * Error / unavailable state.
   */
  if (isError || !batch) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-[#E3E8EF] bg-white p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <CalendarDays className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="mt-5 font-serif text-2xl text-[#0C1F33]">
              Class schedule unavailable
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
              We could not load this batch. You may no longer be enrolled in
              this batch, or the batch may no longer be available.
            </p>

            <button
              type="button"
              onClick={() => router.back()}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0C1F33] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#162E48]"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>
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
  const liveSessions = sessionsWithStatus.filter(
    (session) => session.status.key === "LIVE",
  );

  const startingSoonSessions = sessionsWithStatus.filter(
    (session) => session.status.key === "STARTING_SOON",
  );

  const upcomingSessions = sessionsWithStatus.filter(
    (session) => session.status.key === "UPCOMING",
  );

  const completedSessions = sessionsWithStatus.filter(
    (session) => session.status.key === "COMPLETED",
  );

  // A batch is upcoming only while every scheduled session is still in the
  // future. Once any session has started or finished, the batch is ongoing.
  const isUpcomingBatch =
    sessionsWithStatus.length > 0
      ? sessionsWithStatus.every(
          (session) => new Date(session.scheduledAt).getTime() > now.getTime(),
        )
      : batch.status !== "ACTIVE";

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

  const formatShortDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  /*
   * Reusable session card.
   */
  const renderSession = (session: SessionWithStatus, showJoinButton = true) => {
    const sessionNumber =
      batch.sessions.findIndex((item) => item.id === session.id) + 1;

    return (
      <div
        key={session.id}
        className="overflow-hidden rounded-2xl border border-[#E3E8EF] bg-white"
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-4">
              {/* Session Number */}
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                  session.status.key === "LIVE"
                    ? "bg-green-50 text-green-700"
                    : session.status.key === "STARTING_SOON"
                      ? "bg-amber-50 text-amber-700"
                      : session.status.key === "COMPLETED"
                        ? "bg-slate-100 text-slate-500"
                        : "bg-[#F8F3E8] text-[#B8912F]"
                }`}
              >
                {sessionNumber}
              </div>

              <div className="min-w-0">
                {/* Title + Status */}
                <div className="flex flex-wrap items-center gap-2">
                  <h4
                    className={`text-[16px] font-semibold ${
                      session.status.key === "COMPLETED"
                        ? "text-[#64748B]"
                        : "text-[#0C1F33]"
                    }`}
                  >
                    {session.title}
                  </h4>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${session.status.className}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${session.status.dotClassName}`}
                    />

                    {session.status.label}
                  </span>
                </div>

                {/* Date / Time / Duration */}
                <div
                  className={`mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${
                    session.status.key === "COMPLETED"
                      ? "text-[#94A3B8]"
                      : "text-[#64748B]"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(session.scheduledAt)}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(session.scheduledAt)}
                  </span>

                  <span>{session.durationMinutes} min</span>
                </div>
              </div>
            </div>

            {/* Action */}
            {showJoinButton && (
              <div className="shrink-0">
                {session.status.key === "LIVE" && session.meetingLink && (
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0C1F33] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#162E48] sm:w-auto"
                  >
                    <Video className="h-4 w-4" />
                    Join Class
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                {session.status.key === "STARTING_SOON" &&
                  session.meetingLink && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#B8912F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9A7624] sm:w-auto"
                    >
                      <Video className="h-4 w-4" />
                      Join Soon
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                {session.status.key === "UPCOMING" && (
                  <span className="inline-flex items-center rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-[#94A3B8]">
                    Not Started
                  </span>
                )}

                {session.status.key === "COMPLETED" && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-[#94A3B8]">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </span>
                )}

                {session.status.key === "LIVE" && !session.meetingLink && (
                  <span className="inline-flex items-center rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-[#94A3B8]">
                    Link unavailable
                  </span>
                )}

                {session.status.key === "STARTING_SOON" &&
                  !session.meetingLink && (
                    <span className="inline-flex items-center rounded-lg bg-slate-50 px-4 py-2.5 text-sm font-medium text-[#94A3B8]">
                      Link unavailable
                    </span>
                  )}
              </div>
            )}
          </div>

          {/* Notes */}
          {session.notes && (
            <div className="mt-5 rounded-xl bg-[#FAFBFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Session Notes
              </p>

              <p className="mt-1.5 text-sm leading-6 text-[#475569]">
                {session.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/online-classes"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0C1F33]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Online Classes
        </Link>

        {/* Course / Batch Header */}
        <div className="overflow-hidden rounded-2xl border border-[#E3E8EF] bg-white">
          <div className="relative h-48 overflow-hidden bg-[#0C1F33] sm:h-56">
            {batch.course.thumbnailUrl ? (
              <img
                src={batch.course.thumbnailUrl}
                alt={batch.course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <GraduationCap className="h-16 w-16 text-white/30" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#0C1F33]/80 via-[#0C1F33]/20 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 sm:left-7 sm:right-7">
              <span className="inline-flex rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#9A7624]">
                Online Class
              </span>

              <h1 className="mt-2 font-serif text-2xl text-white sm:text-3xl">
                {batch.course.title}
              </h1>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Enrolled Batch
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#0C1F33]">
                  {batch.name}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#64748B]">
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {batch.course.instructorName}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Enrolled {formatShortDate(batch.enrolledAt)}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {batch.sessions.length}{" "}
                    {batch.sessions.length === 1 ? "session" : "sessions"}
                  </span>
                </div>
              </div>

              <span
                className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isUpcomingBatch
                    ? "bg-[#F8F3E8] text-[#9A7624]"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {isUpcomingBatch ? "Upcoming" : "Ongoing"}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="mt-8">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-wide text-[#B8912F]">
              Class Schedule
            </p>

            <h2 className="mt-1 font-serif text-2xl text-[#0C1F33] sm:text-[28px]">
              All Sessions
            </h2>

            <p className="mt-2 text-sm text-[#64748B]">
              View the complete schedule for your enrolled batch.
            </p>
          </div>

          {batch.sessions.length === 0 ? (
            <div className="rounded-2xl border border-[#E3E8EF] bg-white p-8 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-[#94A3B8]" />

              <p className="mt-3 text-sm font-medium text-[#334155]">
                No sessions scheduled yet
              </p>

              <p className="mt-1 text-sm text-[#64748B]">
                Your instructor has not added any sessions to this batch.
              </p>
            </div>
          ) : (
            <div className="space-y-7">
              {/* Live Now */}
              {liveSessions.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

                    <h3 className="text-sm font-semibold text-[#334155]">
                      Live Now
                    </h3>

                    <span className="text-xs text-[#94A3B8]">
                      ({liveSessions.length})
                    </span>
                  </div>

                  <div className="space-y-3">
                    {liveSessions.map((session) => renderSession(session))}
                  </div>
                </section>
              )}

              {/* Starting Soon */}
              {startingSoonSessions.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />

                    <h3 className="text-sm font-semibold text-[#334155]">
                      Starting Soon
                    </h3>

                    <span className="text-xs text-[#94A3B8]">
                      ({startingSoonSessions.length})
                    </span>
                  </div>

                  <div className="space-y-3">
                    {startingSoonSessions.map((session) =>
                      renderSession(session),
                    )}
                  </div>
                </section>
              )}

              {/* Upcoming */}
              {upcomingSessions.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />

                    <h3 className="text-sm font-semibold text-[#334155]">
                      Upcoming Sessions
                    </h3>

                    <span className="text-xs text-[#94A3B8]">
                      ({upcomingSessions.length})
                    </span>
                  </div>

                  <div className="space-y-3">
                    {upcomingSessions.map((session) => renderSession(session))}
                  </div>
                </section>
              )}

              {/* Completed */}
              {completedSessions.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#94A3B8]" />

                    <h3 className="text-sm font-semibold text-[#334155]">
                      Previous Sessions
                    </h3>

                    <span className="text-xs text-[#94A3B8]">
                      ({completedSessions.length})
                    </span>
                  </div>

                  <div className="space-y-3">
                    {completedSessions.map((session) => renderSession(session))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-[#E3E8EF] pt-6">
          <Link
            href="/online-classes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0C1F33] transition-colors hover:text-[#B8912F]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Online Classes
          </Link>
        </div>
      </div>
    </div>
  );
}
