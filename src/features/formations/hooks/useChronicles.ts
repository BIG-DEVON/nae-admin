import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getChronicles, getChronicleSections, getChronicleContents,
  createChronicles, updateChronicles, deleteChronicles,
  createChronicleSection, updateChronicleSection, deleteChronicleSection,
  createChronicleContent, updateChronicleContent, deleteChronicleContent
} from '../api';

export const useChronicles = () =>
  useQuery({ queryKey: ['formations','chronicles'], queryFn: getChronicles });

export const useChronicleSections = (chronicles_id: number | string | null) =>
  useQuery({ queryKey: ['formations','chronicles','sections', String(chronicles_id ?? '')],
             queryFn: () => getChronicleSections(chronicles_id!), enabled: !!chronicles_id });

export const useChronicleContents = (section_id: number | string | null) =>
  useQuery({ queryKey: ['formations','chronicles','contents', String(section_id ?? '')],
             queryFn: () => getChronicleContents(section_id!), enabled: !!section_id });

export const useChroniclesMutations = () => ({
  create: useMutation({ mutationFn: createChronicles }),
  update: useMutation({ mutationFn: updateChronicles }),
  remove: useMutation({ mutationFn: (id: number|string) => deleteChronicles(id) }),
});
export const useChronicleSectionMutations = () => ({
  create: useMutation({ mutationFn: createChronicleSection }),
  update: useMutation({ mutationFn: updateChronicleSection }),
  remove: useMutation({ mutationFn: (id: number|string) => deleteChronicleSection(id) }),
});
export const useChronicleContentMutations = () => ({
  create: useMutation({ mutationFn: createChronicleContent }),
  update: useMutation({ mutationFn: updateChronicleContent }),
  remove: useMutation({ mutationFn: (id: number|string) => deleteChronicleContent(id) }),
});
