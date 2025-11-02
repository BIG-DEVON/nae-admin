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
        const { token, user } = get();
        set({ isAuthed: Boolean(token && user) });
      },

      // Single source of truth for login. Prevents double submits.
      login: async (input: LoginInput) => {
        const state = get();
        if (state.loggingIn) return; // guard against rapid clicks / StrictMode re-runs
        set({ loggingIn: true });

        try {
          const token = await apiLogin(input);

          // persist everywhere we read from
          localStorage.setItem("token", token);
          localStorage.setItem("nae_user", JSON.stringify({ name: input.username }));

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

      authHeader: () => {
        const t = get().token ?? localStorage.getItem("token");
        return t ? { Authorization: `Bearer ${t}` } : {};
      },
    }),
    {
      name: "auth-store",
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => {
        state?.hydrate();
        // Auto-logout if http client broadcasts an unauthorized event
        const handler = () => state?.logout();
        window.addEventListener("app:unauthorized", handler);
        return () => window.removeEventListener("app:unauthorized", handler);
      },
    }
  )
);
