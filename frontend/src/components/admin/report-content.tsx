"use client";

import { useState } from "react";
import {
  useLearnerActivityReport,
  useCoursePerformanceReport,
  useEnrolmentReport,
  useAttendanceReport,
  useExamResultsReport,
  useRevenueReport,
  useInstructorActivityReport,
} from "@/hooks/use-admin-reports";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-8 h-8 rounded-full border-4 border-[#0D2B45] border-t-transparent animate-spin" />
    </div>
  );
}

export function ReportContent({
  type,
  dateRange,
}: {
  type: string;
  dateRange: string;
}) {
  // Date filters based on range
  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    if (dateRange === "daily") start.setDate(now.getDate() - 1);
    else if (dateRange === "weekly") start.setDate(now.getDate() - 7);
    else if (dateRange === "monthly") start.setMonth(now.getMonth() - 1);
    else start.setFullYear(now.getFullYear() - 1); // custom = yearly

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
    };
  };

  const { startDate, endDate } = getDateRange();

  switch (type) {
    case "learner-activity":
      return <LearnerActivity startDate={startDate} endDate={endDate} />;
    case "course-performance":
      return <CoursePerformance />;
    case "enrolments":
      return <Enrolment startDate={startDate} endDate={endDate} />;
    case "attendance":
      return <Attendance />;
    case "exams":
      return <ExamResults />;
    case "revenue":
      return <Revenue startDate={startDate} endDate={endDate} />;
    case "instructors":
      return <InstructorActivity />;
    default:
      return <p className="text-[#64748B]">Select a report type.</p>;
  }
}

function LearnerActivity({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const { data, isLoading, isError } = useLearnerActivityReport(
    startDate,
    endDate,
  );

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <p className="text-red-600 text-sm">Failed to load report.</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#0C1F33]">
          {data?.totalEnrolments ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Total Enrolments</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#0C1F33]">
          {data?.activeLearners ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Active Learners</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#0C1F33]">
          {data?.completedMaterials ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Completed Materials</p>
      </div>
    </div>
  );
}

function CoursePerformance() {
  const { data, isLoading, isError } = useCoursePerformanceReport();

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <p className="text-red-600 text-sm">Failed to load report.</p>;

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {data?.map((course) => (
        <div
          key={course.id}
          className="flex items-center justify-between p-3 bg-[#FBF9F4] rounded-lg"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0C1F33] truncate">
              {course.title}
            </p>
            <p className="text-xs text-[#64748B]">
              {course.type} • {course.status}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#64748B] shrink-0">
            <span>{course.enrolmentCount} students</span>
            <span>★ {course.averageRating ?? "—"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Enrolment({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const { data, isLoading, isError } = useEnrolmentReport(startDate, endDate);

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <p className="text-red-600 text-sm">Failed to load report.</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#0C1F33]">{data?.total ?? 0}</p>
        <p className="text-xs text-[#64748B] mt-1">Total Enrolments</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#B8912F]">
          {data?.waitlisted ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Waitlisted</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#22A146]">
          {data?.byCourse.length ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Courses with Enrolments</p>
      </div>
    </div>
  );
}

function Attendance() {
  const { data, isLoading, isError } = useAttendanceReport();

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <p className="text-red-600 text-sm">Failed to load report.</p>;

  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#0C1F33]">
          {data?.summary.total ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Total</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#22A146]">
          {data?.summary.present ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Present</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-red-600">
          {data?.summary.absent ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Absent</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#B8912F]">
          {data?.summary.late ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Late</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#2563EB]">
          {data?.summary.excused ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Excused</p>
      </div>
    </div>
  );
}

function ExamResults() {
  const { data, isLoading, isError } = useExamResultsReport();

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <p className="text-red-600 text-sm">Failed to load report.</p>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#0C1F33]">
          {data?.summary.total ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Total Attempts</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#22A146]">
          {data?.summary.passed ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Passed</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-red-600">
          {data?.summary.failed ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Failed</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-orange-500">
          {data?.summary.pendingGrading ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Pending Grading</p>
      </div>
    </div>
  );
}

function Revenue({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const { data, isLoading, isError } = useRevenueReport(startDate, endDate);

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <p className="text-red-600 text-sm">Failed to load report.</p>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#0C1F33]">
          {data?.summary.totalSubscriptions ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Total Subscriptions</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#22A146]">
          {data?.summary.activeSubscriptions ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Active</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#2563EB]">
          {data?.summary.totalSeats ?? 0}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Total Seats</p>
      </div>
      <div className="bg-[#FBF9F4] rounded-lg p-5 text-center">
        <p className="text-2xl font-bold text-[#B8912F]">
          ${(data?.summary.estimatedMonthlyRevenue ?? 0).toFixed(2)}
        </p>
        <p className="text-xs text-[#64748B] mt-1">Est. Monthly Revenue</p>
      </div>
    </div>
  );
}

function InstructorActivity() {
  const { data, isLoading, isError } = useInstructorActivityReport();

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <p className="text-red-600 text-sm">Failed to load report.</p>;

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto">
      {data?.map((instructor) => (
        <div
          key={instructor.id}
          className="flex items-center justify-between p-3 bg-[#FBF9F4] rounded-lg"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0C1F33] truncate">
              {instructor.name}
            </p>
            <p className="text-xs text-[#64748B]">{instructor.email}</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#64748B] shrink-0">
            <span>{instructor.courseCount} courses</span>
            <span>{instructor.totalEnrolments} students</span>
            <span>{instructor.totalBatches} batches</span>
          </div>
        </div>
      ))}
    </div>
  );
}
