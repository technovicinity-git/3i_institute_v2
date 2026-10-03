/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminService } from "@/services/admin.service";

export function useAdminUsers(
  page: number,
  filters: import("@/services/admin.service").AdminUserFilters = {},
) {
  return useQuery({
    queryKey: ["admin-users", page, filters],
    queryFn: () => adminService.getUsers(page, 20, filters),
  });
}

export function useSuspendUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.suspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User suspended");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to suspend user");
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

export function usePendingWaivers() {
  return useQuery({
    queryKey: ["admin-pending-waivers"],
    queryFn: () => adminService.getPendingWaivers(),
  });
}

export function useApproveWaiverMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ waiverId, tier }: { waiverId: string; tier: number }) =>
      adminService.approveWaiver(waiverId, tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-waivers"] });
      toast.success("Waiver approved");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to approve waiver");
    },
  });
}

export function useRejectWaiverMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ waiverId, reason }: { waiverId: string; reason: string }) =>
      adminService.rejectWaiver(waiverId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-waivers"] });
      toast.success("Waiver rejected");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to reject waiver");
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

export function useAdminAllWaivers(page: number, status?: string) {
  return useQuery({
    queryKey: ["admin-all-waivers", page, status],
    queryFn: () => adminService.getAllWaivers(page, status),
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
      action: string;
    }) => adminService.moderateMessage(messageId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-moderation-queue"] });
      toast.success("Moderation action completed");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to moderate");
    },
  });
}
