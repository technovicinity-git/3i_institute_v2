import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { RelatedCourse } from "@/types/course-details";

export function RelatedCourses({ courses }: { courses: RelatedCourse[] }) {
  return (
    <section className="bg-[#FBF9F4] pb-[120px]">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="font-serif text-[32px] text-[#0C1F33] mb-10">
          Students also took
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((related) => (
            <Link
              key={related.id}
              href={`/courses/${related.id}`}
              className="bg-white border border-[#E3E8EF] rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-[160px] bg-gray-100">
                {related.thumbnailUrl ? (
                  <Image
                    src={related.thumbnailUrl}
                    alt={related.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Course
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white bg-[#2563BA] px-2 py-1 rounded">
                    {related.level}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#0C1F33]">
                    <Star className="w-3 h-3 text-[#B8912F] fill-[#B8912F]" />
                    {related.rating}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-[#0C1F33] leading-6 min-h-[48px]">
                  {related.title}
                </h3>
                <p className="text-[13px] text-[#64748B]">
                  {related.instructor}
                </p>
                <div className="border-t border-[#E3E8EF] pt-3 mt-auto">
                  <span className="text-[13px] font-semibold text-[#12304E] hover:underline">
                    Learn More →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
