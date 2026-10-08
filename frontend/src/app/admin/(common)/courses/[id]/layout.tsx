"use client";

import { AdminCourseWorkspace } from "@/lib/course-workspace";

// Course screens under /admin/courses/[id] reuse the instructor screens in
// admin mode (admin links, course loaded by id).
export default function AdminCourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminCourseWorkspace>{children}</AdminCourseWorkspace>;
}
