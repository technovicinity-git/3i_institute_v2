"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, FileText } from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useEnrolledCourses } from "@/hooks/use-learner-courses";
import { SearchInput } from "@/components/dashboard/search-input";
import { levelKey } from "@/lib/course-level";
import { useTranslations } from "next-intl";


export default function MyCoursesPage() {
  const t = useTranslations("myCourses");
  const tLevel = useTranslations("courseLevel");
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: courses,
    isLoading,
    isError,
  } = useEnrolledCourses(activeProfile?.id ?? "");

  // Filter regular courses only, then by search
  const regularCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c) => c.type === "REGULAR");
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return regularCourses;
    const query = searchQuery.toLowerCase();
    return regularCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.instructor.name.toLowerCase().includes(query),
    );
  }, [regularCourses, searchQuery]);

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("title")}
        </h1>
        <p className="text-base text-[#64748B]">
          {t("count", { count: regularCourses.length })}
        </p>
      </div>

      {/* Search */}
      {regularCourses.length > 0 && (
        <div className="mb-6">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t("search")}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center justify-center py-20">
          <p className="text-red-600 font-medium">{t("loadFailed")}</p>
        </div>
      )}

      {/* Empty — no regular courses */}
      {!isLoading && !isError && regularCourses.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">{t("empty")}</p>
          <Link
            href="/courses"
            className="inline-block mt-4 text-[#22A146] font-semibold hover:underline"
          >
            {t("browse")}
          </Link>
        </div>
      )}

      {/* Empty — search returned nothing */}
      {!isLoading &&
        !isError &&
        regularCourses.length > 0 &&
        filteredCourses.length === 0 && (
          <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
            <p className="text-[#64748B]">
              {t("noMatch", { query: searchQuery })}
            </p>
          </div>
        )}

      {/* Course Table */}
      {!isLoading && !isError && filteredCourses.length > 0 && (
        <div className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden">
          {/* Desktop header */}
          <div className="hidden lg:grid grid-cols-[minmax(300px,2fr)_200px_200px] items-center gap-6 px-5 py-3 bg-[#F8FAFC] border-b border-[#E3E8EF] text-xs font-semibold text-[#64748B] uppercase tracking-wide">
            <div>{t("colCourse")}</div>
            <div>{t("colProgress")}</div>
            <div>{t("colActions")}</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#E3E8EF]">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="px-5 py-5 hover:bg-[#F8FAFC] transition-colors"
              >
                {/* Desktop */}
                <div className="hidden lg:grid grid-cols-[minmax(300px,2fr)_200px_200px] items-center gap-6">
                  {/* Course info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-[#12304E] to-[#2a5070]">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
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
                        <span className="text-[9px] font-bold text-[#0C1F33] bg-white border border-[#E3E8EF] px-2 py-0.5 rounded">
                          {tLevel(levelKey(course.level))}
                        </span>
                        {course.isCompleted && (
                          <span className="text-[9px] font-bold text-white bg-[#22A146] px-2 py-0.5 rounded">
                            {t("completed")}
                          </span>
                        )}
                      </div>
                      <h3
                        className="text-base text-[#0C1F33] leading-5 truncate"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {course.title}
                      </h3>
                      <p className="text-sm text-[#64748B] mt-1 truncate">
                        {course.instructor.name}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#22A146]">
                        {t("lessons", {
                          done: course.completedMaterials,
                          total: course.totalMaterials,
                        })}
                      </span>
                      <span className="text-xs font-semibold text-[#0C1F33]">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#22A146] rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {course.continueLessonId ? (
                      <button
                        onClick={() =>
                          router.push(
                            `/my-courses/${course.courseId}/lessons/${course.continueLessonId}`,
                          )
                        }
                        className="px-4 py-2 bg-[#12304E] text-white text-xs font-semibold rounded-lg hover:bg-[#1a4268] transition-colors"
                      >
                        {course.progress > 0 ? t("resume") : t("start")}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-200 text-gray-500 text-xs font-semibold rounded-lg cursor-not-allowed"
                      >
                        {t("upcoming")}
                      </button>
                    )}

                    <Link
                      href={`/my-courses/${course.courseId}/exams`}
                      className="flex items-center gap-1.5 px-4 py-2 border border-[#12304E] text-[#12304E] text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {t("exams")}
                    </Link>
                  </div>
                </div>

                {/* Mobile */}
                <div className="lg:hidden">
                  <div className="flex gap-4">
                    <div className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-[#12304E] to-[#2a5070]">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30">
                          <BookOpen className="w-8 h-8" />
                        </div>
                      )}
                      {course.isCompleted && (
                        <span className="absolute top-2 start-2 text-[9px] font-bold text-white bg-[#22A146] px-2 py-0.5 rounded">
                          {t("done")}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[9px] font-bold text-[#0C1F33] bg-white border border-[#E3E8EF] px-2 py-0.5 rounded">
                          {tLevel(levelKey(course.level))}
                        </span>
                      </div>
                      <h3
                        className="text-base text-[#0C1F33] leading-5 line-clamp-2"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {course.title}
                      </h3>
                      <p className="text-sm text-[#64748B] mt-1 truncate">
                        {course.instructor.name}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#22A146]">
                        {t("lessons", {
                          done: course.completedMaterials,
                          total: course.totalMaterials,
                        })}
                      </span>
                      <span className="text-xs font-semibold text-[#0C1F33]">
                        {course.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#22A146] rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    {course.continueLessonId ? (
                      <button
                        onClick={() =>
                          router.push(
                            `/my-courses/${course.courseId}/lessons/${course.continueLessonId}`,
                          )
                        }
                        className="flex-1 py-2.5 bg-[#12304E] text-white text-sm font-semibold rounded-lg"
                      >
                        {course.progress > 0 ? t("resume") : t("start")}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 py-2.5 bg-gray-200 text-gray-500 text-sm font-semibold rounded-lg cursor-not-allowed"
                      >
                        {t("noLessons")}
                      </button>
                    )}

                    <Link
                      href={`/my-courses/${course.courseId}/exams`}
                      className="flex-1 py-2.5 border border-[#12304E] text-[#12304E] text-sm font-semibold rounded-lg text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      {t("exams")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
