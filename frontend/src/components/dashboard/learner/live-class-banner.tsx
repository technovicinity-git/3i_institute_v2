import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { LiveClass } from "@/types/dashboard";
import { type ClassStatus } from "./utils";
import { useTranslations } from "next-intl";
import { useDashboardFormat } from "./use-dashboard-format";

/** Banner for a class that is live now or starting within 30 minutes. */
export function LiveClassBanner({
  liveClass,
  status,
}: {
  liveClass: LiveClass;
  status: ClassStatus;
}) {
  const t = useTranslations("dashboardHome");
  const fmt = useDashboardFormat();
  const isLive = status === "LIVE";
  return (
    <div
      className={`rounded-xl px-5 py-4 flex flex-wrap items-center gap-4 ${
        isLive ? "bg-[#22A146] text-white" : "bg-[#12304E] text-white"
      }`}
    >
      <span className="relative flex h-3 w-3 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          {isLive
            ? t("liveNowBanner", { title: liveClass.title })
            : t("startsAtBanner", {
                time: fmt.time(liveClass.scheduledAt),
                title: liveClass.title,
              })}
        </p>
        <p className="text-xs text-white/80 truncate">
          {liveClass.courseTitle} • {liveClass.instructor}
        </p>
      </div>
      {liveClass.meetingLink ? (
        <a
          href={liveClass.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0C1F33] hover:bg-white/90"
        >
          <ExternalLink className="w-4 h-4" />
          {t("joinClass")}
        </a>
      ) : (
        <Link
          href={`/online-classes/${liveClass.batchId}`}
          className="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25"
        >
          {t("viewSchedule")}
        </Link>
      )}
    </div>
  );
}
