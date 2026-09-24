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
} from "lucide-react";
import { useProfileStore } from "@/stores/profile-store";
import { useEnrolledCourses } from "@/hooks/use-learner-courses";
import { SearchInput } from "@/components/dashboard/search-input";

function getLevelBadge(level: string): string {
  const levels: Record<string, string> = {
    "1": "BEGINNER",
    "2": "INTERMEDIATE",
    "3": "ADVANCED",
    Beginner: "BEGINNER",
    Intermediate: "INTERMEDIATE",
    Advanced: "ADVANCED",
  };
  return levels[level] ?? "ALL LEVELS";
}

function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatSessionTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function OnlineClassesPage() {
  const router = useRouter();
  const { activeProfile } = useProfileStore();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: courses,
    isLoading,
    isError,
  } = useEnrolledCourses(activeProfile?.id ?? "");

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
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Online Classes
        </h1>
        <p className="text-base text-[#64748B]">
          {onlineCourses.length} live course
          {onlineCourses.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search */}
      {onlineCourses.length > 0 && (
        <div className="mb-6">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by course or instructor..."
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
          <p className="text-red-600 font-medium">Failed to load courses.</p>
        </div>
      )}

      {/* Empty — no online courses */}
      {!isLoading && !isError && onlineCourses.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">
            You haven&apos;t joined any live classes yet.
          </p>
          <Link
            href="/courses"
            className="inline-block mt-4 text-[#22A146] font-semibold hover:underline"
          >
            Browse Courses
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
              No courses match &ldquo;{searchQuery}&rdquo;
            </p>
          </div>
        )}

      {/* Course Table */}
      {!isLoading && !isError && filteredCourses.length > 0 && (
        <div className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden">
          {/* Desktop header */}
          <div className="hidden lg:grid grid-cols-[minmax(300px,2fr)_220px_240px] items-center gap-6 px-5 py-3 bg-[#F8FAFC] border-b border-[#E3E8EF] text-xs font-semibold text-[#64748B] uppercase tracking-wide">
            <div>Course</div>
            <div>Next Session</div>
            <div>Actions</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#E3E8EF]">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="px-5 py-5 hover:bg-[#F8FAFC] transition-colors"
              >
                {/* Desktop */}
                <div className="hidden lg:grid grid-cols-[minmax(300px,2fr)_220px_240px] items-center gap-6">
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
                          {getLevelBadge(course.level)}
                        </span>
                        <span className="text-[9px] font-bold text-white bg-[#7C3AED] px-2 py-0.5 rounded">
                          LIVE
                        </span>
                      </div>
                      <h3
                        className="text-base text-[#0C1F33] leading-5 truncate"
                        style={{ fontFamily: "'Marcellus', serif" }}
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
                            {formatSessionDate(course.nextSession.scheduledAt)}{" "}
                            •{" "}
                            {formatSessionTime(course.nextSession.scheduledAt)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-[#94A3B8]">
                        No upcoming session
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/courses/${course.courseId}`}
                      className="flex items-center gap-1.5 px-4 py-2 border border-[#12304E] text-[#12304E] text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Details
                    </Link>

                    <button
                      onClick={() => {
                        router.push(
                          `/chat?courseId=${course.courseId}&courseTitle=${encodeURIComponent(course.title)}&batchId=${course.batchId}&batchName=${encodeURIComponent("Batch")}`,
                        );
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#12304E] text-white text-xs font-semibold rounded-lg hover:bg-[#1a4268] transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat
                    </button>
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
                          {getLevelBadge(course.level)}
                        </span>
                        <span className="text-[9px] font-bold text-white bg-[#7C3AED] px-2 py-0.5 rounded">
                          LIVE
                        </span>
                      </div>
                      <h3
                        className="text-base text-[#0C1F33] leading-5 line-clamp-2"
                        style={{ fontFamily: "'Marcellus', serif" }}
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
                          {formatSessionDate(course.nextSession.scheduledAt)} •{" "}
                          {formatSessionTime(course.nextSession.scheduledAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <Link
                      href={`/courses/${course.courseId}`}
                      className="flex-1 py-2.5 border border-[#12304E] text-[#12304E] text-sm font-semibold rounded-lg text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Details
                    </Link>

                    <button
                      onClick={() => {
                        router.push(
                          `/chat?courseId=${course.courseId}&courseTitle=${encodeURIComponent(course.title)}&batchId=${course?.batchId}&batchName=${encodeURIComponent("Batch")}`,
                        );
                      }}
                      className="flex-1 py-2.5 bg-[#12304E] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </button>
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
