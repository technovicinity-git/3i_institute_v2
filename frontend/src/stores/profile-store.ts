import { create } from "zustand";
import type { LearnerProfile } from "@/services/learner.service";

interface ProfileState {
  activeProfile: LearnerProfile | null;
  profiles: LearnerProfile[];
  setActiveProfile: (profile: LearnerProfile | null) => void;
  setProfiles: (profiles: LearnerProfile[]) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  activeProfile: null,
  profiles: [],

  setActiveProfile: (profile) => set({ activeProfile: profile }),
  setProfiles: (profiles) => set({ profiles }),
}));
