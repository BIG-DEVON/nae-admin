// src/App.tsx
import { Suspense } from "react";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";

import { AuthProviderWithState as AuthProvider } from '@/features/auth/hooks/useAuth';
// import { AuthProvider } from "@/app/providers/AuthProvider";
import { Toaster } from "@/components/feedback/Toaster";
import AppRouter from "@/app/routes";

// ✅ point to src/styles instead of src/assets/styles
import "@/styles/tailwind.css";
import "@/styles/globals.css";

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
  );
};

export default App;
