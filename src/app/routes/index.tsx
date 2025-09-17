import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout (your shell)
import { Shell as AppLayout } from '@/components/layout/Shell';


// Lazy pages (match your folders exactly)
const Login       = lazy(() => import('@/features/auth/pages/Login'));
const Dashboard   = lazy(() => import('@/pages/Dashboard'));
const GalleryList = lazy(() => import('@/features/gallery/pages/GalleryList'));
const Awards      = lazy(() => import('@/features/awards/pages/Awards'));
const Formations  = lazy(() => import('@/features/formations/pages/Formations'));
const Overview    = lazy(() => import('@/features/overview/pages/Overview'));
const NotFound    = lazy(() => import('@/pages/NotFound'));
const GalleryHome = lazy(() => import('@/features/gallery/pages/GalleryHome'));
const GalleryDetail = lazy(() => import('@/features/gallery/pages/GalleryDetail'));
// const Awards = lazy(() => import('@/features/awards/pages/Awards'));
const AwardSections = lazy(() => import('@/features/awards/pages/AwardSections'));
const AwardContents = lazy(() => import('@/features/awards/pages/AwardContents'));
const FormChronicles = lazy(() => import('@/features/formations/pages/Chronicles'));
const FormSections   = lazy(() => import('@/features/formations/pages/ChronicleSections'));
const FormContents   = lazy(() => import('@/features/formations/pages/ChronicleContents'));
// const FormChronicles = lazy(() => import('@/features/formations/pages/Chronicles'));
const FormChronicleSections = lazy(() => import('@/features/formations/pages/ChronicleSections'));
const FormChronicleContents = lazy(() => import('@/features/formations/pages/ChronicleContents'));
const SapperGenerals = lazy(() => import('@/features/formations/pages/SapperGenerals'));
const SapperChronicles = lazy(() => import('@/features/formations/pages/SapperChronicles'));
const SapperChroniclesContents = lazy(() => import('@/features/formations/pages/SapperChroniclesContents'));
const OverviewHistory = lazy(() => import('@/features/overview/pages/History'));
const OverviewOrganogram = lazy(() => import('@/features/overview/pages/Organogram'));
const OverviewCommanders = lazy(() => import('@/features/overview/pages/Commanders'));



export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6">Loading…</div>}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected area (wrap with <RequireAuth> later when real auth lands) */}
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="gallery" element={<GalleryList />} />
            <Route path="awards" element={<Awards />} />
            <Route path="formations" element={<Formations />} />
            <Route path="overview" element={<Overview />} />
            <Route path="gallery/home" element={<GalleryHome />} />
            <Route path="gallery/detail" element={<GalleryDetail />} />
            {/* <Route path="awards" element={<Awards />} /> */}
            <Route path="awards/sections" element={<AwardSections />} />
            <Route path="awards/contents" element={<AwardContents />} />
            <Route path="formations/chronicles" element={<FormChronicles />} />
            <Route path="formations/sections"    element={<FormSections />} />
            <Route path="formations/contents"    element={<FormContents />} />
            <Route path="formations/chronicles/sections" element={<FormChronicleSections />} />
            <Route path="formations/chronicles/contents" element={<FormChronicleContents />} />
            <Route path="formations/sapper-generals" element={<SapperGenerals />} />
            <Route path="formations/sapper-chronicles" element={<SapperChronicles />} />
            <Route path="formations/sapper-chronicles/contents" element={<SapperChroniclesContents />} />
            <Route path="overview/history" element={<OverviewHistory />} />
            <Route path="overview/organogram" element={<OverviewOrganogram />} />
            <Route path="overview/commanders" element={<OverviewCommanders />} />


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
