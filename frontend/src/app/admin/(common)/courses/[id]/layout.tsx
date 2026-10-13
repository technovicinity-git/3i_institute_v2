"use client";

import { AdminCourseWorkspace } from "@/lib/course-workspace";
import { CourseHeader } from "@/components/instructor/CourseHeader";

// Course screens under /admin/courses/[id] reuse the instructor screens in
// admin mode (admin links, course loaded by id), under the same course
// header (thumbnail, title, section tabs).
export default function AdminCourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminCourseWorkspace>
      <CourseHeader />
      {children}
    </AdminCourseWorkspace>
  );
}
