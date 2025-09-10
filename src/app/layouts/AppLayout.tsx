import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, ImageIcon, Trophy, GraduationCap, Grid3X3 } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/gallery", label: "Gallery", icon: ImageIcon },
  { to: "/awards", label: "Awards", icon: Trophy },
  { to: "/formations", label: "Formations", icon: GraduationCap },
  { to: "/overview", label: "Overview", icon: Grid3X3 },
];

export function AppLayout() {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr] bg-surface text-foreground">
      {/* Sidebar */}
      <aside className="border-r bg-white/80 backdrop-blur">
        <div className="px-4 py-4 font-semibold tracking-wide text-brand">NAE • Admin</div>
        <nav className="px-2 py-2 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted ${
                  isActive ? "bg-muted text-brand font-medium" : "text-gray-700"
                }`
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
