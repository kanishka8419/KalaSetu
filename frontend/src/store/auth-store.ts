/* ============================================================
   KalaSetu — Auth Store (Zustand)
   ============================================================ */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { api } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role: "artisan" | "buyer";
    craft_specialty?: string;
    bio?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.login(email, password);
          localStorage.setItem("access_token", response.access_token);
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.register(data);
          localStorage.setItem("access_token", response.access_token);
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch {}
        localStorage.removeItem("access_token");
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),

      checkAuth: async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false });
          return;
        }
        try {
          const user = await api.getMe();
          set({ user, token, isAuthenticated: true });
        } catch {
          localStorage.removeItem("access_token");
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "kalasetu-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
