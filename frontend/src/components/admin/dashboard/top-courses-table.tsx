import Link from "next/link";
import { Star } from "lucide-react";
import type { AdminDashboardTopCourse } from "@/types/admin-dashboard";
import { SectionHeader, card } from "./utils";

export function TopCoursesTable({
  courses,
}: {
  courses: AdminDashboardTopCourse[];
}) {
  return (
    <section className={`${card} p-6`}>
      <SectionHeader title="Top courses · last 30 days" href="/admin/courses" />
      {courses.length === 0 ? (
        <p className="text-sm text-[#64748B]">
          No enrolments in the last 30 days.
        </p>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[#64748B] border-b border-[#E3E8EF]">
                <th className="pb-2 font-semibold">Course</th>
                <th className="pb-2 font-semibold text-right">New</th>
                <th className="pb-2 font-semibold text-right">Total</th>
                <th className="pb-2 font-semibold text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {courses.map((course, index) => (
                <tr key={course.id}>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <span className="w-6 text-xs font-bold text-[#94A3B8]">
                        #{index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-[#0C1F33] truncate group-hover:underline">
                          {course.title}
                        </span>
                        <span className="block text-xs text-[#64748B] truncate">
                          {course.instructor}
                          {course.type === "ONLINE_CLASS" && " · Live class"}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 text-right font-semibold text-[#22A146]">
                    +{course.enrolmentsLast30Days}
                  </td>
                  <td className="py-3 text-right text-[#0C1F33]">
                    {course.totalEnrolments}
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[#0C1F33]">
                      <Star className="w-3.5 h-3.5 text-[#B8912F] fill-[#B8912F]" />
                      {course.averageRating ?? "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
