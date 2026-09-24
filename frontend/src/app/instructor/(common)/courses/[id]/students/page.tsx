"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  Users,
  Search,
  BookOpen,
  Award,
  TrendingUp,
} from "lucide-react";
import { useCourseStudents } from "@/hooks/use-instructor-students";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";
import { CourseActions } from "@/components/instructor/CourseActions";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function calculateAge(dateOfBirth: string | null): string {
  if (!dateOfBirth) return "—";
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return String(age);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CourseStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { data: courses } = useInstructorCourses();
  const course = courses?.find((c) => c.id === courseId);

  const { data, isLoading, isError } = useCourseStudents(courseId);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = data?.students.filter((student) =>
    student.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/instructor/courses")}
          className="flex items-center gap-1 text-sm font-semibold text-[#64748B] hover:text-[#0C1F33] mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to courses
        </button>

        {course && (
          <CourseActions courseId={courseId} courseType={course.type} />
        )}

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-3xl md:text-[36px] text-[#0C1F33]"
              style={{ fontFamily: "'Marcellus', serif" }}
            >
              Enrolled Students
            </h1>
            <p className="text-base text-[#64748B]">
              {data?.total ?? 0} students enrolled in{" "}
              {data?.course.title ?? "this course"}
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {data && data.students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0C1F33]">{data.total}</p>
              <p className="text-xs text-[#64748B]">Total Students</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#22A146]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#22A146]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0C1F33]">
                {Math.round(
                  data.students.reduce((sum, s) => sum + s.progress, 0) /
                    data.students.length,
                )}
                %
              </p>
              <p className="text-xs text-[#64748B]">Avg Progress</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#B8912F]/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#B8912F]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0C1F33]">
                {data.students.filter((s) => s.progress === 100).length}
              </p>
              <p className="text-xs text-[#64748B]">Completed</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#0C1F33]">
                {data.students.filter((s) => s.batchName !== null).length}
              </p>
              <p className="text-xs text-[#64748B]">In Batches</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      {data && data.students.length > 0 && (
        <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5 mb-6 max-w-[400px]">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full"
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && data?.students.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No students enrolled yet.</p>
        </div>
      )}

      {/* Students Table */}
      {!isLoading &&
        !isError &&
        filteredStudents &&
        filteredStudents.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden">
            {/* Table header */}
            <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 bg-[#FBF9F4] border-b border-[#E3E8EF] text-xs font-bold text-[#64748B] uppercase">
              <span>Student</span>
              <span>Enrolled</span>
              <span>Age</span>
              {course?.type === "ONLINE_CLASS" && <span>Batch</span>}
              {course?.type === "REGULAR" && <span>Progress</span>}
              <span>Exam Avg</span>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-[#E3E8EF]">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-2 lg:gap-4 px-6 py-4 items-center hover:bg-gray-50"
                >
                  {/* Student */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                      {student.avatarUrl ? (
                        <Image
                          src={student.avatarUrl}
                          alt={student.displayName}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#F9F6F0] flex items-center justify-center">
                          <span className="text-sm font-bold text-[#B8912F]">
                            {getInitials(student.displayName)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0C1F33] truncate">
                        {student.displayName}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {student.examAttempts} exam attempt(s)
                      </p>
                    </div>
                  </div>

                  {/* Enrolled */}
                  <span className="text-sm text-[#64748B]">
                    {formatDate(student.enrolledAt)}
                  </span>

                  {/* Age */}
                  <span className="text-sm text-[#64748B]">
                    {calculateAge(student.dateOfBirth)}
                  </span>

                  {/* Batch */}
                  {course?.type === "ONLINE_CLASS" && (
                    <div className="min-w-0">
                      {student.batchName ? (
                        <span className="text-xs font-semibold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-1 rounded">
                          {student.batchName}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-[#94A3B8]">
                          —
                        </span>
                      )}
                    </div>
                  )}

                  {/* Progress */}
                  {course?.type === "REGULAR" && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full bg-[#22A146] rounded-full"
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#0C1F33] whitespace-nowrap">
                        {student.progress}%
                      </span>
                    </div>
                  )}

                  {/* Exam Average */}
                  <span
                    className={`text-sm font-semibold ${
                      student.examAverage !== null
                        ? student.examAverage >= 50
                          ? "text-[#22A146]"
                          : "text-red-600"
                        : "text-[#94A3B8]"
                    }`}
                  >
                    {student.examAverage !== null
                      ? `${student.examAverage}%`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Filtered empty */}
      {!isLoading &&
        !isError &&
        data &&
        data.students.length > 0 &&
        filteredStudents?.length === 0 && (
          <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-[#64748B]">No students match your search.</p>
          </div>
        )}
    </div>
  );
}
