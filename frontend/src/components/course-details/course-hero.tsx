import Image from "next/image";
import { BookOpen, Clock, Star } from "lucide-react";
import type { CourseDetails } from "@/types/course-details";
import { useTranslations } from "next-intl";
import { levelKey } from "@/lib/course-level";
import { initials } from "./utils";

export function CourseHero({ course }: { course: CourseDetails }) {
  const t = useTranslations("courseDetails");
  const tLevel = useTranslations("courseLevel");
  return (
    <section className="relative bg-[#12304E] overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08]">
        <div className="w-[1200px] h-[400px] border border-[#B8912F] rotate-45 rounded-sm" />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6 py-12 lg:py-0 lg:min-h-[480px] flex items-center">
        <div className="max-w-[760px] flex flex-col gap-6">
          {/* Breadcrumbs */}
          <p className="text-[#B8912F] text-sm font-semibold">
            {t("breadcrumbCourses")} &gt; {course.category?.name ?? t("general")}{" "}
            &gt; {course.title}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-[#B8912F] bg-[#B8912F]/[0.08] px-2 py-1 rounded">
              {tLevel(levelKey(course.level))}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-white text-[40px] leading-[48px]">
            {course.title}
          </h1>

          {/* Description */}
          <p className="text-white text-base leading-6 max-w-[760px]">
            {course.summary}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex items-center gap-1.5 text-white text-sm">
              <Star className="w-3.5 h-3.5 text-[#B8912F]" strokeWidth={2} />
              <span className="font-semibold">
                {t("rating", {
                  average: course.ratingSummary.average,
                  count: course.ratingSummary.total,
                })}
              </span>
            </span>
            {/* <span className="flex items-center gap-1.5 text-white text-sm">
              <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
              {course.totalLessons} Lessons
            </span>
            <span className="flex items-center gap-1.5 text-white text-sm">
              <Clock className="w-3.5 h-3.5" strokeWidth={2} />
              {course.durationWeeks} Weeks
            </span> */}
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-3">
            {course.instructor.avatarUrl ? (
              <Image
                src={course.instructor.avatarUrl}
                alt={course.instructor.name}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#64748B] overflow-hidden flex items-center justify-center text-white text-sm font-semibold">
                {initials(course.instructor.name)}
              </div>
            )}
            <span className="text-white text-sm">
              {t.rich("instructedBy", {
                name: course.instructor.name,
                strong: (chunks) => (
                  <span className="font-semibold">{chunks}</span>
                ),
              })}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
