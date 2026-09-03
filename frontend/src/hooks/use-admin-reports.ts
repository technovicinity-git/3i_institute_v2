import { useQuery } from "@tanstack/react-query";
import { adminReportsService } from "@/services/admin-reports.service";

export function useLearnerActivityReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["report-learner-activity", startDate, endDate],
    queryFn: () => adminReportsService.getLearnerActivity(startDate, endDate),
  });
}

export function useCoursePerformanceReport() {
  return useQuery({
    queryKey: ["report-course-performance"],
    queryFn: () => adminReportsService.getCoursePerformance(),
  });
}

export function useEnrolmentReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["report-enrolments", startDate, endDate],
    queryFn: () => adminReportsService.getEnrolments(startDate, endDate),
  });
}

export function useAttendanceReport(courseId?: string, batchId?: string) {
  return useQuery({
    queryKey: ["report-attendance", courseId, batchId],
    queryFn: () => adminReportsService.getAttendance(courseId, batchId),
  });
}

export function useExamResultsReport(courseId?: string) {
  return useQuery({
    queryKey: ["report-exams", courseId],
    queryFn: () => adminReportsService.getExamResults(courseId),
  });
}

export function useRevenueReport(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["report-revenue", startDate, endDate],
    queryFn: () => adminReportsService.getRevenue(startDate, endDate),
  });
}

export function useInstructorActivityReport() {
  return useQuery({
    queryKey: ["report-instructors"],
    queryFn: () => adminReportsService.getInstructors(),
  });
}
