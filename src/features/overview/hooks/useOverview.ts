import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queryKeys";
import {
  // History
  getHistory, createHistory, updateHistory,
  // Organogram
  getOrganogram, createOrganogram, updateOrganogramImage, updateOrganogramPosition, deleteOrganogram,
  // Commanders
  getCommanders, createCommander, updateCommander, updateCommanderImage, deleteCommander,
  // Chronicles (public)
  getOverviewChronicles, getOverviewChroniclesContents,
  // Admin Chronicles
  createOverviewChronicles, updateOverviewChronicles, deleteOverviewChronicles,
  createOverviewChroniclesContent, updateOverviewChroniclesContent, deleteOverviewChroniclesContent
} from "../api";

// helper to turn off retries during bring-up
const NO_RETRY = false;

// ---------- History ----------
export function useOverviewHistory() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: qk.overview.history(),
    queryFn: getHistory,
    staleTime: 60_000,
    retry: NO_RETRY,
  });

  const create = useMutation({
    mutationFn: createHistory,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.history() }),
  });

  const update = useMutation({
    mutationFn: updateHistory,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.history() }),
  });

  return { query, create, update };
}

// ---------- Organogram ----------
export function useOverviewOrganogram() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: qk.overview.organogram(),
    queryFn: getOrganogram,
    staleTime: 60_000,
    retry: NO_RETRY,
  });

  const create = useMutation({
    mutationFn: createOrganogram,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.organogram() }),
  });

  const updateImage = useMutation({
    mutationFn: updateOrganogramImage,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.organogram() }),
  });

  const updatePosition = useMutation({
    mutationFn: updateOrganogramPosition,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.organogram() }),
  });

  const remove = useMutation({
    mutationFn: deleteOrganogram,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.organogram() }),
  });

  return { query, create, updateImage, updatePosition, remove };
}

// ---------- Commanders ----------
export function useOverviewCommanders() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: qk.overview.commanders(),
    queryFn: getCommanders,
    staleTime: 60_000,
    retry: NO_RETRY,
  });

  const create = useMutation({
    mutationFn: createCommander,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.commanders() }),
  });

  const update = useMutation({
    mutationFn: updateCommander,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.commanders() }),
  });

  const updateImage = useMutation({
    mutationFn: updateCommanderImage,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.commanders() }),
  });

  const remove = useMutation({
    mutationFn: deleteCommander,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.commanders() }),
  });

  return { query, create, update, updateImage, remove };
}

// ---------- Overview Chronicles ----------
export function useOverviewChroniclesList() {
  return useQuery({
    queryKey: qk.overview.chronicles(),
    queryFn: getOverviewChronicles,
    staleTime: 60_000,
    retry: NO_RETRY,
  });
}

export function useOverviewChroniclesContents(sectionId: number | string | null) {
  return useQuery({
    queryKey: qk.overview.chroniclesContents(Number(sectionId ?? NaN)),
    queryFn: () => getOverviewChroniclesContents(sectionId!),
    enabled: !!sectionId,
    staleTime: 60_000,
    retry: NO_RETRY,
  });
}

export function useOverviewChroniclesMutations() {
  const qc = useQueryClient();
  return {
    create: useMutation({
      mutationFn: createOverviewChronicles,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.chronicles() }),
    }),
    update: useMutation({
      mutationFn: updateOverviewChronicles,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.chronicles() }),
    }),
    remove: useMutation({
      mutationFn: deleteOverviewChronicles,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.chronicles() }),
    }),
    createContent: useMutation({
      mutationFn: createOverviewChroniclesContent,
      onSuccess: (_r, v) =>
        qc.invalidateQueries({ queryKey: qk.overview.chroniclesContents(Number(v.chronicles_id)) }),
    }),
    updateContent: useMutation({
      mutationFn: updateOverviewChroniclesContent,
      onSuccess: (_r, v) =>
        qc.invalidateQueries({ queryKey: qk.overview.chroniclesContents(Number(v.chronicles_id)) }),
    }),
    deleteContent: useMutation({
      mutationFn: deleteOverviewChroniclesContent,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.overview.all }),
    }),
  };
}
