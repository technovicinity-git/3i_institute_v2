import { CheckCircle } from "lucide-react";
import type { CourseDetails } from "@/types/course-details";

/** "What you'll learn", "Requirements" and "About this course". */
export function CourseOverview({ course }: { course: CourseDetails }) {
  return (
    <>
      {/* What you'll learn */}
      {course.learningOutcomes.length > 0 && (
        <div className="border border-[#E3E8EF] rounded-xl p-8 bg-[#FBF9F4]">
          <h2 className="font-serif text-[22px] text-[#0C1F33] mb-6">
            What you&apos;ll learn
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {course.learningOutcomes.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle
                  className="w-4 h-4 text-[#22A146] mt-0.5 shrink-0"
                  strokeWidth={2}
                />
                <span className="text-sm text-[#0C1F33]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {course.requirements.length > 0 && (
        <div>
          <h2 className="font-serif text-[22px] text-[#0C1F33] mb-4">
            Requirements
          </h2>
          <ul className="space-y-2.5">
            {course.requirements.map((req, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[15px] leading-6 text-[#0C1F33]"
              >
                <span
                  aria-hidden
                  className="mt-[9px] size-1.5 shrink-0 rounded-full bg-[#B8912F]"
                />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* About this course */}
      {course.aboutParagraphs.length > 0 && (
        <div>
          <h2 className="font-serif text-[28px] text-[#0C1F33] mb-5">
            About this course
          </h2>
          <div className="space-y-5">
            {course.aboutParagraphs.map((p, i) => (
              <p key={i} className="text-base leading-7 text-[#0C1F33]">
                {p}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
