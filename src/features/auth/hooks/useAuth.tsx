/* eslint-disable react-refresh/only-export-components */

// src/features/auth/hooks/useAuth.tsx
import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  type PropsWithChildren,
} from "react";
import { useAuthStore, type AuthUser } from "@/lib/store/auth.store";
import type { LoginInput } from "@/features/auth/api";

type AuthContextValue = {
  user: AuthUser;                              // ← match store shape { username, name?, id? } | null
  login: (input: LoginInput) => Promise<void>; // ← match store.login signature
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProviderWithState>");
  return ctx;
}

export function AuthProviderWithState({ children }: PropsWithChildren) {
  const { user, login: loginStore, logout: logoutStore, hydrate } = useAuthStore();

  // Rehydrate from persisted store on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: (input: LoginInput) => loginStore(input),
      logout: () => logoutStore(),
    }),
    [user, loginStore, logoutStore]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
