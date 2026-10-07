import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  broadcastService,
  type AdminAudience,
  type BroadcastContent,
  type BroadcastResult,
  type BroadcastScope,
} from "@/services/broadcast.service";

const keys = {
  list: (scope: BroadcastScope, page: number) =>
    ["broadcasts", scope, page] as const,
  preview: (...parts: (string | undefined)[]) =>
    ["broadcast-preview", ...parts] as const,
};

export function useBroadcasts(scope: BroadcastScope, page: number) {
  return useQuery({
    queryKey: keys.list(scope, page),
    queryFn: () => broadcastService.list(scope, page),
  });
}

export function useAdminBroadcastPreview(audience: AdminAudience) {
  return useQuery({
    queryKey: keys.preview("admin", audience),
    queryFn: () => broadcastService.previewAdmin(audience),
  });
}

export function useInstructorBroadcastPreview(
  courseId: string,
  batchId?: string,
) {
  return useQuery({
    queryKey: keys.preview("instructor", courseId, batchId),
    queryFn: () => broadcastService.previewInstructor(courseId, batchId),
    enabled: Boolean(courseId),
  });
}

function sentMessage(result: BroadcastResult) {
  const people = `${result.recipientCount} recipient${result.recipientCount === 1 ? "" : "s"}`;
  return result.pushDevices > 0
    ? `Sent to ${people} · push delivered to ${result.pushSent} of ${result.pushDevices} devices`
    : `Sent to ${people}`;
}

function errorMessage(error: unknown) {
  const message = (
    error as { response?: { data?: { error?: { message?: string } } } }
  )?.response?.data?.error?.message;
  return message ?? "Failed to send notification";
}

function useSendBroadcast<TInput>(
  scope: BroadcastScope,
  send: (input: TInput) => Promise<BroadcastResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: send,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts", scope] });
      toast.success("Notification sent", { description: sentMessage(result) });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useSendAdminBroadcast() {
  return useSendBroadcast(
    "admin",
    (input: BroadcastContent & { audience: AdminAudience }) =>
      broadcastService.sendAdmin(input),
  );
}

export function useSendInstructorBroadcast() {
  return useSendBroadcast(
    "instructor",
    (input: BroadcastContent & { courseId: string; batchId?: string }) =>
      broadcastService.sendInstructor(input),
  );
}
