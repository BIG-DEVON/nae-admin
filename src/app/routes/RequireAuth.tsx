// src/app/routes/RequireAuth.tsx
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth.store";
import { ROUTES } from "./paths";

/**
 * Protects nested routes.
 * - Rehydrates auth state once (from localStorage via store.hydrate()).
 * - Subscribes to the global "app:unauthorized" event dispatched by the http client.
 * - If not authed, sends to /login and remembers where we came from.
 */
export default function RequireAuth() {
  const { user, hydrate, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  // 1) Rehydrate on mount
  useEffect(() => {
    hydrate();
    setChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Listen for global unauthorized events from the fetch client
  useEffect(() => {
    const onUnauthorized = () => {
      // clear session and push to login with return path
      logout();
      navigate(ROUTES.login, {
        replace: true,
        state: { from: location },
      });
    };

    // CustomEvent<string> from src/lib/api/client.ts (dispatchUnauthorized)
    window.addEventListener("app:unauthorized", onUnauthorized as EventListener);

    return () => {
      window.removeEventListener("app:unauthorized", onUnauthorized as EventListener);
    };
  }, [logout, navigate, location]);

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
 * Optional guard for your /login route:
 * If already signed in, bounce away from /login to the previous or home.
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
    const to = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || ROUTES.root;
    return <Navigate to={to} replace />;
  }

  return <Outlet />;
}
