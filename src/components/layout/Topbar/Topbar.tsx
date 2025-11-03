import { useAuthStore } from "@/lib/store/auth.store";
import { Button } from "@/components/ui/Button";

export const Topbar = () => {
  const { user, logout } = useAuthStore();
  return (
    <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur border-b border-neutral-200">
      <div className="h-14 flex items-center justify-between px-6">
        <div className="font-semibold">Hall of Fame • Admin</div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-600">Signed in as Admin {user?.name ?? "Admin"}</span>
          <Button variant="ghost" onClick={logout}>Logout</Button>
        </div>
      </div>
    </header>
  );
};
