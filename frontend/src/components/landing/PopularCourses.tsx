"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import { useCourses } from "@/hooks/use-courses";

function levelLabel(level: string): string {
  const levels: Record<string, string> = {
    "1": "Beginner",
    "2": "Intermediate",
    "3": "Advanced",
  };
  return levels[level] ?? level ?? "All levels";
}

/** The four most popular published courses. */
export default function PopularCourses() {
  const { data, isLoading } = useCourses({
    page: 1,
    limit: 4,
    sortBy: "popularity",
  });
  const courses = data?.courses ?? [];

  if (!isLoading && courses.length === 0) return null;

  return (
    <section
      className="py-16 md:py-24 bg-white border-t border-gray-50 scroll-mt-20"
      id="courses"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-xs font-semibold text-brand-gold uppercase tracking-widest mb-2">
              Academic Catalogue
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-navy">
              Popular Right Now
            </h2>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center border border-gray-300 text-gray-700 font-medium text-sm py-2 px-6 rounded-md hover:bg-gray-50"
          >
            View All Courses
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="h-[340px] rounded-xl border border-gray-100 bg-gray-50 animate-pulse"
                />
              ))
            : courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex flex-col h-full"
                >
                  <div className="relative w-full h-48 bg-gradient-to-br from-[#12304E] to-[#2a5070]">
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
                      <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-[#7C3AED] px-2 py-0.5 rounded">
                        LIVE CLASS
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded text-brand-green bg-green-50">
                        {levelLabel(course.level)}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        {course.averageRating ?? "New"}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl text-brand-navy mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 flex-grow">
                      {course.instructor.name}
                    </p>
                    <span className="text-brand-green text-sm font-semibold group-hover:text-brand-green-dark text-right mt-auto">
                      Learn More
                    </span>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
