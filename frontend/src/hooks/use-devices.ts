/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deviceService } from "@/services/device.service";

export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: () => deviceService.getDevices(),
    staleTime: 30 * 1000,
  });
}

export function useRemoveDeviceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => deviceService.removeDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("Device de-authorised");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to de-authorise device");
    },
  });
}

export function useRemoveAllDevicesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deviceService.removeAllDevices(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success("All devices de-authorised");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? "Failed to de-authorise devices");
    },
  });
}
