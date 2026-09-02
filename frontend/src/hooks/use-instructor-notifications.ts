import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { instructorNotificationService } from "@/services/instructor-notification.service";

export function useInstructorNotifications(page = 1) {
  return useQuery({
    queryKey: ["instructor-notifications", page],
    queryFn: () => instructorNotificationService.getNotifications(page),
    staleTime: 30 * 1000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      instructorNotificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-notifications"] });
    },
    onError: () => {
      toast.error("Failed to mark as read");
    },
  });
}

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => instructorNotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark notifications");
    },
  });
}
