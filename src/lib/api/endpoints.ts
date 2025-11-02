// src/lib/api/endpoints.ts
// Centralized endpoint builders. No string literals scattered in hooks/components.

export const endpoints = {
  // --- Auth ---
  auth: {
    login: () => `/auth/login/`,
    // NOTE: backend has no /auth/me, so we don't expose it to avoid misuse.
  },

  // --- Gallery (public) ---
  gallery: {
    list: () => `/gallery/`,
    home: () => `/gallery/home-gallery/`,
    contents: (gallery_id: number) => `/gallery/contents/?gallery_id=${gallery_id}`,
  },

  // --- Gallery (admin actions) ---
  galleryActions: {
    base: () => `/gallery-actions/`,
    home: () => `/gallery-actions/home-gallery/`,
    contents: () => `/gallery-actions/contents/`,
  },

  // --- Awards (public) ---
  awards: {
    list: () => `/awards/`,
    sections: (award_id: number) => `/awards/sections/?award_id=${award_id}`,
    contents: (section_id: number) => `/awards/contents/?section_id=${section_id}`,
  },

  // --- Awards (admin actions) ---
  awardsActions: {
    base: () => `/awards-actions/`,
    sections: () => `/awards-actions/sections/`,
    contents: () => `/awards-actions/contents/`,
  },

  // --- Formations (public) ---
  formations: {
    chronicles: () => `/formations/chronicles/`,
    chroniclesSections: (chronicles_id: number) =>
      `/formations/chronicles/sections/?chronicles_id=${chronicles_id}`,
    chroniclesContents: (section_id: number) =>
      `/formations/chronicles/contents/?section_id=${section_id}`,
    sapperGenerals: () => `/formations/sapper-generals/`,
    sapperChronicles: () => `/formations/sapper-chronicles/`,
    sapperChroniclesContents: (section_id: number) =>
      `/formations/sapper-chronicles/contents/?section_id=${section_id}`,
  },

  // --- Formations (admin actions) ---
  formationsActions: {
    chronicles: () => `/formations-actions/chronicles/`,
    chroniclesSections: () => `/formations-actions/chronicles/sections/`,
    chroniclesContents: () => `/formations-actions/chronicles/contents/`,
    sapperGenerals: () => `/formations-actions/sapper-generals/`,
    sapperChronicles: () => `/formations-actions/sapper-chronicles/`,
    sapperChroniclesContents: () => `/formations-actions/sapper-chronicles/contents/`,
  },

  // --- Overview (public) ---
  overview: {
    history: () => `/overview/history/`,
    organogram: () => `/overview/organogram/`,
    commanders: () => `/overview/commanders/`,
    chronicles: () => `/overview/chronicles/`,
    chroniclesContents: (section_id: number) =>
      `/overview/chronicles/contents/?section_id=${section_id}`,
  },

  // --- Overview (admin actions) ---
  overviewActions: {
    history: () => `/overview-actions/history/`,
    organogram: () => `/overview-actions/organogram/`,
    commanders: () => `/overview-actions/commanders/`,
    chronicles: () => `/overview-actions/chronicles/`,
    chroniclesContents: () => `/overview-actions/chronicles/contents/`,
  },
} as const;
