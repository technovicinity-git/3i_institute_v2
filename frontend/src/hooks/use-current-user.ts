import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useCurrentUser() {
  const { setUser } = useAuthStore();
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const response = await apiClient.get("/users/me");
      const user = response.data.data;
      setUser(user);
      return user;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}
