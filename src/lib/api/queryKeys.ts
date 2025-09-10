export const qk = {
  gallery: {
    base: ["gallery"] as const,
    list: () => ["gallery", "list"] as const,
    home: () => ["gallery", "home"] as const
  },
  awards: {
    base: ["awards"] as const,
    list: () => ["awards", "list"] as const
  }
};
