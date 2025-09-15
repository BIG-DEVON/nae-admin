import { useQuery } from '@tanstack/react-query';
import { qk } from '@/lib/api/queryKeys';
import { getAwardContents } from '../api';
import type { ID } from '@/features/gallery/types';

export function useAwardContents(sectionId: ID | null | undefined) {
  const idNum = sectionId != null ? Number(sectionId) : NaN;
  return useQuery({
    queryKey: qk.awards.contents(idNum),
    queryFn: () => getAwardContents(idNum),
    enabled: Number.isFinite(idNum),
    staleTime: 60_000,
  });
}
