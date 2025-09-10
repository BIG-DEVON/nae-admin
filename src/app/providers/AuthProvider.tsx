import { PropsWithChildren, createContext, useContext, useState } from "react";

type User = { id: string; name: string } | null;
type AuthCtx = {
  user: User;
  login: (name: string) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User>(null);
  const value: AuthCtx = {
    user,
    login: (name) => setUser({ id: "demo", name }),
    logout: () => setUser(null),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within <AuthProvider>");
  return v;
};
