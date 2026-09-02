import { useQuery } from "@tanstack/react-query";
import { instructorStudentsService } from "@/services/instructor-students.service";

export function useInstructorStudents(courseId?: string) {
  return useQuery({
    queryKey: ["instructor-students", courseId],
    queryFn: () =>
      courseId
        ? instructorStudentsService.getStudentsByCourse(courseId)
        : instructorStudentsService.getStudents(),
  });
}
