// src/app/layout/Shell.tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar/Sidebar";
import { Topbar } from "./Topbar/Topbar";
import { useAuthStore } from "@/lib/store/auth.store";

function UserActions() {
  const { user, logout } = useAuthStore();

  const onSignOut = () => {
    logout();
    // keep it dead-simple to avoid router edge cases
    window.location.href = "/login";
  };

  return (
    <div className="ml-auto flex items-center gap-3">
      {user ? (
        <>
          {/* <span className="text-sm text-neutral-600 truncate max-w-[200px]">
            Signed in as <strong className="text-neutral-800">{user.name}</strong>
          </span> */}
          
        </>
      ) : null}
    </div>
  );
}

export const Shell = () => {
  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <Sidebar />
      <div className="flex flex-col">
        <Topbar />

        {/* small bar under the topbar, right-aligned */}
        <div className="px-6 pt-3">
          <UserActions />
        </div>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
