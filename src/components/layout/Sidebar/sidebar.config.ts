import { paths } from "@/app/routes/paths";
import { GalleryHorizontal, Award, GraduationCap, LayoutGrid } from "lucide-react";

export type SidebarItem = { label: string; to: string; icon: any; };

export const sidebarItems: SidebarItem[] = [
  { label: "Gallery",    to: paths.gallery,    icon: GalleryHorizontal },
  { label: "Awards",     to: paths.awards,     icon: Award },
  { label: "Formations", to: paths.formations, icon: GraduationCap },
  { label: "Overview",   to: paths.overview,   icon: LayoutGrid }
];
