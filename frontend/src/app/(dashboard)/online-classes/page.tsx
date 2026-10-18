"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  MessageSquare,
  ExternalLink,
  FileText,
  CalendarDays,
  Download,
  MoreVertical,
} from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useEnrolledCourses } from "@/hooks/use-learner-courses";
import { SearchInput } from "@/components/dashboard/search-input";
import { useLearnerCertificates } from "@/hooks/use-learner-certificates";
import { downloadExamCertificatePdf } from "@/services/learner-certificate.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { levelKey } from "@/lib/course-level";
import { useFormatter, useTranslations } from "next-intl";


/** "Thu, Oct 16 • 3:00 PM" in the user's language */
function useSessionFormat() {
  const format = useFormatter();
  return (dateStr: string) => {
    const date = new Date(dateStr);
    const day = format.dateTime(date, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const time = format.dateTime(date, { hour: "numeric", minute: "2-digit" });
    return `${day} • ${time}`;
  };
}

type EnrolledCourse = NonNullable<
  ReturnType<typeof useEnrolledCourses>["data"]
>[number];
type LearnerCertificate = NonNullable<
  ReturnType<typeof useLearnerCertificates>["data"]
>[number];

function CourseActionsMenu({
  course,
  completionCertificate,
}: {
  course: EnrolledCourse;
  completionCertificate?: LearnerCertificate;
}) {
  const t = useTranslations("classes");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("moreActions")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E3E8EF] text-[#64748B] hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 bg-white">
        <DropdownMenuItem asChild className="cursor-pointer px-3 py-2 text-[#0C1F33]">
          <Link href={`/courses/${course.courseId}`}>
            <ExternalLink className="text-[#12304E]" />
            {t("details")}
          </Link>
        </DropdownMenuItem>
        {course.batchId && (
          <DropdownMenuItem asChild className="cursor-pointer px-3 py-2 text-[#0C1F33]">
            <Link href={`/online-classes/${course.batchId}`}>
              <CalendarDays className="text-[#B8912F]" />
              {t("sessions")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild className="cursor-pointer px-3 py-2 text-[#0C1F33]">
          <Link href={`/my-courses/${course.courseId}/exams`}>
            <FileText className="text-[#12304E]" />
            {t("exams")}
          </Link>
        </DropdownMenuItem>
        {completionCertificate && (
          <DropdownMenuItem
            onSelect={() => downloadExamCertificatePdf(completionCertificate)}
            className="cursor-pointer px-3 py-2 text-[#22A146]"
          >
            <Download className="text-[#22A146]" />
            {t("certificate")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function OnlineClassesPage() {
  const t = useTranslations("classes");
  const tCourses = useTranslations("myCourses");
  const tLevel = useTranslations("courseLevel");
  const sessionWhen = useSessionFormat();
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: courses,
    isLoading,
    isError,
  } = useEnrolledCourses(activeProfile?.id ?? "");
  const { data: certificates } = useLearnerCertificates(activeProfile?.id ?? "");

  // Filter online class courses only
  const onlineCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((c) => c.type === "ONLINE_CLASS");
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return onlineCourses;
    const query = searchQuery.toLowerCase();
    return onlineCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.instructor.name.toLowerCase().includes(query),
    );
  }, [onlineCourses, searchQuery]);

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
          {t("count", { count: onlineCourses.length })}
        </p>
      </div>

      {/* Search */}
      {onlineCourses.length > 0 && (
        <div className="mb-6">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={tCourses("search")}
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
          <p className="text-red-600 font-medium">{tCourses("loadFailed")}</p>
        </div>
      )}

      {/* Empty — no online courses */}
      {!isLoading && !isError && onlineCourses.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">{t("empty")}</p>
          <Link
            href="/courses"
            className="inline-block mt-4 text-[#22A146] font-semibold hover:underline"
          >
            {tCourses("browse")}
          </Link>
        </div>
      )}

      {/* Empty — search returned nothing */}
      {!isLoading &&
        !isError &&
        onlineCourses.length > 0 &&
        filteredCourses.length === 0 && (
          <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
            <p className="text-[#64748B]">
              {tCourses("noMatch", { query: searchQuery })}
            </p>
          </div>
        )}

      {/* Course Table */}
      {!isLoading && !isError && filteredCourses.length > 0 && (
        <div className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden">
          {/* Desktop header */}
          <div className="hidden lg:grid grid-cols-[minmax(280px,1fr)_minmax(180px,220px)_100px_36px] items-center gap-6 px-5 py-3 bg-[#F8FAFC] border-b border-[#E3E8EF] text-xs font-semibold text-[#64748B] uppercase tracking-wide">
            <div>{tCourses("colCourse")}</div>
            <div>{t("colNextSession")}</div>
            <div>{t("colChat")}</div>
            <div className="sr-only">{tCourses("colActions")}</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#E3E8EF]">
            {filteredCourses.map((course) => {
              const completionCertificate = certificates?.find(
                (certificate) =>
                  certificate.courseId === course.courseId &&
                  certificate.type === "COMPLETION",
              );

              return (
              <div
                key={course.id}
                className="px-5 py-5 hover:bg-[#F8FAFC] transition-colors"
              >
                {/* Desktop */}
                <div className="hidden lg:grid grid-cols-[minmax(280px,1fr)_minmax(180px,220px)_100px_36px] items-center gap-6">
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
                        <span className="text-[9px] font-bold text-white bg-[#7C3AED] px-2 py-0.5 rounded">
                          {t("live")}
                        </span>
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

                  {/* Next Session */}
                  <div>
                    {course.nextSession ? (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-[#B8912F] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0C1F33] truncate">
                            {course.nextSession.title}
                          </p>
                          <p className="text-xs text-[#64748B] mt-1">
                            {sessionWhen(course.nextSession.scheduledAt)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-[#94A3B8]">
                        {t("noUpcoming")}
                      </span>
                    )}
                  </div>

                  {/* Chat */}
                  <div>
                    <button
                      onClick={() => {
                        router.push(
                          `/chat?courseId=${course.courseId}&courseTitle=${encodeURIComponent(course.title)}&batchId=${course.batchId}&batchName=${encodeURIComponent(t("batch"))}`,
                        );
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#12304E] text-white text-xs font-semibold rounded-lg hover:bg-[#1a4268] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t("chat")}
                    </button>
                  </div>

                  {/* More actions */}
                  <div className="flex justify-end">
                    <CourseActionsMenu
                      course={course}
                      completionCertificate={completionCertificate}
                    />
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
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[9px] font-bold text-[#0C1F33] bg-white border border-[#E3E8EF] px-2 py-0.5 rounded">
                          {tLevel(levelKey(course.level))}
                        </span>
                        <span className="text-[9px] font-bold text-white bg-[#7C3AED] px-2 py-0.5 rounded">
                          {t("live")}
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

                  {/* Next Session */}
                  {course.nextSession && (
                    <div className="flex items-start gap-2 bg-[#F9F6F0] rounded-lg px-3 py-2 mt-4">
                      <Calendar className="w-3.5 h-3.5 text-[#B8912F] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#0C1F33] truncate">
                          {course.nextSession.title}
                        </p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          {sessionWhen(course.nextSession.scheduledAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        router.push(
                          `/chat?courseId=${course.courseId}&courseTitle=${encodeURIComponent(course.title)}&batchId=${course?.batchId}&batchName=${encodeURIComponent(t("batch"))}`,
                        );
                      }}
                      className="flex-1 py-2.5 bg-[#12304E] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {t("chat")}
                    </button>
                    <CourseActionsMenu
                      course={course}
                      completionCertificate={completionCertificate}
                    />
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
