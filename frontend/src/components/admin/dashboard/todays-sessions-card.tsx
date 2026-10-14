import Link from "next/link";
import { AlertTriangle, Video } from "lucide-react";
import type { AdminDashboardSession } from "@/types/admin-dashboard";
import { SectionHeader, card, formatTime } from "./utils";

export function TodaysSessionsCard({
  sessions,
  now,
}: {
  sessions: AdminDashboardSession[];
  /** Epoch ms used for the "Live now" label. */
  now: number;
}) {
  return (
    <section className={`${card} p-5`}>
      <SectionHeader title="Today's live classes" />
      {sessions.length === 0 ? (
        <p className="text-sm text-[#64748B]">No live classes scheduled today.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const start = new Date(s.scheduledAt).getTime();
            const live = now >= start && now <= start + s.durationMinutes * 60_000;
            return (
              <Link
                key={s.id}
                href={`/admin/courses/${s.courseId}`}
                className="flex items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-[#F8FAFC]"
              >
                <div className="w-10 h-10 rounded-lg bg-[#F9F6F0] flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4 text-[#B8912F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0C1F33] truncate">
                    {s.title}
                  </p>
                  <p className="text-xs text-[#64748B] truncate">
                    {live ? (
                      <span className="font-semibold text-[#22A146]">
                        Live now
                      </span>
                    ) : (
                      formatTime(s.scheduledAt)
                    )}{" "}
                    · {s.courseTitle} · {s.instructor}
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    {s.enrolled} enrolled
                    {!s.hasMeetingLink && (
                      <span className="ml-2 inline-flex items-center gap-1 font-semibold text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        No meeting link
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
