import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/queryKeys";
import { getAwards } from "../api";

export function useAwards() {
  return useQuery({
    queryKey: qk.awards.list(),
    queryFn: getAwards,
    staleTime: 60_000,
    retry: false, // avoid triple-calling while stabilizing auth
  });
}
