import { PropsWithChildren } from "react";

/**
 * Minimal auth boundary.
 * Keep this file exporting ONLY a component to satisfy
 * react-refresh/only-export-components.
 *
 * We’ll expose the hook from src/features/auth/hooks/useAuth.ts
 */
export function AuthProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}
