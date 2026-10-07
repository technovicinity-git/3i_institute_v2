"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth-store";
import {
  FORCED_LOGOUT_MESSAGES,
  consumeForcedLogoutReason,
  forceLogout,
  type ForcedLogoutReason,
} from "@/lib/force-logout";

// Logs the user out as soon as an admin deactivates (or deletes) their
// account, and explains why after the redirect to the login page.
export function AccountStatusWatcher() {
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const reason = consumeForcedLogoutReason();
    if (reason) {
      toast.error("You have been signed out", {
        description: FORCED_LOGOUT_MESSAGES[reason],
        duration: 10000,
      });
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket(accessToken);

    const handleDeactivated = (payload?: { reason?: ForcedLogoutReason }) => {
      forceLogout(payload?.reason ?? "deactivated");
    };
    const handleConnectError = (error: Error) => {
      if (error.message === "ACCOUNT_INACTIVE") forceLogout("deactivated");
    };

    socket.on("account:deactivated", handleDeactivated);
    socket.on("connect_error", handleConnectError);
    return () => {
      socket.off("account:deactivated", handleDeactivated);
      socket.off("connect_error", handleConnectError);
    };
  }, [accessToken]);

  return null;
}
