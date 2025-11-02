// src/features/awards/hooks/useAwardSections.ts
import { useQuery } from '@tanstack/react-query';
import { qk } from '@/lib/api/queryKeys';
import { getAwardSections } from '../api';

export function useAwardSections(awardId: number) {
  return useQuery({
    queryKey: qk.awards.sections(awardId),
    queryFn: () => getAwardSections(awardId),
    enabled: Number.isFinite(awardId) && awardId > 0,
    staleTime: 60_000,
  });
}
