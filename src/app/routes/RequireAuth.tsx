// src/app/routes/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth.store";

export default function RequireAuth() {
  const { user, hydrate } = useAuthStore();
  const loc = useLocation();
  const [checking, setChecking] = useState(true);

  // Load user from localStorage, then stop "checking"
  useEffect(() => {
    hydrate();
    setChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return <div className="p-6 text-sm text-neutral-500">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  return <Outlet />;
}
