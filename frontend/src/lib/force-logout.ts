"use client";

import { disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth-store";

export type ForcedLogoutReason = "deactivated" | "deleted";

const REASON_KEY = "forced-logout-reason";

export const FORCED_LOGOUT_MESSAGES: Record<ForcedLogoutReason, string> = {
  deactivated:
    "Your account has been deactivated by an administrator. Please contact support if you think this is a mistake.",
  deleted: "Your account has been removed by an administrator.",
};

let inProgress = false;

function loginPathFor(pathname: string): string {
  if (pathname.startsWith("/admin")) return "/admin/login";
  if (pathname.startsWith("/instructor")) return "/instructor/login";
  return "/login";
}

// Ends the local session after the server has revoked it (account
// deactivated or deleted) and sends the user to the matching login page.
// The reason survives the full-page redirect so the login page can show it.
export function forceLogout(reason: ForcedLogoutReason = "deactivated"): void {
  if (inProgress || typeof window === "undefined") return;
  inProgress = true;

  try {
    sessionStorage.setItem(REASON_KEY, reason);
  } catch {
    // Storage unavailable; the user is still logged out.
  }
  try {
    localStorage.removeItem("activeProfile");
  } catch {
    // Ignore.
  }

  disconnectSocket();
  useAuthStore.getState().logout();
  window.location.href = loginPathFor(window.location.pathname);
}

// Returns (and clears) the reason stored by the last forced logout.
export function consumeForcedLogoutReason(): ForcedLogoutReason | null {
  try {
    const reason = sessionStorage.getItem(REASON_KEY);
    sessionStorage.removeItem(REASON_KEY);
    return reason === "deactivated" || reason === "deleted" ? reason : null;
  } catch {
    return null;
  }
}

export function isAccountInactiveError(error: unknown): boolean {
  const response = (
    error as {
      response?: { status?: number; data?: { error?: { code?: string } } };
    }
  )?.response;
  return (
    response?.status === 403 &&
    response.data?.error?.code === "ACCOUNT_INACTIVE"
  );
}
