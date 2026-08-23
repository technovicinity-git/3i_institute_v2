import { useEffect } from "react";
import { useLearnerProfiles } from "@/hooks/use-learner-profiles";
import { useProfileStore } from "@/stores/profile-store";

export function useDashboardInit() {
  const { data: profiles, isLoading } = useLearnerProfiles();
  const { activeProfile, setActiveProfile, setProfiles } = useProfileStore();

  useEffect(() => {
    if (profiles) {
      setProfiles(profiles);

      // If no active profile, auto-select first active one
      if (!activeProfile) {
        const firstActive = profiles.find((p) => p.isActive);
        if (firstActive) {
          setActiveProfile(firstActive);
        }
      }
    }
  }, [profiles, activeProfile, setActiveProfile, setProfiles]);

  return { isLoading };
}
