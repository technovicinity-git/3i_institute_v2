"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AppNotification } from "@/services/notification.service";
import { useMarkNotificationRead } from "@/hooks/use-notifications";

// Marks a notification read and navigates to its deep link.
export function useOpenNotification(onDone?: () => void) {
  const router = useRouter();
  const markRead = useMarkNotificationRead();
  const { mutate } = markRead;

  return useCallback(
    (notification: AppNotification) => {
      if (!notification.read) mutate(notification.id);
      onDone?.();
      const route = notification.data?.route;
      // Only follow app-relative links.
      if (typeof route === "string" && route.startsWith("/")) {
        router.push(route);
      }
    },
    [mutate, onDone, router],
  );
}
