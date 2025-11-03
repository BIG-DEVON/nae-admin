// src/lib/store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { login as apiLogin, type LoginInput } from "@/features/auth/api";

export type AuthUser =
  | {
      username: string;
      id?: string;
      name?: string;
    }
  | null;

type AuthState = {
  token: string | null;
  user: AuthUser;
  isAuthed: boolean;
  loggingIn: boolean;

  hydrate: () => void;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;

  // Always returns a plain record (possibly empty).
  authHeader: () => Record<string, string>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthed: false,
      loggingIn: false,

      hydrate: () => {
        const token = get().token ?? localStorage.getItem("token");
        const userStr = localStorage.getItem("nae_user");
        let user: AuthUser = null;
        try {
          user = userStr ? (JSON.parse(userStr) as AuthUser) : null;
        } catch {
          user = null;
        }
        set({ token: token ?? null, user, isAuthed: Boolean(token && user) });
      },

      login: async (input: LoginInput) => {
        const state = get();
        if (state.loggingIn) return;
        set({ loggingIn: true });
        try {
          const token = await apiLogin(input);
          localStorage.setItem("token", token);
          localStorage.setItem(
            "nae_user",
            JSON.stringify({ name: input.username, username: input.username })
          );
          set({
            token,
            user: { username: input.username, name: input.username },
            isAuthed: true,
          });
        } finally {
          set({ loggingIn: false });
        }
      },

      logout: () => {
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("nae_user");
        } catch {}
        set({ token: null, user: null, isAuthed: false });
      },

      // Token AS-IS (no Bearer/Token prefix), always return a concrete Record<string,string>
      authHeader: () => {
        const t = get().token ?? localStorage.getItem("token") ?? "";
        const headers: Record<string, string> = {};
        if (t) headers.Authorization = t;
        return headers;
      },
    }),
    {
      name: "auth-store",
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        state?.hydrate();
        const handler = () => state?.logout();
        window.addEventListener("app:unauthorized", handler);
        return () => window.removeEventListener("app:unauthorized", handler);
      },
    }
  )
);
