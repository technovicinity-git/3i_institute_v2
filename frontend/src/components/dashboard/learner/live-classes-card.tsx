import Link from "next/link";
import type { LiveClass } from "@/types/dashboard";
import { EmptyText, SectionHeader } from "./section-header";
import { card, classStatus, formatTime } from "./utils";

export function LiveClassesCard({
  liveClasses,
  now,
}: {
  liveClasses: LiveClass[];
  now: Date;
}) {
  return (
    <div className={`${card} p-5`}>
      <SectionHeader title="Upcoming live classes" href="/online-classes" />
      {liveClasses.length === 0 ? (
        <EmptyText>No upcoming live classes.</EmptyText>
      ) : (
        <div className="space-y-3">
          {liveClasses.map((cls) => {
            const status = classStatus(cls, now);
            const date = new Date(cls.scheduledAt);
            return (
              <div key={cls.id} className="flex items-center gap-3">
                <div className="w-11 h-12 bg-[#F9F6F0] rounded-lg flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-[#B8912F] uppercase">
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  <span className="text-[16px] font-bold text-[#0C1F33] leading-none">
                    {date.getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#0C1F33] truncate">
                    {cls.title}
                  </p>
                  <p className="text-[11px] text-[#64748B] truncate">
                    {status === "LIVE" ? (
                      <span className="font-semibold text-[#22A146]">
                        Live now
                      </span>
                    ) : (
                      formatTime(cls.scheduledAt)
                    )}{" "}
                    • {cls.courseTitle}
                  </p>
                </div>
                {status !== "LATER" && cls.meetingLink ? (
                  <a
                    href={cls.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#22A146] text-white hover:bg-[#1E9040]"
                  >
                    Join
                  </a>
                ) : (
                  <Link
                    href={`/online-classes/${cls.batchId}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E3E8EF] text-[#12304E] hover:bg-gray-50"
                  >
                    View
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
