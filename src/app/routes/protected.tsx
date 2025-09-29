// src/app/routes/protected.tsx
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuthStore } from "@/lib/store/auth.store";

// --- Formations pages ---
import Chronicles from "@/features/formations/pages/Chronicles";
import SapperGenerals from "@/features/formations/pages/SapperGenerals";
import SapperChronicles from "@/features/formations/pages/SapperChronicles";
import SapperChroniclesContents from "@/features/formations/pages/SapperChroniclesContents";

// If you have a real dashboard/home page, replace this with it
function HomeRedirect() {
  return <Navigate to="/formations/chronicles" replace />;
}

/** Guard for protected areas */
export const RequireAuth = () => {
  const isAuthed = useAuthStore((s) => Boolean(s.user));
  return isAuthed ? <Outlet /> : <Navigate to="/login" replace />;
};

/**
 * Optional: A self-contained protected router.
 * If your app already defines routes elsewhere, you can ignore this component
 * and just use <RequireAuth /> around the protected area in that file.
 */
export default function ProtectedRoutes() {
  return (
    <Routes>
      {/* Everything inside here requires auth */}
      <Route element={<RequireAuth />}>
        {/* Home -> redirect to Formations/Chronicles by default */}
        <Route path="/" element={<HomeRedirect />} />

        {/* --- Formations --- */}
        <Route path="/formations/chronicles" element={<Chronicles />} />
        <Route path="/formations/sapper-generals" element={<SapperGenerals />} />
        <Route path="/formations/sapper-chronicles" element={<SapperChronicles />} />
        <Route
          path="/formations/sapper-chronicles/contents"
          element={<SapperChroniclesContents />}
        />

        {/* Catch-all inside protected area (optional) */}
        <Route path="*" element={<Navigate to="/formations/chronicles" replace />} />
      </Route>
    </Routes>
  );
}
