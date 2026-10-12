"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import type {
  CourseBatch,
  CourseBatchSession,
} from "@/types/course-details";

/** "Choose Your Batch": expandable batches with their sessions. */
export function CourseBatches({ batches }: { batches: CourseBatch[] }) {
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  return (
    <section className="mt-10">
      <div className="mb-5">
        <p className="text-sm font-bold text-[#B8912F] uppercase tracking-wide">
          Available Batches
        </p>

        <h2 className="font-serif text-[28px] text-[#0C1F33] mt-1">
          Choose Your Batch
        </h2>

        <p className="text-sm text-[#64748B] mt-2">
          View the schedule and sessions for each available batch.
        </p>
      </div>

      <div className="space-y-4">
        {batches.map((batch) => (
          <BatchCard
            key={batch.id}
            batch={batch}
            expanded={expandedBatch === batch.id}
            onToggle={() =>
              setExpandedBatch(expandedBatch === batch.id ? null : batch.id)
            }
            expandedSession={expandedSession}
            onToggleSession={(id) =>
              setExpandedSession(expandedSession === id ? null : id)
            }
          />
        ))}
      </div>
    </section>
  );
}

function BatchCard({
  batch,
  expanded,
  onToggle,
  expandedSession,
  onToggleSession,
}: {
  batch: CourseBatch;
  expanded: boolean;
  onToggle: () => void;
  expandedSession: string | null;
  onToggleSession: (sessionId: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E3E8EF] bg-white">
      {/* Batch Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-5 text-left transition-colors hover:bg-[#FAFBFC]"
      >
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Batch Icon */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F8F3E8]">
              <CalendarDays className="h-5 w-5 text-[#B8912F]" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-serif text-[20px] text-[#0C1F33]">
                  {batch.name}
                </h3>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    batch.status === "ACTIVE"
                      ? "bg-green-50 text-green-700"
                      : "bg-[#F8F3E8] text-[#9A7624]"
                  }`}
                >
                  {batch.status === "ACTIVE" ? "Active" : "Upcoming"}
                </span>
              </div>

              <p className="mt-1 text-sm text-[#64748B]">
                {batch.sessions.length}{" "}
                {batch.sessions.length === 1 ? "session" : "sessions"}
                {" · "}
                {batch.capacity} seats
              </p>
            </div>
          </div>

          {/* Expand Icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E3E8EF]">
            <ChevronDown
              className={`h-4 w-4 text-[#64748B] transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </button>

      {/* Sessions */}
      {expanded && (
        <div className="border-t border-[#E3E8EF] bg-[#FAFBFC] px-6 py-4">
          <div className="space-y-2">
            {batch.sessions.map((session, index) => (
              <SessionItem
                key={session.id}
                session={session}
                number={index + 1}
                expanded={expandedSession === session.id}
                onToggle={() => onToggleSession(session.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionItem({
  session,
  number,
  expanded,
  onToggle,
}: {
  session: CourseBatchSession;
  number: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E3E8EF] bg-white">
      {/* Session Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 text-left transition-colors hover:bg-[#FCFCFC]"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            {/* Session Number */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0C1F33] text-sm font-semibold text-white">
              {number}
            </div>

            <div className="min-w-0">
              <h4 className="truncate text-[15px] font-semibold text-[#0C1F33]">
                {session.title}
              </h4>

              <p className="mt-1 text-sm text-[#64748B]">
                {new Date(session.scheduledAt).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {" · "}
                {new Date(session.scheduledAt).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden text-sm text-[#64748B] sm:block">
              {session.durationMinutes} min
            </span>

            <ChevronDown
              className={`h-4 w-4 text-[#64748B] transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </button>

      {/* Session Details */}
      {expanded && (
        <div className="border-t border-[#E3E8EF] px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Date & Time
              </p>

              <p className="mt-1 text-sm text-[#334155]">
                {new Date(session.scheduledAt).toLocaleString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Duration
              </p>

              <p className="mt-1 text-sm text-[#334155]">
                {session.durationMinutes} minutes
              </p>
            </div>
          </div>

          {session.notes && (
            <div className="mt-4 rounded-lg bg-[#FAFBFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Session Notes
              </p>

              <p className="mt-1 text-sm leading-6 text-[#475569]">
                {session.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
