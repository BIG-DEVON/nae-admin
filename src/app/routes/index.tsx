// // src/app/routes/index.tsx
// import { lazy, Suspense } from "react";
// import { Navigate, createBrowserRouter } from "react-router-dom";
// import AppLayout from "@/app/layouts/AppLayout";
// import ProtectedRoute from "./protected";
// import { ROUTES } from "./paths";

// // ----- Lazy pages (Gallery)
// const GalleryList = lazy(() => import("@/features/gallery/pages/GalleryList"));
// const GalleryDetail = lazy(() => import("@/features/gallery/pages/GalleryDetail"));
// // (gallery contents page is embedded in detail in your codebase; keep if you have one)

// // ----- Lazy pages (Awards)
// const Awards = lazy(() => import("@/features/awards/pages/Awards"));
// const AwardSections = lazy(() => import("@/features/awards/pages/AwardSections"));
// const AwardContents = lazy(() => import("@/features/awards/pages/AwardContents"));

// // ----- Lazy pages (Formations)
// const Formations = lazy(() => import("@/features/formations/pages/Formations")); // landing (optional)
// const Chronicles = lazy(() => import("@/features/formations/pages/Chronicles"));
// const ChronicleSections = lazy(() => import("@/features/formations/pages/ChronicleSections"));
// const ChronicleContents = lazy(() => import("@/features/formations/pages/ChronicleContents"));
// const SapperGenerals = lazy(() => import("@/features/formations/pages/SapperGenerals"));
// const SapperChronicles = lazy(() => import("@/features/formations/pages/SapperChronicles"));
// const SapperChroniclesContents = lazy(() => import("@/features/formations/pages/SapperChroniclesContents"));

// // ----- Lazy pages (Overview)
// const Overview = lazy(() => import("@/features/overview/pages/Overview")); // landing (optional)
// const History = lazy(() => import("@/features/overview/pages/History"));
// const Organogram = lazy(() => import("@/features/overview/pages/Organogram"));
// const Commanders = lazy(() => import("@/features/overview/pages/Commanders"));

// // ----- Misc
// const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
// const NotFound = lazy(() => import("@/pages/dashboard/NotFound"));

// const withSuspense = (el: JSX.Element) => (
//   <Suspense fallback={<div className="p-6 text-sm">Loading…</div>}>{el}</Suspense>
// );

// export const router = createBrowserRouter([
//   {
//     element: withSuspense(
//       <ProtectedRoute>
//         <AppLayout />
//       </ProtectedRoute>
//     ),
//     children: [
//       { index: true, element: <Navigate to={ROUTES.gallery} replace /> },

//       // Dashboard (if you use it)
//       { path: ROUTES.dashboard, element: withSuspense(<Dashboard />) },

//       // Gallery
//       { path: ROUTES.gallery, element: withSuspense(<GalleryList />) },
//       { path: ROUTES.gallery + "/:galleryId", element: withSuspense(<GalleryDetail />) },

//       // Awards
//       { path: ROUTES.awards, element: withSuspense(<Awards />) },
//       { path: ROUTES.awardSections, element: withSuspense(<AwardSections />) }, // ?award_id=...
//       { path: ROUTES.awardContents, element: withSuspense(<AwardContents />) }, // ?section_id=...

//       // Formations (landing optional)
//       { path: ROUTES.formations, element: withSuspense(<Formations />) },
//       { path: ROUTES.formationsChronicles, element: withSuspense(<Chronicles />) },
//       { path: ROUTES.formationsChronicleSections, element: withSuspense(<ChronicleSections />) },
//       { path: ROUTES.formationsChronicleContents, element: withSuspense(<ChronicleContents />) },
//       { path: ROUTES.formationsSapperGenerals, element: withSuspense(<SapperGenerals />) },
//       { path: ROUTES.formationsSapperChronicles, element: withSuspense(<SapperChronicles />) },
//       { path: ROUTES.formationsSapperChroniclesContents, element: withSuspense(<SapperChroniclesContents />) },

//       // Overview (landing optional)
//       { path: ROUTES.overview, element: withSuspense(<Overview />) },
//       { path: ROUTES.overviewHistory, element: withSuspense(<History />) },
//       { path: ROUTES.overviewOrganogram, element: withSuspense(<Organogram />) },
//       { path: ROUTES.overviewCommanders, element: withSuspense(<Commanders />) },

//       // 404
//       { path: "*", element: withSuspense(<NotFound />) },
//     ],
//   },
// ]);





import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout (your shell)
import { Shell as AppLayout } from '@/components/layout/Shell';


// Lazy pages (match your folders exactly)
const Login       = lazy(() => import('@/features/auth/pages/Login'));
const Dashboard   = lazy(() => import('@/pages/Dashboard'));
const GalleryList = lazy(() => import('@/features/gallery/pages/GalleryList'));
const Awards      = lazy(() => import('@/features/awards/pages/Awards'));
// const Formations  = lazy(() => import('@/features/formations/pages/Formations'));
// const Overview    = lazy(() => import('@/features/overview/pages/Overview'));
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
           {/* Redirects to avoid stubs */}
            <Route path="formations" element={<Navigate to="/formations/chronicles" replace />} />
            <Route path="overview"   element={<Navigate to="/overview/history" replace />} />


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
