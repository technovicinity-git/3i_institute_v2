"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useProfileStore } from "@/stores/profile-store";
import type { CourseDetails } from "@/types/course-details";

/**
 * Shown at the top of a course page opened directly (e.g. from a link) when
 * the active learner is outside the course's age range. The course list
 * already hides these courses for them.
 */
export function AgeNotice({ course }: { course: CourseDetails }) {
  const t = useTranslations("courseDetails.ageNotice");
  const { activeProfile } = useProfileStore();
  const eligibility = course.enrolmentEligibility;

  if (!activeProfile || !eligibility || eligibility.ageEligible) return null;
  if (course.isEnrolled) return null;

  const range =
    course.maximumAge === null
      ? t("rangeFrom", { min: course.minimumAge })
      : t("rangeBetween", { min: course.minimumAge, max: course.maximumAge });
  const name = activeProfile.displayName;

  return (
    <div className="max-w-[1200px] mx-auto px-6 pt-8">
      <div
        role="status"
        className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-5 py-4"
      >
        <AlertTriangle className="w-5 h-5 shrink-0 text-orange-600" />
        <div className="flex-1 text-sm text-orange-900">
          <p className="font-semibold">{t("title", { name })}</p>
          <p className="mt-0.5">
            {t("body", { range, name, age: eligibility.age })}
          </p>
        </div>
        <Link
          href="/courses"
          className="shrink-0 rounded-lg bg-white border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-900 hover:bg-orange-100"
        >
          {t("browse", { name })}
        </Link>
      </div>
    </div>
  );
}
