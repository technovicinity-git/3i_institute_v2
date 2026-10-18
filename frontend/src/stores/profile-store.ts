import { create } from "zustand";
import type { LearnerProfile } from "@/services/learner.service";

interface ProfileState {
  activeProfile: LearnerProfile | null;
  profiles: LearnerProfile[];
  setActiveProfile: (profile: LearnerProfile | null) => void;
  setProfiles: (profiles: LearnerProfile[]) => void;
  /** Loads the profile saved on this device. Call once, after hydration. */
  restoreFromStorage: () => void;
}

// Starts empty on the server AND in the browser. Reading localStorage here
// would give the browser's first render a profile the server-rendered HTML
// didn't have (server: loading spinner, browser: full dashboard), which
// breaks hydration. ProfileStoreHydrator restores it right after hydrating.
export const useProfileStore = create<ProfileState>((set, get) => ({
  activeProfile: null,
  profiles: [],

  restoreFromStorage: () => {
    if (get().activeProfile) return;
    try {
      const stored = localStorage.getItem("activeProfile");
      if (stored) set({ activeProfile: JSON.parse(stored) });
    } catch {
      // Storage blocked or bad JSON — the user picks a profile again.
    }
  },

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
