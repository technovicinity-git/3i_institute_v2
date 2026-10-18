/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { deviceService } from "@/services/device.service";

export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: () => deviceService.getDevices(),
    staleTime: 30 * 1000,
  });
}

export function useRemoveDeviceMutation() {
  const tToast = useTranslations("devices.toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => deviceService.removeDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success(tToast("removed"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? tToast("removeFailed"));
    },
  });
}

export function useRemoveAllDevicesMutation() {
  const tToast = useTranslations("devices.toasts");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deviceService.removeAllDevices(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      toast.success(tToast("removedAll"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message;
      toast.error(message ?? tToast("removeAllFailed"));
    },
  });
}
