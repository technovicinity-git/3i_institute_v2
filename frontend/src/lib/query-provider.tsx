"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { useProfileStore } from "@/stores/profile-store";

// Restores the saved learner profile once the page has hydrated (see
// profile-store.ts for why it can't happen during the first render).
function ProfileStoreHydrator() {
  useEffect(() => {
    useProfileStore.getState().restoreFromStorage();
  }, []);
  return null;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ProfileStoreHydrator />
      {children}
    </QueryClientProvider>
  );
}
