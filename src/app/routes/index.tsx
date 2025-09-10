import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from '@/components/layout/Shell'   // our layout frame

// Lazy pages (match the structure we agreed on)
const Login       = lazy(() => import('@/features/auth/pages/Login'))
const Dashboard   = lazy(() => import('@/pages/Dashboard'))
const GalleryList = lazy(() => import('@/features/gallery/pages/GalleryList'))
const Awards      = lazy(() => import('@/features/awards/pages/Awards'))
const Formations  = lazy(() => import('@/features/formations/pages/Formations'))
const Overview    = lazy(() => import('@/features/overview/pages/Overview'))
const NotFound    = lazy(() => import('@/pages/NotFound'))

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-6">Loading…</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected area */}
          <Route element={<Shell />}>
            <Route index element={<Dashboard />} />
            <Route path="gallery" element={<GalleryList />} />
            <Route path="awards" element={<Awards />} />
            <Route path="formations" element={<Formations />} />
            <Route path="overview" element={<Overview />} />
          </Route>

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
