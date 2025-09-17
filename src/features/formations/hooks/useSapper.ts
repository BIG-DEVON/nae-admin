import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getSapperGenerals, createSapperGeneral, updateSapperGeneral, updateSapperGeneralImage, deleteSapperGeneral,
  getSapperChronicles, getSapperChroniclesContents,
  createSapperChronicles, updateSapperChronicles, deleteSapperChronicles,
  createSapperChroniclesContent, updateSapperChroniclesContent, deleteSapperChroniclesContent
} from '../api';

export const useSapperGenerals = () =>
  useQuery({ queryKey: ['formations','sapper-generals'], queryFn: getSapperGenerals });

export const useSapperGeneralsMutations = () => ({
  create: useMutation({ mutationFn: createSapperGeneral }),
  update: useMutation({ mutationFn: updateSapperGeneral }),
  updateImage: useMutation({ mutationFn: updateSapperGeneralImage }),
  remove: useMutation({ mutationFn: (id: number|string) => deleteSapperGeneral(id) }),
});

export const useSapperChronicles = () =>
  useQuery({ queryKey: ['formations','sapper-chronicles'], queryFn: getSapperChronicles });

export const useSapperChroniclesContents = (section_id: number|string|null) =>
  useQuery({ queryKey: ['formations','sapper-chronicles','contents', String(section_id ?? '')],
             queryFn: () => getSapperChroniclesContents(section_id!), enabled: !!section_id });

export const useSapperChroniclesMutations = () => ({
  create: useMutation({ mutationFn: createSapperChronicles }),
  update: useMutation({ mutationFn: updateSapperChronicles }),
  remove: useMutation({ mutationFn: (id: number|string) => deleteSapperChronicles(id) }),
});
export const useSapperChroniclesContentMutations = () => ({
  create: useMutation({ mutationFn: createSapperChroniclesContent }),
  update: useMutation({ mutationFn: updateSapperChroniclesContent }),
  remove: useMutation({ mutationFn: (id: number|string) => deleteSapperChroniclesContent(id) }),
});
