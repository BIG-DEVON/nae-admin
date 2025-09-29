// src/features/overview/pages/Overview.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Overview layout:
 * - Redirects /overview → /overview/history
 * - Renders child routes via <Outlet />
 * (Tabs are rendered inside each child page already.)
 */
export default function Overview() {
  const { pathname } = useLocation();
  const atBase = pathname === "/overview" || pathname === "/overview/";

  if (atBase) {
    return <Navigate to="/overview/history" replace />;
  }

  return (
    <div className="p-6">
      <Outlet />
    </div>
  );
}
