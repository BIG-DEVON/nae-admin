// src/app/routes/paths.ts
export const ROUTES = {
  root: "/",
  login: "/login",
  dashboard: "/dashboard",

  // Gallery
  gallery: "/gallery",
  galleryDetail: (galleryId: number | string) => `/gallery/${galleryId}`,
  galleryContents: (galleryId: number | string) => `/gallery/${galleryId}/contents`,

  // Awards
  awards: "/awards",
  awardSections: "/awards/sections",       // expects ?award_id=...
  awardContents: "/awards/contents",       // expects ?section_id=...

  // Formations
  formations: "/formations",
  formationsChronicles: "/formations/chronicles",
  formationsChronicleSections: "/formations/chronicles/sections",   // ?chronicles_id=...
  formationsChronicleContents: "/formations/chronicles/contents",   // ?section_id=...
  formationsSapperGenerals: "/formations/sapper-generals",
  formationsSapperChronicles: "/formations/sapper-chronicles",
  formationsSapperChroniclesContents: "/formations/sapper-chronicles/contents", // ?section_id=...

  // Overview
  overview: "/overview",
  overviewHistory: "/overview/history",
  overviewOrganogram: "/overview/organogram",
  overviewCommanders: "/overview/commanders",
  overviewChronicles: "/overview/chronicles", // ✅ added
} as const;
