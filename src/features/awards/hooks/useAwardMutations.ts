import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/lib/api/queryKeys';
import {
  createAward, updateAward, deleteAward,
  createAwardSection, updateAwardSection, deleteAwardSection,
  createAwardContent, updateAwardContent, deleteAwardContent,
} from '../api';
import type { ID } from '@/features/gallery/types';

export function useAwardMutations() {
  const qc = useQueryClient();

  return {
    // Awards
    createAward: useMutation({
      mutationFn: createAward,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.awards.list() }),
    }),
    updateAward: useMutation({
      mutationFn: updateAward,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.awards.list() }),
    }),
    deleteAward: useMutation({
      mutationFn: deleteAward,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.awards.list() }),
    }),

    // Sections
    createSection: useMutation({
      mutationFn: createAwardSection,
      onSuccess: (_r, v) => qc.invalidateQueries({ queryKey: qk.awards.sections(Number(v.award_id)) }),
    }),
    updateSection: useMutation({
      mutationFn: updateAwardSection,
      onSuccess: (_r, v) => qc.invalidateQueries({ queryKey: qk.awards.sections(Number(v.award_id)) }),
    }),
    deleteSection: useMutation({
      mutationFn: deleteAwardSection,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.awards.all }),
    }),

    // Contents
    createContent: useMutation({
      mutationFn: createAwardContent,
      onSuccess: (_r, v) => qc.invalidateQueries({ queryKey: qk.awards.contents(Number(v.award_section_id)) }),
    }),
    updateContent: useMutation({
      mutationFn: updateAwardContent,
      onSuccess: (_r, v) => qc.invalidateQueries({ queryKey: qk.awards.contents(Number(v.award_section_id)) }),
    }),
    deleteContent: useMutation({
      mutationFn: deleteAwardContent,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.awards.all }),
    }),
  };
}
