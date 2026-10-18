import Image from "next/image";
import type { InstructorInfo } from "@/types/course-details";
import { useTranslations } from "next-intl";
import { initials } from "./utils";

export function CourseInstructor({ instructor }: { instructor: InstructorInfo }) {
  const t = useTranslations("courseDetails");
  return (
    <div className="flex flex-col sm:flex-row gap-8">
      <div className="shrink-0">
        {instructor.avatarUrl ? (
          <Image
            src={instructor.avatarUrl}
            alt={instructor.name}
            width={200}
            height={200}
            className="w-[120px] h-[120px] sm:w-[200px] sm:h-[200px] rounded-full object-cover"
          />
        ) : (
          <div className="w-[120px] h-[120px] sm:w-[200px] sm:h-[200px] rounded-full bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden flex items-center justify-center">
            <span className="font-serif text-4xl text-[#B8912F]">
              {initials(instructor.name)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-[#0C1F33]">{t("yourInstructor")}</p>
        <h3 className="font-serif text-[32px] text-[#0C1F33]">
          {instructor.name}
        </h3>
        <p className="text-base font-semibold text-[#64748B]">
          {t("instructorTitle")}
        </p>
        <div className="flex items-center gap-6 text-[15px] font-semibold text-[#0C1F33] flex-wrap">
          <span>{t("instructorRating", { rating: instructor.rating })}</span>
          <span>{t("instructorCourses", { count: instructor.courseCount })}</span>
          <span>{t("instructorStudents", { count: instructor.studentCount })}</span>
        </div>
        {instructor.bio && (
          <p className="text-[15px] leading-6 text-[#0C1F33] mt-1">
            {instructor.bio}
          </p>
        )}
      </div>
    </div>
  );
}
