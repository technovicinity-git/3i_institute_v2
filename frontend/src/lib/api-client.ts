import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// The refresh token rotates on every use, so two refreshes sent with the
// same cookie leave one of them failing with 401. Every refresh in the app
// goes through here: one request per tab at a time (shared by all callers),
// and the Web Lock makes other tabs wait their turn so each one sends the
// cookie the previous refresh set.
let refreshPromise: Promise<string> | null = null;

async function requestRefresh(): Promise<string> {
  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  return response.data.data.accessToken as string;
}

async function refreshWithLock(): Promise<string> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return await navigator.locks.request("auth-refresh", requestRefresh);
  }
  return requestRefresh();
}

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshWithLock()
      .then((accessToken) => {
        useAuthStore.getState().setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// True when the server rejected the refresh token itself (expired, revoked,
// rotated), as opposed to a network error or server outage.
function isRefreshRejected(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  return status === 401 || status === 422;
}

// Request interceptor — attach access token from memory
apiClient.interceptors.request.use(
  async (config) => {
    // Don't race a refresh that is already rotating the cookie.
    if (refreshPromise && !config.url?.includes("/auth/refresh")) {
      await refreshPromise.catch(() => undefined);
    }

    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Auth endpoints where a 401 is a legitimate business response (e.g. invalid
// login credentials) rather than an expired access token — skip auto-refresh.
const AUTH_NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/resend-verification",
  "/auth/verify-email",
  "/auth/google",
  "/auth/apple",
];

// Response interceptor — refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Account deactivated by an admin while this session was active.
    if (
      isAccountInactiveError(error) &&
      !AUTH_NO_REFRESH_PATHS.some((path) =>
        originalRequest?.url?.includes(path),
      )
    ) {
      forceLogout("deactivated");
      return Promise.reject(error);
    }

    // If 401 and not already retried, try refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !AUTH_NO_REFRESH_PATHS.some((path) => originalRequest.url?.includes(path))
    ) {
      originalRequest._retry = true;

      try {
        const accessToken = await refreshAccessToken();

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (isAccountInactiveError(refreshError)) {
          forceLogout("deactivated");
          return Promise.reject(refreshError);
        }

        // Session is gone (the server also cleared the cookie). A network
        // error or outage is not a logout — keep the session for a retry.
        if (isRefreshRejected(refreshError)) {
          useAuthStore.getState().logout();
          const loginPath = loginPathFor(window.location.pathname);
          if (window.location.pathname !== loginPath) {
            window.location.href = loginPath;
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Import auth store (circular — must be after interceptor setup)
import { useAuthStore } from "@/stores/auth-store";
import {
  forceLogout,
  isAccountInactiveError,
  loginPathFor,
} from "@/lib/force-logout";
