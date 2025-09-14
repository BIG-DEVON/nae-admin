import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/queryKeys";
import { getGalleries } from "../api";

export function useGalleries() {
  return useQuery({
    queryKey: qk.gallery.list(),
    queryFn: getGalleries,
  });
}
