import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getHomeGallery,
  createHomeGallery,
  updateHomeGallery,
  editHomeGalleryImage,
  deleteHomeGallery,
} from '../api';
import type {
  CreateHomeGalleryInput,
  UpdateHomeGalleryInput,
  EditHomeGalleryImageInput,
  ID,
  HomeGallery,
} from '../types';

// Stable query key for the home gallery list
const QK = ['gallery', 'home'] as const;

export function useGalleryHome() {
  const qc = useQueryClient();

  // ---- READ ----
  const list = useQuery<HomeGallery[]>({
    queryKey: QK,
    queryFn: getHomeGallery,
    staleTime: 60_000,
  });

  // ---- CREATE ----
  const create = useMutation({
    mutationFn: (input: CreateHomeGalleryInput) => createHomeGallery(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });

  // ---- UPDATE (text fields/position) ----
  const update = useMutation({
    mutationFn: (input: UpdateHomeGalleryInput) => updateHomeGallery(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });

  // ---- UPDATE IMAGE ----
  const updateImage = useMutation({
    mutationFn: (input: EditHomeGalleryImageInput) => editHomeGalleryImage(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });

  // ---- DELETE ----
  const remove = useMutation({
    mutationFn: (id: ID) => deleteHomeGallery(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });

  return { list, create, update, updateImage, remove };
}
