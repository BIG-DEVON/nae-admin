export const qk = {
  gallery: {
    all: ["gallery"] as const,
    list: () => [...qk.gallery.all, "list"] as const,
    home: () => [...qk.gallery.all, "home"] as const,
    contents: (galleryId: number) => [...qk.gallery.all, "contents", galleryId] as const,
  },
  awards: {
    all: ["awards"] as const,
    list: () => [...qk.awards.all, "list"] as const,
    sections: (awardId: number) => [...qk.awards.all, "sections", awardId] as const,
    contents: (sectionId: number) => [...qk.awards.all, "contents", sectionId] as const,
  },
  formations: {
    all: ["formations"] as const,
    chronicles: () => [...qk.formations.all, "chronicles"] as const,
    chroniclesSections: (id: number) => [...qk.formations.all, "chroniclesSections", id] as const,
    chroniclesContents: (id: number) => [...qk.formations.all, "chroniclesContents", id] as const,
    sapperGenerals: () => [...qk.formations.all, "sapperGenerals"] as const,
    sapperChronicles: () => [...qk.formations.all, "sapperChronicles"] as const,
    sapperChroniclesContents: (id: number) => [...qk.formations.all, "sapperChroniclesContents", id] as const,
  },
  overview: {
    all: ["overview"] as const,
    history: () => [...qk.overview.all, "history"] as const,
    organogram: () => [...qk.overview.all, "organogram"] as const,
    commanders: () => [...qk.overview.all, "commanders"] as const,
    chronicles: () => [...qk.overview.all, "chronicles"] as const,
    chroniclesContents: (id: number) => [...qk.overview.all, "chroniclesContents", id] as const,
  },
};
