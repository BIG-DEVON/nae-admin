import { Suspense } from "react";
import { QueryProvider } from '@/app/providers/QueryProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AuthProvider } from '@/app/providers/AuthProvider'
import { Toaster } from '@/components/feedback/Toaster'
import AppRouter from '@/app/routes'
import '@/assets/styles/tailwind.css'
import '@/assets/styles/globals.css'

export const App = () => {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider> 
          <Suspense fallback={<div className="p-6">Loading…</div>}>
          <AppRouter />
          <Toaster />
          </Suspense>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}

export default App
