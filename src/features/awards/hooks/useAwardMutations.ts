// src/features/awards/hooks/useAwardMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/lib/api/queryKeys';
import {
  createAward,
  updateAward,
  deleteAward,
  createAwardSection,
  updateAwardSection,
  deleteAwardSection,
  createAwardContent,
  updateAwardContent,
  deleteAwardContent,
} from '../api';
import type { ID } from '@/features/gallery/types';
import { logActivity } from '@/lib/activity/log';
import { notifySuccess, notifyError, extractErrorMessage } from '@/lib/notify';

// --- Inferred API shapes (match your api/index.ts) ---
type CreateAwardVars = { title: string; position: number };
type UpdateAwardVars = { award_id: ID; title?: string; position?: number };

type CreateSectionVars = { award_id: ID; title: string; position: number };
type UpdateSectionVars = { award_id: ID; section_id: ID; title?: string; position?: number };

type CreateContentVars = {
  award_section_id: ID;
  position: number;
  rank?: string;
  name?: string;
  pno?: string;
  courseno?: string;
  unit?: string;
  year?: string;
};
type UpdateContentVars = {
  content_id: ID;
  award_section_id: ID;
  position?: number;
  rank?: string;
  name?: string;
  pno?: string;
  courseno?: string;
  unit?: string;
  year?: string;
};

export function useAwardMutations() {
  const qc = useQueryClient();

  return {
    // ----- Awards -----
    createAward: useMutation({
      mutationFn: (v: CreateAwardVars) => createAward(v),
      onSuccess: (_r, v) => {
        qc.invalidateQueries({ queryKey: qk.awards.list() });
        logActivity({ area: 'Awards', action: 'create', message: `Award “${v.title}” created` });
        notifySuccess('Award created', `“${v.title}” has been added.`);
      },
      onError: (err) => notifyError('Failed to create award', extractErrorMessage(err)),
    }),

    updateAward: useMutation({
      mutationFn: (v: UpdateAwardVars) => updateAward(v),
      onSuccess: (_r, v) => {
        qc.invalidateQueries({ queryKey: qk.awards.list() });
        logActivity({ area: 'Awards', action: 'update', message: `Award #${v.award_id} updated` });
        notifySuccess('Award updated', `Award #${v.award_id} changes saved.`);
      },
      onError: (err) => notifyError('Failed to update award', extractErrorMessage(err)),
    }),

    deleteAward: useMutation({
      mutationFn: (id: ID) => deleteAward(id),
      onSuccess: (_r, id) => {
        qc.invalidateQueries({ queryKey: qk.awards.list() });
        logActivity({ area: 'Awards', action: 'delete', message: `Award #${id} deleted` });
        notifySuccess('Award deleted', `Award #${id} has been removed.`);
      },
      onError: (err) => notifyError('Failed to delete award', extractErrorMessage(err)),
    }),

    // ----- Sections -----
    createSection: useMutation({
      mutationFn: (v: CreateSectionVars) => createAwardSection(v),
      onSuccess: (_r, v) => {
        qc.invalidateQueries({ queryKey: qk.awards.sections(Number(v.award_id)) });
        logActivity({
          area: 'Awards',
          action: 'create',
          message: `Section “${v.title}” (award #${v.award_id}) created`,
        });
        notifySuccess('Section created', `“${v.title}” added to award #${v.award_id}.`);
      },
      onError: (err) => notifyError('Failed to create section', extractErrorMessage(err)),
    }),

    updateSection: useMutation({
      mutationFn: (v: UpdateSectionVars) => updateAwardSection(v),
      onSuccess: (_r, v) => {
        qc.invalidateQueries({ queryKey: qk.awards.sections(Number(v.award_id)) });
        logActivity({
          area: 'Awards',
          action: 'update',
          message: `Section #${v.section_id} (award #${v.award_id}) updated`,
        });
        notifySuccess('Section updated', `Section #${v.section_id} saved.`);
      },
      onError: (err) => notifyError('Failed to update section', extractErrorMessage(err)),
    }),

    deleteSection: useMutation({
      mutationFn: (section_id: ID) => deleteAwardSection(section_id),
      onSuccess: (_r, section_id) => {
        qc.invalidateQueries({ queryKey: qk.awards.all });
        logActivity({ area: 'Awards', action: 'delete', message: `Section #${section_id} deleted` });
        notifySuccess('Section deleted', `Section #${section_id} has been removed.`);
      },
      onError: (err) => notifyError('Failed to delete section', extractErrorMessage(err)),
    }),

    // ----- Contents -----
    createContent: useMutation({
      mutationFn: (v: CreateContentVars) => createAwardContent(v),
      onSuccess: (_r, v) => {
        qc.invalidateQueries({ queryKey: qk.awards.contents(Number(v.award_section_id)) });
        logActivity({
          area: 'Awards',
          action: 'create',
          message: `Content added (section #${v.award_section_id})`,
        });
        notifySuccess('Content added', `New row added to section #${v.award_section_id}.`);
      },
      onError: (err) => notifyError('Failed to create content', extractErrorMessage(err)),
    }),

    updateContent: useMutation({
      mutationFn: (v: UpdateContentVars) => updateAwardContent(v),
      onSuccess: (_r, v) => {
        qc.invalidateQueries({ queryKey: qk.awards.contents(Number(v.award_section_id)) });
        logActivity({
          area: 'Awards',
          action: 'update',
          message: `Content #${v.content_id} (section #${v.award_section_id}) updated`,
        });
        notifySuccess('Content updated', `Row #${v.content_id} saved.`);
      },
      onError: (err) => notifyError('Failed to update content', extractErrorMessage(err)),
    }),

    deleteContent: useMutation({
      mutationFn: (content_id: ID) => deleteAwardContent(content_id),
      onSuccess: (_r, content_id) => {
        qc.invalidateQueries({ queryKey: qk.awards.all });
        logActivity({ area: 'Awards', action: 'delete', message: `Content #${content_id} deleted` });
        notifySuccess('Content deleted', `Row #${content_id} has been removed.`);
      },
      onError: (err) => notifyError('Failed to delete content', extractErrorMessage(err)),
    }),
  };
}
