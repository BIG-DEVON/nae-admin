// src/features/gallery/hooks/useGalleryContents.ts
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/queryKeys";
import { getGalleryContents } from "../api";
import type { ID } from "../types";

export function useGalleryContents(galleryId: ID | null | undefined) {
  const idNum = galleryId != null ? Number(galleryId) : NaN;

  return useQuery({
    queryKey: qk.gallery.contents(idNum),
    queryFn: () => getGalleryContents(idNum),
    enabled: Number.isFinite(idNum),
    staleTime: 60_000,
    retry: false,
  });
}
