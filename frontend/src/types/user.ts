export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  locale: "en" | "bn" | "hi" | "ur" | "ar";
  emailVerified: boolean;
}

export interface LearnerProfile {
  id: string;
  displayName: string;
  dateOfBirth: string;
  avatarUrl: string | null;
  chatEnabled: boolean;
  nameLocked: boolean;
  createdAt: string;
}

export interface Device {
  id: string;
  deviceName: string;
  platform: "ios" | "android" | "web";
  lastUsedAt: string;
  createdAt: string;
}
