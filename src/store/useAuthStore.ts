import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AdminSection } from "@/lib/api";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  sections: AdminSection[];
}

// Roles that always have full access server-side, regardless of what's in
// their `sections` array. Mirrors the backend guard's bypass so the UI
// never hides/blocks something the API would actually allow.
const FULL_ACCESS_ROLES = new Set(["SUPER_ADMIN", "ADMIN"]);

interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AdminUser, accessToken: string, refreshToken: string) => void;
  updateUser: (user: AdminUser) => void;
  logout: () => void;
  hasSection: (section: AdminSection) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      updateUser: (user) => set({ user }),
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      hasSection: (section) => {
        const { user } = get();
        if (!user) return false;
        if (FULL_ACCESS_ROLES.has(user.role)) return true;
        return user.sections?.includes(section) ?? false;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
