// src/features/formations/hooks/useFormationsMutations.ts
import { useMutation } from '@tanstack/react-query';
import {
  createChronicle, updateChronicle, deleteChronicle,
  createChronicleSection, updateChronicleSection, deleteChronicleSection,
  createChronicleContent, updateChronicleContent, removeChronicleContent,
} from '../api';

export function useChronicleMutations() {
  const create = useMutation({ mutationFn: createChronicle });
  const update = useMutation({ mutationFn: updateChronicle });
  const remove = useMutation({ mutationFn: (id: number | string) => deleteChronicle(id) });
  return { create, update, remove };
}

export function useChronicleSectionMutations() {
  const create = useMutation({ mutationFn: createChronicleSection });
  const update = useMutation({ mutationFn: updateChronicleSection });
  const remove = useMutation({ mutationFn: (id: number | string) => deleteChronicleSection(id) });
  return { create, update, remove };
}

export function useChronicleContentMutations() {
  const create = useMutation({ mutationFn: createChronicleContent });
  const update = useMutation({ mutationFn: updateChronicleContent });
  const remove = useMutation({ mutationFn: (id: number | string) => removeChronicleContent(id) });
  return { create, update, remove };
}
