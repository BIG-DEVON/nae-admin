// src/features/formations/components/FormationsTabs.tsx
import { NavLink } from "react-router-dom";

type TabKey = "chronicles" | "generals" | "sapper";

export default function FormationsTabs({ active }: { active: TabKey }) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border transition";
  const activeCls =
    "bg-green-600 text-white border-green-600";
  const idleCls =
    "bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200";

  return (
    <div className="flex items-center gap-2">
      <NavLink to="/formations/chronicles" className={active === "chronicles" ? `${base} ${activeCls}` : `${base} ${idleCls}`}>
        📖 <span>Chronicles</span>
      </NavLink>
      <NavLink to="/formations/sapper-generals" className={active === "generals" ? `${base} ${activeCls}` : `${base} ${idleCls}`}>
        👮 <span>Sapper Generals</span>
      </NavLink>
      <NavLink to="/formations/sapper-chronicles" className={active === "sapper" ? `${base} ${activeCls}` : `${base} ${idleCls}`}>
        🧱 <span>Sapper Chronicles</span>
      </NavLink>
    </div>
  );
}
