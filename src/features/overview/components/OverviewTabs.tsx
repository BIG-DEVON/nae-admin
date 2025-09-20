import { NavLink } from "react-router-dom";
import { ROUTES } from "@/app/routes/paths";
import { cn } from "@/utils/cn";

export default function OverviewTabs() {
  const base =
    "inline-flex items-center rounded-lg px-3 py-1.5 text-sm transition";
  return (
    <nav className="mb-4 flex gap-2">
      <NavLink
        to={ROUTES.overviewHistory}
        className={({ isActive }) =>
          cn(
            base,
            isActive
              ? "bg-neutral-900 text-white"
              : "border border-neutral-200 hover:bg-neutral-50"
          )
        }
      >
        History
      </NavLink>
      <NavLink
        to={ROUTES.overviewOrganogram}
        className={({ isActive }) =>
          cn(
            base,
            isActive
              ? "bg-neutral-900 text-white"
              : "border border-neutral-200 hover:bg-neutral-50"
          )
        }
      >
        Organogram
      </NavLink>
      <NavLink
        to={ROUTES.overviewCommanders}
        className={({ isActive }) =>
          cn(
            base,
            isActive
              ? "bg-neutral-900 text-white"
              : "border border-neutral-200 hover:bg-neutral-50"
          )
        }
      >
        Commanders
      </NavLink>
    </nav>
  );
}
