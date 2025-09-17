// src/features/formations/hooks/useChronicleContents.ts
import { useQuery } from '@tanstack/react-query';
import { fetchChronicleContents } from '../api';

export function useChronicleContents(section_id?: number | string | null) {
  return useQuery({
    queryKey: ['formations', 'chronicles', 'contents', String(section_id ?? '')],
    queryFn: () => fetchChronicleContents(section_id!),
    enabled: !!section_id,
  });
}
