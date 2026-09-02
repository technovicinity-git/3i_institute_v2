/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { attendanceService } from "@/services/attendance.service";

export function useSessionAttendance(sessionId: string) {
  return useQuery({
    queryKey: ["session-attendance", sessionId],
    queryFn: () => attendanceService.getSessionAttendance(sessionId),
    enabled: !!sessionId,
  });
}

export function useMarkAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      learnerProfileId,
      status,
    }: {
      sessionId: string;
      learnerProfileId: string;
      status: string;
    }) => attendanceService.markAttendance(sessionId, learnerProfileId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-attendance"] });
      toast.success("Attendance marked");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to mark attendance");
    },
  });
}
