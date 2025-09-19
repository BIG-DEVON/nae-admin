import { NavLink } from "react-router-dom";
import { sidebarItems, type SidebarItem } from "./sidebar.config";
import { cn } from "@/utils/cn";

export const Sidebar = () => {
  return (
    <aside className="bg-white border-r border-neutral-200 shadow-soft">
      <div className="px-4 py-5">
        <div className="text-lg font-semibold text-brand-700">NAE Admin</div>
        <div className="mt-6 space-y-1">
          {sidebarItems.map((it: SidebarItem) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                  "hover:bg-brand-50 hover:text-brand-700",
                  isActive ? "bg-brand-50 text-brand-700 font-medium" : "text-neutral-700"
                )
              }
            >
              <it.icon className="h-5 w-5" />
              <span>{it.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
};



// import { NavLink } from "react-router-dom";

// import { sidebarItems, type SidebarItem } from "./sidebar.config";
// import { cn } from "@/utils/cn";

// export const Sidebar = () => {
//   return (
//     <aside className="bg-white border-r border-neutral-200 shadow-soft">
//       <div className="px-4 py-5">
//         <div className="text-lg font-semibold text-brand-700">NAE Admin</div>
//         <div className="mt-6 space-y-1">
//           {sidebarItems.map((it: SidebarItem) => (
//             <NavLink
//               key={it.to}
//               to={it.to}
//               className={({ isActive }) =>
//                 cn(
//                   "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
//                   "hover:bg-brand-50 hover:text-brand-700",
//                   isActive ? "bg-brand-50 text-brand-700 font-medium" : "text-neutral-700"
//                 )
//               }
//             >
//               <it.icon className="h-5 w-5" />
//               <span>{it.label}</span>
//             </NavLink>
//           ))}
//         </div>
//       </div>
//     </aside>
//   );
// };
