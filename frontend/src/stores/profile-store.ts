import { create } from "zustand";
import type { LearnerProfile } from "@/services/learner.service";

interface ProfileState {
  activeProfile: LearnerProfile | null;
  profiles: LearnerProfile[];
  setActiveProfile: (profile: LearnerProfile | null) => void;
  setProfiles: (profiles: LearnerProfile[]) => void;
}

// Load from localStorage on initial store creation
const loadStoredProfile = (): LearnerProfile | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("activeProfile");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const useProfileStore = create<ProfileState>((set) => ({
  activeProfile: loadStoredProfile(),
  profiles: [],

  setActiveProfile: (profile) => {
    // Persist to localStorage
    if (typeof window !== "undefined") {
      if (profile) {
        localStorage.setItem("activeProfile", JSON.stringify(profile));
      } else {
        localStorage.removeItem("activeProfile");
      }
    }
    set({ activeProfile: profile });
  },

  setProfiles: (profiles) => set({ profiles }),
}));
