"use client";

import { CourseHeader } from "@/components/instructor/CourseHeader";

// Every screen under /instructor/courses/[id] shows which course it belongs
// to (thumbnail, title) and the course section tabs.
export default function InstructorCourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CourseHeader />
      {children}
    </>
  );
}
