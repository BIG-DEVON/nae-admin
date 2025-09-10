export const endpoints = {
  // fill out per-feature next; keeping central for no magic strings
  gallery: {
    list: () => "/gallery/",
    home: () => "/gallery-actions/home-gallery/",
  },
  awards: {
    list: () => "/awards/",
  },
  formations: {
    chronicles: () => "/formations/chronicles/",
  },
  overview: {
    history: () => "/overview/history/"
  }
} as const;
