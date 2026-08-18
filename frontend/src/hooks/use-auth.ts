import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";

export function useAuth() {
  const {
    user,
    accessToken,
    isLoading,
    setUser,
    setAccessToken,
    setLoading,
    logout,
  } = useAuthStore();

  useEffect(() => {
    // On mount, try to refresh token to restore session
    const restoreSession = async () => {
      try {
        const response = await apiClient.post("/auth/refresh", {});

        const { accessToken: newToken } = response.data.data;
        setAccessToken(newToken);

        // Fetch user profile
        const userResponse = await apiClient.get("/users/me");
        setUser(userResponse.data.data);
      } catch {
        // No valid session
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [setUser, setAccessToken, setLoading]);

  return { user, accessToken, isLoading, logout };
}
