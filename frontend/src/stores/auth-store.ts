import { create } from "zustand";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  locale: string;
  emailVerified: boolean;
  avatarUrl?: string | null;
  bio?: string | null;
  role?:
    | string
    | {
        name?: string;
      }
    | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

// Session model: the access token is kept in memory only (lost on every full
// page load); the refresh token is an httpOnly cookie set by the API. On load,
// useSessionRestore / the area layouts call refreshAccessToken() to get a new
// access token from that cookie, then fetch /users/me.
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setAccessToken: (token) => set({ accessToken: token }),
  setLoading: (loading) => set({ isLoading: loading }),

  logout: () => {
    set({ user: null, accessToken: null, isLoading: false });
    // Only clears a non-httpOnly copy. The real refreshToken cookie is
    // httpOnly, so it is cleared by the API (/auth/logout, or a rejected
    // /auth/refresh) — not from here.
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  },
}));
