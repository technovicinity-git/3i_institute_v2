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

// Request interceptor — attach access token from memory
apiClient.interceptors.request.use(
  (config) => {
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
      !AUTH_NO_REFRESH_PATHS.some((path) =>
        originalRequest.url?.includes(path),
      )
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const { accessToken } = response.data.data;
        useAuthStore.getState().setAccessToken(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (isAccountInactiveError(refreshError)) {
          forceLogout("deactivated");
          return Promise.reject(refreshError);
        }

        // Refresh failed — logout
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Import auth store (circular — must be after interceptor setup)
import { useAuthStore } from "@/stores/auth-store";
import { forceLogout, isAccountInactiveError } from "@/lib/force-logout";
