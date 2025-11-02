// src/app/routes/paths.ts
export type ID = number | string;

export const ROUTES = {
  /* Core */
  root: "/",
  login: "/login",

  /** 
   * Your index route renders <Dashboard />, so treat "/" as the dashboard.
   * If any code was using "/dashboard", switch it to ROUTES.root,
   * or keep the alias helper below.
   */
  dashboard: "/", // alias so old code won’t break

  /* -------------------- Gallery -------------------- */
  gallery: "/gallery",
  galleryHome: "/gallery/home",
  galleryDetailBase: "/gallery/detail",
  /** e.g. /gallery/detail?gallery_id=3 */
  galleryDetail: (galleryId?: ID) =>
    galleryId != null
      ? `/gallery/detail?gallery_id=${galleryId}`
      : "/gallery/detail",

  /* -------------------- Awards -------------------- */
  awards: "/awards",
  awardSectionsBase: "/awards/sections",
  awardContentsBase: "/awards/contents",
  /** e.g. /awards/sections?award_id=2 */
  awardSections: (awardId?: ID) =>
    awardId != null ? `/awards/sections?award_id=${awardId}` : "/awards/sections",
  /** e.g. /awards/contents?section_id=10 */
  awardContents: (sectionId?: ID) =>
    sectionId != null ? `/awards/contents?section_id=${sectionId}` : "/awards/contents",

  /* -------------------- Formations -------------------- */
  formations: "/formations",
  formationsChronicles: "/formations/chronicles",
  formationsChronicleSectionsBase: "/formations/chronicles/sections",
  formationsChronicleContentsBase: "/formations/chronicles/contents",
  /** e.g. /formations/chronicles/sections?chronicles_id=1 */
  formationsChronicleSections: (chroniclesId?: ID) =>
    chroniclesId != null
      ? `/formations/chronicles/sections?chronicles_id=${chroniclesId}`
      : "/formations/chronicles/sections",
  /** e.g. /formations/chronicles/contents?section_id=5 */
  formationsChronicleContents: (sectionId?: ID) =>
    sectionId != null
      ? `/formations/chronicles/contents?section_id=${sectionId}`
      : "/formations/chronicles/contents",

  formationsSapperGenerals: "/formations/sapper-generals",
  formationsSapperChronicles: "/formations/sapper-chronicles",
  formationsSapperChroniclesContentsBase: "/formations/sapper-chronicles/contents",
  /** e.g. /formations/sapper-chronicles/contents?section_id=9 */
  formationsSapperChroniclesContents: (sectionId?: ID) =>
    sectionId != null
      ? `/formations/sapper-chronicles/contents?section_id=${sectionId}`
      : "/formations/sapper-chronicles/contents",

  /* -------------------- Overview -------------------- */
  overview: "/overview",
  overviewHistory: "/overview/history",
  overviewOrganogram: "/overview/organogram",
  overviewCommanders: "/overview/commanders",
  overviewChronicles: "/overview/chronicles",
  /** If your UI navigates with a selected section: /overview/chronicles?section_id=... */
  overviewChroniclesWithSection: (sectionId?: ID) =>
    sectionId != null
      ? `/overview/chronicles?section_id=${sectionId}`
      : "/overview/chronicles",
} as const;
