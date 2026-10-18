/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";
import type {
  AdminQuestionBulkAction,
  AdminQuestionFilters,
  ModerationAction,
} from "@/services/admin.service";

export function useAdminUsers(
  page: number,
  filters: import("@/services/admin.service").AdminUserFilters = {},
) {
  return useQuery({
    queryKey: ["admin-users", page, filters],
    queryFn: () => adminService.getUsers(page, 20, filters),
  });
}

export function useAdminLearnerProfiles(
  page: number,
  filters: { search?: string; status?: string; seatStatus?: string } = {},
) {
  return useQuery({
    queryKey: ["admin-learner-profiles", page, filters],
    queryFn: () => adminService.getLearnerProfiles(page, filters),
  });
}

export function useAdminLearnerProfile(id: string) {
  return useQuery({
    queryKey: ["admin-learner-profile", id],
    queryFn: () => adminService.getLearnerProfileDetails(id),
    enabled: Boolean(id),
  });
}

function useLearnerProfileAction(action: "archive" | "restore") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => action === "archive" ? adminService.archiveLearnerProfile(id) : adminService.restoreLearnerProfile(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-learner-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["admin-learner-profile", id] });
      toast.success(action === "archive" ? "Learner profile archived" : "Learner profile restored");
    },
    onError: (error: any) => toast.error(error.response?.data?.error?.message ?? `Failed to ${action} learner profile`),
  });
}

// ── Question Bank ──

export function useAdminQuestions(page: number, filters: AdminQuestionFilters) {
  return useQuery({
    queryKey: ["admin-questions", page, filters],
    queryFn: () => adminService.getQuestions(page, filters),
  });
}

export function useAdminQuestionFilterOptions() {
  return useQuery({
    queryKey: ["admin-question-filters"],
    queryFn: () => adminService.getQuestionFilterOptions(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminQuestion(id: string | null) {
  return useQuery({
    queryKey: ["admin-question", id],
    queryFn: () => adminService.getQuestion(id!),
    enabled: Boolean(id),
  });
}

const QUESTION_ACTION_TEXT = {
  archive: { done: "Question archived", failed: "Failed to archive question" },
  restore: { done: "Question restored", failed: "Failed to restore question" },
  delete: { done: "Question deleted", failed: "Failed to delete question" },
} as const;

/** Archive, restore or delete one question. */
export function useAdminQuestionAction(action: AdminQuestionBulkAction) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      action === "archive"
        ? adminService.archiveQuestion(id)
        : action === "restore"
          ? adminService.restoreQuestion(id)
          : adminService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-question"] });
      toast.success(QUESTION_ACTION_TEXT[action].done);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error?.message ?? QUESTION_ACTION_TEXT[action].failed,
      );
    },
  });
}

/** One action on many questions; reports the ones that couldn't be done. */
export function useAdminQuestionBulkAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, action }: { ids: string[]; action: AdminQuestionBulkAction }) =>
      adminService.bulkQuestions(ids, action),
    onSuccess: (result, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      const verb = action === "archive" ? "archived" : action === "restore" ? "restored" : "deleted";
      if (result.succeeded > 0) {
        toast.success(`${result.succeeded} question${result.succeeded === 1 ? "" : "s"} ${verb}`);
      }
      if (result.failed.length > 0) {
        toast.error(
          `${result.failed.length} couldn't be ${verb}: ${result.failed[0]!.reason}`,
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message ?? "Bulk action failed");
    },
  });
}

export function useArchiveLearnerProfileMutation() { return useLearnerProfileAction("archive"); }
export function useRestoreLearnerProfileMutation() { return useLearnerProfileAction("restore"); }

export function useSuspendUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.suspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deactivated and signed out");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to deactivate user");
    },
  });
}

export function useActivateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User activated");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to activate user");
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to delete user");
    },
  });
}

export function useAdminInstructors() {
  return useQuery({
    queryKey: ["admin-instructors"],
    queryFn: () => adminService.getInstructors(),
  });
}

export function useAdminInstructor(id: string) {
  return useQuery({ queryKey: ["admin-instructor", id], queryFn: () => adminService.getInstructorDetails(id), enabled: Boolean(id) });
}

function useInstructorStatusMutation(action: "suspend" | "reinstate") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => action === "suspend" ? adminService.suspendInstructor(id) : adminService.reinstateInstructor(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-instructor", id] });
      toast.success(action === "suspend" ? "Instructor suspended" : "Instructor reinstated");
    },
    onError: (error: any) => toast.error(error.response?.data?.error?.message ?? `Failed to ${action} instructor`),
  });
}

export function useSuspendInstructorMutation() { return useInstructorStatusMutation("suspend"); }
export function useReinstateInstructorMutation() { return useInstructorStatusMutation("reinstate"); }

export function usePendingApplications() {
  return useQuery({
    queryKey: ["admin-pending-applications"],
    queryFn: () => adminService.getPendingApplications(),
  });
}

export function useApproveInstructorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.approveInstructor(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pending-applications"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-instructor", userId] });
      toast.success("Instructor approved");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to approve instructor");
    },
  });
}

export function useRejectInstructorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminService.rejectInstructor(userId, reason),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-pending-applications"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-instructor", userId] });
      toast.success("Instructor rejected");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to reject instructor");
    },
  });
}

export function usePendingCourses() {
  return useQuery({
    queryKey: ["admin-pending-courses"],
    queryFn: () => adminService.getPendingCourses(),
  });
}

export function useApproveCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => adminService.approveCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-courses"] });
      toast.success("Course approved");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to approve course");
    },
  });
}

export function useRejectCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, reason }: { courseId: string; reason: string }) =>
      adminService.rejectCourse(courseId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-courses"] });
      toast.success("Course rejected");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to reject course");
    },
  });
}

export function useAdminAllCourses(page: number, status?: string) {
  return useQuery({
    queryKey: ["admin-all-courses", page, status],
    queryFn: () => adminService.getAllCourses(page, status),
  });
}

export function useSuspendCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => adminService.suspendCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-courses"] });
      toast.success("Course suspended");
    },
  });
}

export function useActivateCourseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => adminService.activateCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-courses"] });
      toast.success("Course activated");
    },
  });
}

export function useModerationQueue() {
  return useQuery({
    queryKey: ["admin-moderation-queue"],
    queryFn: () => adminService.getModerationQueue(),
    staleTime: 30 * 1000,
  });
}

export function useModerateMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      action,
    }: {
      messageId: string;
      action: ModerationAction;
    }) => adminService.moderateMessage(messageId, action),
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-moderation-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      toast.success(
        action === "DELETE" ? "Message deleted" : "Reports dismissed",
      );
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to moderate");
    },
  });
}
