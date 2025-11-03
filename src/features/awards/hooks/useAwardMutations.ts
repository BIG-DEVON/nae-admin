// src/features/awards/hooks/useAwardMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queryKeys";
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
} from "../api";
import type { ID } from "@/features/gallery/types";
import type { Award, AwardSection, AwardContent } from "../types";
import { logActivity } from "@/lib/activity/log";
import { notifySuccess, notifyError, extractErrorMessage } from "@/lib/notify";

// --- Input shapes for our mutations (match api/index.ts) ---
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
    /* ------------------------- Awards ------------------------- */
    createAward: useMutation<Award, Error, CreateAwardVars>({
      mutationFn: (vars) => createAward(vars),
      onSuccess: (_res, vars) => {
        qc.invalidateQueries({ queryKey: qk.awards.list() });
        logActivity({ area: "Awards", action: "create", message: `Award “${vars.title}” created` });
        notifySuccess("Award created", `“${vars.title}” has been added.`);
      },
      onError: (err) => notifyError("Failed to create award", extractErrorMessage(err)),
    }),

    updateAward: useMutation<Award, Error, UpdateAwardVars>({
      mutationFn: (vars) => updateAward(vars),
      onSuccess: (_res, vars) => {
        qc.invalidateQueries({ queryKey: qk.awards.list() });
        logActivity({ area: "Awards", action: "update", message: `Award #${vars.award_id} updated` });
        notifySuccess("Award updated", `Award #${vars.award_id} changes saved.`);
      },
      onError: (err) => notifyError("Failed to update award", extractErrorMessage(err)),
    }),

    deleteAward: useMutation<{ success?: boolean }, Error, ID>({
      mutationFn: (award_id) => deleteAward(award_id),
      onSuccess: (_res, award_id) => {
        qc.invalidateQueries({ queryKey: qk.awards.list() });
        logActivity({ area: "Awards", action: "delete", message: `Award #${award_id} deleted` });
        notifySuccess("Award deleted", `Award #${award_id} has been removed.`);
      },
      onError: (err) => notifyError("Failed to delete award", extractErrorMessage(err)),
    }),

    /* ------------------------ Sections ------------------------ */
    createSection: useMutation<AwardSection, Error, CreateSectionVars>({
      mutationFn: (vars) => createAwardSection(vars),
      onSuccess: (_res, vars) => {
        qc.invalidateQueries({ queryKey: qk.awards.sections(Number(vars.award_id)) });
        logActivity({
          area: "Awards",
          action: "create",
          message: `Section “${vars.title}” (award #${vars.award_id}) created`,
        });
        notifySuccess("Section created", `“${vars.title}” added to award #${vars.award_id}.`);
      },
      onError: (err) => notifyError("Failed to create section", extractErrorMessage(err)),
    }),

    updateSection: useMutation<AwardSection, Error, UpdateSectionVars>({
      mutationFn: (vars) => updateAwardSection(vars),
      onSuccess: (_res, vars) => {
        qc.invalidateQueries({ queryKey: qk.awards.sections(Number(vars.award_id)) });
        logActivity({
          area: "Awards",
          action: "update",
          message: `Section #${vars.section_id} (award #${vars.award_id}) updated`,
        });
        notifySuccess("Section updated", `Section #${vars.section_id} saved.`);
      },
      onError: (err) => notifyError("Failed to update section", extractErrorMessage(err)),
    }),

    deleteSection: useMutation<{ success?: boolean }, Error, ID>({
      mutationFn: (section_id) => deleteAwardSection(section_id),
      onSuccess: (_res, section_id) => {
        // unknown parent; invalidate broadly
        qc.invalidateQueries({ queryKey: qk.awards.all });
        logActivity({ area: "Awards", action: "delete", message: `Section #${section_id} deleted` });
        notifySuccess("Section deleted", `Section #${section_id} has been removed.`);
      },
      onError: (err) => notifyError("Failed to delete section", extractErrorMessage(err)),
    }),

    /* ------------------------ Contents ------------------------ */
    createContent: useMutation<AwardContent, Error, CreateContentVars>({
      mutationFn: (vars) => createAwardContent(vars),
      onSuccess: (_res, vars) => {
        qc.invalidateQueries({ queryKey: qk.awards.contents(Number(vars.award_section_id)) });
        logActivity({
          area: "Awards",
          action: "create",
          message: `Content added (section #${vars.award_section_id})`,
        });
        notifySuccess("Content added", `New row added to section #${vars.award_section_id}.`);
      },
      onError: (err) => notifyError("Failed to create content", extractErrorMessage(err)),
    }),

    updateContent: useMutation<AwardContent, Error, UpdateContentVars>({
      mutationFn: (vars) => updateAwardContent(vars),
      onSuccess: (_res, vars) => {
        qc.invalidateQueries({ queryKey: qk.awards.contents(Number(vars.award_section_id)) });
        logActivity({
          area: "Awards",
          action: "update",
          message: `Content #${vars.content_id} (section #${vars.award_section_id}) updated`,
        });
        notifySuccess("Content updated", `Row #${vars.content_id} saved.`);
      },
      onError: (err) => notifyError("Failed to update content", extractErrorMessage(err)),
    }),

    deleteContent: useMutation<{ success?: boolean }, Error, ID>({
      mutationFn: (content_id) => deleteAwardContent(content_id),
      onSuccess: (_res, content_id) => {
        // unknown parent; invalidate broadly
        qc.invalidateQueries({ queryKey: qk.awards.all });
        logActivity({ area: "Awards", action: "delete", message: `Content #${content_id} deleted` });
        notifySuccess("Content deleted", `Row #${content_id} has been removed.`);
      },
      onError: (err) => notifyError("Failed to delete content", extractErrorMessage(err)),
    }),
  };
}
