import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import { apiClient } from "@/lib/api-client";

export function useSessionRestore() {
  const { user, setUser, setAccessToken, setLoading } = useAuthStore();
  const { setActiveProfile } = useProfileStore();

  useEffect(() => {
    // Skip if user already loaded
    if (user) return;

    const restoreSession = async () => {
      try {
        // Try to refresh token
        const refreshResponse = await apiClient.post("/auth/refresh", {});
        const { accessToken } = refreshResponse.data.data;
        setAccessToken(accessToken);

        // Fetch user profile
        const userResponse = await apiClient.get("/users/me");
        setUser(userResponse.data.data);

        // Try to restore active profile
        const storedProfile = localStorage.getItem("activeProfile");
        if (storedProfile) {
          try {
            const parsed = JSON.parse(storedProfile);
            setActiveProfile(parsed);
          } catch {
            // Invalid stored profile — ignore
          }
        }
      } catch {
        // No valid session
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [user, setUser, setAccessToken, setActiveProfile, setLoading]);
}
