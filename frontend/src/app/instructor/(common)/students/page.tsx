"use client";

import { useState } from "react";
import { Search, Users, BookOpen, Filter } from "lucide-react";
import { useInstructorStudents } from "@/hooks/use-instructor-students";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";

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

export default function InstructorStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  const { data: courses } = useInstructorCourses();
  const { data, isLoading, isError } = useInstructorStudents(
    selectedCourse || undefined,
  );

  const filteredStudents = data?.students.filter((student) =>
    student.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl md:text-[36px] text-[#0C1F33]"
          style={{ fontFamily: "'Marcellus', serif" }}
        >
          Students
        </h1>
        <p className="text-base text-[#64748B]">
          {data?.total ?? 0} students enrolled in your courses
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2 bg-white border border-[#E3E8EF] rounded-lg px-4 py-2.5">
          <Filter className="w-4 h-4 text-[#94A3B8]" />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-transparent text-sm outline-none"
          >
            <option value="">All Courses</option>
            {courses?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-4 border-[#12304E] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filteredStudents?.length === 0 && (
        <div className="bg-white border border-dashed border-[#E3E8EF] rounded-xl p-10 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-[#64748B]">No students found.</p>
        </div>
      )}

      {/* Students Table */}
      {!isLoading &&
        !isError &&
        filteredStudents &&
        filteredStudents.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 bg-[#FBF9F4] border-b border-[#E3E8EF] text-xs font-bold text-[#64748B] uppercase">
              <span>Student</span>
              <span>Course</span>
              <span>Enrolled</span>
              <span className="text-center">Age</span>
              <span className="text-center">Progress</span>
              <span className="text-center">Attendance</span>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-[#E3E8EF]">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-gray-50"
                >
                  {/* Student name + avatar */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F9F6F0] flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-[#B8912F]">
                        {student.displayName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#0C1F33]">
                      {student.displayName}
                    </span>
                  </div>

                  {/* Course */}
                  <div className="flex items-center gap-1.5 text-sm text-[#64748B] truncate">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{student.courseTitle}</span>
                  </div>

                  {/* Enrolled date */}
                  <span className="text-sm text-[#64748B]">
                    {formatDate(student.enrolledAt)}
                  </span>

                  {/* Age */}
                  <span className="text-sm text-[#64748B] text-center">
                    {calculateAge(student.dateOfBirth)}
                  </span>

                  {/* Progress */}
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#22A146] rounded-full"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#0C1F33]">
                      {student.progress}%
                    </span>
                  </div>

                  {/* Attendance */}
                  <span className="text-sm text-[#64748B] text-center">
                    {student.attendanceRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
