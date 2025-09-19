import {
  Home,
  Image as Gallery,
  Award,
  Layers3 as Formations,
  BookOpenText as Overview, // ⬅️ replace Sitemap with this
} from "lucide-react";

import { ROUTES } from "@/app/routes/paths";

export type SidebarItem = {
  to: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const sidebarItems: SidebarItem[] = [
  { to: ROUTES.root, label: "Dashboard", icon: Home },
  { to: ROUTES.gallery, label: "Gallery", icon: Gallery },
  { to: ROUTES.awards, label: "Awards", icon: Award },
  // { to: ROUTES.formations, label: "Formations", icon: Formations },
  { to: ROUTES.formationsChronicles, label: "Formations", icon: Formations },
  { to: ROUTES.overview, label: "Overview", icon: Overview },
];





// import type { SVGProps } from "react";
// import { Image, Award, GraduationCap, BookOpen } from "lucide-react";
// import { ROUTES } from "@/app/routes/paths";

// type Icon = (props: SVGProps<SVGSVGElement>) => JSX.Element;

// export interface SidebarItem {
//   label: string;
//   to: string;
//   icon: Icon;
// }

// export const sidebarItems: SidebarItem[] = [
//   { label: "Gallery",    to: ROUTES.gallery,               icon: Image },
//   { label: "Awards",     to: ROUTES.awards,                icon: Award },
//   { label: "Formations", to: ROUTES.formationsChronicles,  icon: GraduationCap },
//   { label: "Overview",   to: ROUTES.overviewHistory,       icon: BookOpen },
// ];
