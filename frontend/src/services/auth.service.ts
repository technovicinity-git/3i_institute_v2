import { apiClient } from "@/lib/api-client";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterLearnerInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  locale: string;
  guardianName?: string;
  guardianEmail?: string;
  learnerDisplayName: string;
  learnerDateOfBirth: string;
  learnerAvatarUrl?: string;
  learnerPin?: string;
}

export interface RegisterInstructorInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  locale: string;
  bio: string;
  areaOfExpertise: string;
  cvUrl: string;
  wwccNumber: string;
  wwccState: string;
  wwccExpiry: string;
}

export interface AuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    locale: string;
    emailVerified: boolean;
  };
  accessToken: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  locale: "en" | "bn" | "hi" | "ur" | "ar";
}

export interface RegisterResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    locale: string;
    emailVerified: boolean;
  };
}

export const authService = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", input);
    return response.data.data;
  },
  register: async (input: RegisterInput): Promise<RegisterResponse> => {
    const response = await apiClient.post("/auth/register", input);
    return response.data.data;
  },

  registerLearner: async (
    input: RegisterLearnerInput,
  ): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/register/learner", input);
    return response.data.data;
  },

  registerInstructor: async (
    input: RegisterInstructorInput,
  ): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/register/instructor", input);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await apiClient.post("/auth/refresh", {});
    return response.data.data;
  },

  googleLogin: async (
    idToken: string,
    dateOfBirth?: string,
  ): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/google", {
      idToken,
      dateOfBirth,
    });
    return response.data.data;
  },

  appleLogin: async (
    identityToken: string,
    dateOfBirth?: string,
    firstName?: string,
    lastName?: string,
  ): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/apple", {
      identityToken,
      dateOfBirth,
      firstName,
      lastName,
    });
    return response.data.data;
  },
};
