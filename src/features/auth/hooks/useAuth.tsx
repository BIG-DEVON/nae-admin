/* eslint-disable react-refresh/only-export-components */

// src/features/auth/hooks/useAuth.tsx
import { createContext, useContext, useMemo, useEffect, type PropsWithChildren } from "react";
import { useAuthStore } from "@/lib/store/auth.store";

type User = { id: string; name: string } | null;

type AuthContextValue = {
  user: User;
  login: (name: string) => void;
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

  // load user from localStorage on first mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    login: (name: string) => loginStore({ id: "demo", name }),
    logout: () => logoutStore()
  }), [user, loginStore, logoutStore]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
