"use client";

import Link from "next/link";
import { AlertTriangle, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLearningAccess } from "@/hooks/use-learning-access";
import { useDateFormat } from "@/i18n/use-date-format";

/**
 * Shown across the learner dashboard once the subscription has ended:
 * during the grace period (still open, renew soon) and after it (lessons,
 * live classes, assignments and chat locked; exams stay open).
 */
export function SubscriptionAccessBanner() {
  const t = useTranslations("subscriptionAccess");
  const { access, learnerName } = useLearningAccess();
  const format = useDateFormat();

  if (!access || access.status === "SUBSCRIBED") return null;
  const grace = access.status === "GRACE";

  return (
    <div
      role="status"
      className={`flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-3 border-b text-sm ${
        grace
          ? "bg-amber-50 border-amber-200 text-amber-900"
          : "bg-red-50 border-red-200 text-red-900"
      }`}
    >
      {grace ? (
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
      ) : (
        <Lock className="w-5 h-5 shrink-0 text-red-600" />
      )}
      <div className="flex-1">
        <p className="font-semibold">
          {access.status === "NONE"
            ? t("noneTitle", { name: learnerName })
            : t("endedTitle", { name: learnerName })}
        </p>
        <p className="mt-0.5">
          {grace
            ? t("graceBody", { date: format.date(access.graceEndsAt) })
            : access.status === "NONE"
              ? t("noneBody")
              : t("expiredBody")}
        </p>
      </div>
      <Link
        href="/subscription"
        className={`shrink-0 rounded-lg px-4 py-2 text-center font-semibold text-white ${
          grace ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {access.status === "NONE" ? t("subscribe") : t("renew")}
      </Link>
    </div>
  );
}

/** Replaces a join button when live classes are locked. */
export function RenewToJoin({ className = "" }: { className?: string }) {
  const t = useTranslations("subscriptionAccess");
  return (
    <Link
      href="/subscription"
      className={`inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:underline ${className}`}
    >
      <Lock className="w-3.5 h-3.5" />
      {t("renewToJoin")}
    </Link>
  );
}

/** Takes the place of the lesson player when lessons are locked. */
export function LessonLocked({ name }: { name: string }) {
  const t = useTranslations("subscriptionAccess");
  return (
    <div className="w-full aspect-video rounded-lg border border-[#E3E8EF] bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <Lock className="w-7 h-7 text-red-600" />
      </div>
      <p className="text-lg font-semibold text-[#0C1F33]">{t("lessonLockedTitle")}</p>
      <p className="mt-1 max-w-md text-sm text-[#64748B]">{t("lessonLockedBody", { name })}</p>
      <Link
        href="/subscription"
        className="mt-5 rounded-lg bg-[#22A146] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D8F3D]"
      >
        {t("renew")}
      </Link>
    </div>
  );
}
