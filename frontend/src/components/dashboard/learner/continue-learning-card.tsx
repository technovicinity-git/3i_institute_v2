import Image from "next/image";
import Link from "next/link";
import { BookOpen, CalendarDays, GraduationCap, PlayCircle } from "lucide-react";
import type { ContinueLearningCourse } from "@/types/dashboard";
import { SectionHeader } from "./section-header";
import { card, continueHref } from "./utils";

export function ContinueLearningCard({
  courses,
  hasCourses,
}: {
  courses: ContinueLearningCourse[];
  hasCourses: boolean;
}) {
  return (
    <div className={`${card} p-6`}>
      <SectionHeader title="Continue learning" href="/my-courses" />
      {courses.length === 0 ? (
        <div className="rounded-lg bg-[#FBF9F4] p-6 text-center">
          <GraduationCap className="w-10 h-10 text-[#B8912F] mx-auto mb-3" />
          <p className="text-sm text-[#0C1F33] font-semibold">
            {hasCourses
              ? "You've finished all your courses!"
              : "You haven't started a course yet"}
          </p>
          <Link
            href="/courses"
            className="inline-block mt-3 text-sm font-semibold text-[#22A146] hover:underline"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[#F1F5F9]">
          {courses.map((course) => (
            <ContinueLearningRow key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContinueLearningRow({ course }: { course: ContinueLearningCourse }) {
  const isOnline = course.type === "ONLINE_CLASS";
  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 py-4 first:pt-0 last:pb-0">
      <div className="relative w-[88px] h-[60px] rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-[#12304E] to-[#2a5070]">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40">
            <BookOpen className="w-6 h-6" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0C1F33] truncate">
          {course.title}
        </p>
        <p className="text-xs text-[#64748B] truncate mt-0.5">
          {course.nextLessonTitle
            ? `Next: ${course.nextLessonTitle}`
            : isOnline
              ? "Live online class"
              : "No lessons yet"}
        </p>
        {course.totalLessons > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 max-w-[220px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22A146] rounded-full"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <span className="text-[11px] text-[#64748B] whitespace-nowrap">
              {course.completedLessons}/{course.totalLessons} lessons
            </span>
          </div>
        )}
      </div>
      <Link
        href={continueHref(course)}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#12304E] text-white text-xs font-semibold rounded-lg hover:bg-[#1a4268] shrink-0"
      >
        {isOnline ? (
          <CalendarDays className="w-3.5 h-3.5" />
        ) : (
          <PlayCircle className="w-3.5 h-3.5" />
        )}
        {isOnline
          ? "Schedule"
          : course.completedLessons > 0
            ? "Resume"
            : "Start"}
      </Link>
    </div>
  );
}
