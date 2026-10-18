import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useProfileStore } from "@/stores/profile-store";
import { apiClient, refreshAccessToken } from "@/lib/api-client";

export function useSessionRestore() {
  const { user, setUser, setAccessToken, setLoading } = useAuthStore();
  const { setActiveProfile } = useProfileStore();

  useEffect(() => {
    // If user already in store, just set loading false
    if (user) {
      setLoading(false);
      return;
    }

    const restoreSession = async () => {
      try {
        // Try to refresh token using cookie
        await refreshAccessToken();

        // Fetch user profile
        const userResponse = await apiClient.get("/users/me");
        setUser(userResponse.data.data);

        // Restore active profile
        const storedProfile = localStorage.getItem("activeProfile");
        if (storedProfile) {
          try {
            const parsed = JSON.parse(storedProfile);
            setActiveProfile(parsed);
          } catch {
            // Invalid stored profile
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
