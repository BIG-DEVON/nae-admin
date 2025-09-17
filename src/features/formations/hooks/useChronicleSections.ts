// src/features/formations/hooks/useChronicleSections.ts
import { useQuery } from '@tanstack/react-query';
import { fetchChronicleSections } from '../api';

export function useChronicleSections(chronicles_id?: number | string | null) {
  return useQuery({
    queryKey: ['formations', 'chronicles', 'sections', String(chronicles_id ?? '')],
    queryFn: () => fetchChronicleSections(chronicles_id!),
    enabled: !!chronicles_id,
  });
}
