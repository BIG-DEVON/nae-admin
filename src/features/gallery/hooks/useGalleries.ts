// src/features/gallery/hooks/useGalleries.ts
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/queryKeys";
import { getGalleries } from "../api";

export function useGalleries() {
  return useQuery({
    queryKey: qk.gallery.list(),
    queryFn: getGalleries,
    staleTime: 60_000,
    retry: false, // prevent 3× during bring-up; relax later if needed
  });
}
