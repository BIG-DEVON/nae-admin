// src/features/overview/components/OverviewTabs.tsx
import { NavLink } from "react-router-dom";
import { ROUTES } from "@/app/routes/paths";
import { cn } from "@/utils/cn";

export default function OverviewTabs() {
  const base =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition";
  const inactive = "border-neutral-300 text-neutral-800 hover:bg-neutral-50";
  const active = "bg-green-600 text-white border-green-600";

  return (
    <nav className="mb-4 flex gap-2">
      <NavLink
        to={ROUTES.overviewHistory}
        className={({ isActive }) => cn(base, isActive ? active : inactive)}
      >
        <span className="inline-block h-2 w-2 rounded-full bg-current/80" />
        History
      </NavLink>

      <NavLink
        to={ROUTES.overviewOrganogram}
        className={({ isActive }) => cn(base, isActive ? active : inactive)}
      >
        <span className="inline-block h-2 w-2 rounded-full bg-current/80" />
        Organogram
      </NavLink>

      <NavLink
        to={ROUTES.overviewCommanders}
        className={({ isActive }) => cn(base, isActive ? active : inactive)}
      >
        <span className="inline-block h-2 w-2 rounded-full bg-current/80" />
        Commanders
      </NavLink>
    </nav>
  );
}
