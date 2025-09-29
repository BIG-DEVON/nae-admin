// src/app/routes/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth.store";
import { ROUTES } from "./paths";

/**
 * Protects nested routes.
 * - Rehydrates auth state once (from localStorage via store.hydrate()).
 * - While checking, shows a tiny placeholder to avoid a redirect flash.
 * - If not authed, sends to /login and remembers where we came from.
 */
export default function RequireAuth() {
  const { user, hydrate } = useAuthStore();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If hydrate is synchronous (common in Zustand), this is enough.
    // If you later make it async, you can await it then setChecking(false).
    hydrate();
    setChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return <div className="p-6 text-sm text-neutral-500">Loading…</div>;
  }

  if (!user) {
    return (
      <Navigate
        to={ROUTES.login}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

/**
 * Optional guard for your login route:
 * If already signed in, bounce away from /login to home (or wherever).
 */
export function RedirectIfAuthed() {
  const { user, hydrate } = useAuthStore();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    hydrate();
    setChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return <div className="p-6 text-sm text-neutral-500">Loading…</div>;
  }

  if (user) {
    return <Navigate to={ROUTES.home} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
