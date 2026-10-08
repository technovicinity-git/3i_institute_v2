"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useInstructorCourses } from "@/hooks/use-instructor-courses";
import type { InstructorCourse } from "@/services/instructor-course.service";

// The course-management screens (details, materials, batches, questions,
// exams, students, assignments) are shared by the instructor panel and the
// admin panel. The workspace tells them which panel they are rendered in.
interface CourseWorkspace {
  role: "instructor" | "admin";
  // Panel root, e.g. "/instructor" or "/admin".
  panelPath: string;
  // Course routes root, e.g. "/instructor/courses" or "/admin/courses".
  basePath: string;
}

const INSTRUCTOR_WORKSPACE: CourseWorkspace = {
  role: "instructor",
  panelPath: "/instructor",
  basePath: "/instructor/courses",
};

const ADMIN_WORKSPACE: CourseWorkspace = {
  role: "admin",
  panelPath: "/admin",
  basePath: "/admin/courses",
};

const CourseWorkspaceContext = createContext<CourseWorkspace>(
  INSTRUCTOR_WORKSPACE,
);

export function AdminCourseWorkspace({ children }: { children: ReactNode }) {
  return (
    <CourseWorkspaceContext.Provider value={ADMIN_WORKSPACE}>
      {children}
    </CourseWorkspaceContext.Provider>
  );
}

export function useCourseWorkspace(): CourseWorkspace {
  return useContext(CourseWorkspaceContext);
}

// Drop-in replacement for useInstructorCourses() on course screens. Admins
// don't own the course, so the current course is loaded by id instead of from
// the instructor's own course list.
export function useWorkspaceCourses() {
  const { role } = useCourseWorkspace();
  const params = useParams();
  const courseId = (params?.id as string | undefined) ?? "";

  const instructorCourses = useInstructorCourses({
    enabled: role === "instructor",
  });
  const adminCourse = useQuery({
    // Lives under the "instructor-courses" key so existing course mutations,
    // which invalidate that key, refresh it too.
    queryKey: ["instructor-courses", "admin", courseId],
    queryFn: async (): Promise<InstructorCourse[]> => {
      const response = await apiClient.get(`/courses/${courseId}`);
      return [response.data.data as InstructorCourse];
    },
    enabled: role === "admin" && !!courseId,
  });

  return role === "admin" ? adminCourse : instructorCourses;
}
