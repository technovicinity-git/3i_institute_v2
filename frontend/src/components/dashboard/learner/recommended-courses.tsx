import Image from "next/image";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import type { RecommendedCourse } from "@/types/dashboard";
import { SectionHeader } from "./section-header";
import { card, serif } from "./utils";

export function RecommendedCourses({
  courses,
}: {
  courses: RecommendedCourse[];
}) {
  if (courses.length === 0) return null;
  return (
    <div>
      <SectionHeader
        title="Recommended for you"
        href="/courses"
        linkLabel="Browse all"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className={`${card} overflow-hidden hover:shadow-md transition-shadow`}
          >
            <div className="relative h-[150px] bg-gradient-to-br from-[#12304E] to-[#2a5070]">
              {course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <BookOpen className="w-10 h-10" />
                </div>
              )}
              {course.type === "ONLINE_CLASS" && (
                <span className="absolute top-3 left-3 text-[9px] font-bold text-white bg-[#7C3AED] px-2 py-0.5 rounded">
                  LIVE
                </span>
              )}
            </div>
            <div className="p-5">
              <h3
                className="text-[17px] text-[#0C1F33] leading-tight line-clamp-2"
                style={serif}
              >
                {course.title}
              </h3>
              <p className="text-[13px] text-[#64748B] mt-1 truncate">
                {course.instructor}
              </p>
              <div className="flex items-center gap-1 mt-3 text-[12px]">
                <Star className="w-3.5 h-3.5 text-[#B8912F] fill-[#B8912F]" />
                <span className="font-semibold text-[#0C1F33]">
                  {course.rating ?? "New"}
                </span>
                {course.ratingCount > 0 && (
                  <span className="text-[#94A3B8]">({course.ratingCount})</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
