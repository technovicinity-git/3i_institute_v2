/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  instructorCourseService,
  type CreateCourseInput,
} from "@/services/instructor-course.service";

export function useInstructorCourses({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => instructorCourseService.getMyCourses(),
    staleTime: 60 * 1000,
    enabled,
  });
}

export function useCreateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCourseInput) =>
      instructorCourseService.createCourse(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      toast.success(
        variables.isDraft
          ? "Draft saved successfully"
          : "Course created successfully",
      );
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to create course");
    },
  });
}

export function useUpdateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      input,
    }: {
      courseId: string;
      input: Partial<CreateCourseInput>;
    }) => instructorCourseService.updateCourse(courseId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to update course");
    },
  });
}
