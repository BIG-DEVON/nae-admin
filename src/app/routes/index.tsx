// src/app/routes/index.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import RequireAuth from '@/app/routes/RequireAuth';
import { Shell as AppLayout } from '@/components/layout/Shell';
import { useAuthStore } from '@/lib/store/auth.store';

// Lazy pages
const Login       = lazy(() => import('@/features/auth/pages/Login'));
const Dashboard   = lazy(() => import('@/pages/Dashboard'));

const GalleryList   = lazy(() => import('@/features/gallery/pages/GalleryList'));
const GalleryHome   = lazy(() => import('@/features/gallery/pages/GalleryHome'));
const GalleryDetail = lazy(() => import('@/features/gallery/pages/GalleryDetail'));

const Awards        = lazy(() => import('@/features/awards/pages/Awards'));
const AwardSections = lazy(() => import('@/features/awards/pages/AwardSections'));
const AwardContents = lazy(() => import('@/features/awards/pages/AwardContents'));

const FormChronicles            = lazy(() => import('@/features/formations/pages/Chronicles'));
const FormChronicleSections     = lazy(() => import('@/features/formations/pages/ChronicleSections'));
const FormChronicleContents     = lazy(() => import('@/features/formations/pages/ChronicleContents'));
const SapperGenerals            = lazy(() => import('@/features/formations/pages/SapperGenerals'));
const SapperChronicles          = lazy(() => import('@/features/formations/pages/SapperChronicles'));
const SapperChroniclesContents  = lazy(() => import('@/features/formations/pages/SapperChroniclesContents'));

const OverviewHistory    = lazy(() => import('@/features/overview/pages/History'));
const OverviewOrganogram = lazy(() => import('@/features/overview/pages/Organogram'));
const OverviewCommanders = lazy(() => import('@/features/overview/pages/Commanders'));

const NotFound = lazy(() => import('@/pages/NotFound'));

/** If the user is already authed, keep them out of /login and bounce back */
function RedirectIfAuthed() {
  const { user } = useAuthStore();
  const loc = useLocation() as { state?: { from?: { pathname?: string } } } | null;

  if (user) {
    const to = loc?.state?.from?.pathname || '/';
    return <Navigate to={to} replace />;
  }
  return <Login />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6">Loading…</div>}>
        <Routes>
          {/* Public (but redirect if already signed in) */}
          <Route path="/login" element={<RedirectIfAuthed />} />

          {/* Protected */}
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />

              {/* Gallery */}
              <Route path="gallery" element={<GalleryList />} />
              <Route path="gallery/home" element={<GalleryHome />} />
              <Route path="gallery/detail" element={<GalleryDetail />} />

              {/* Awards */}
              <Route path="awards" element={<Awards />} />
              <Route path="awards/sections" element={<AwardSections />} />
              <Route path="awards/contents" element={<AwardContents />} />

              {/* Formations (redirect + pages) */}
              <Route path="formations" element={<Navigate to="/formations/chronicles" replace />} />
              <Route path="formations/chronicles" element={<FormChronicles />} />
              <Route path="formations/sections" element={<FormChronicleSections />} />
              <Route path="formations/contents" element={<FormChronicleContents />} />
              <Route path="formations/chronicles/sections" element={<FormChronicleSections />} />
              <Route path="formations/chronicles/contents" element={<FormChronicleContents />} />
              <Route path="formations/sapper-generals" element={<SapperGenerals />} />
              <Route path="formations/sapper-chronicles" element={<SapperChronicles />} />
              <Route path="formations/sapper-chronicles/contents" element={<SapperChroniclesContents />} />

              {/* Overview */}
              <Route path="overview" element={<Navigate to="/overview/history" replace />} />
              <Route path="overview/history" element={<OverviewHistory />} />
              <Route path="overview/organogram" element={<OverviewOrganogram />} />
              <Route path="overview/commanders" element={<OverviewCommanders />} />
            </Route>
          </Route>

          {/* Convenience alias */}
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

