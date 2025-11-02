// src/features/gallery/hooks/useGalleryHome.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getHomeGallery,
  createHomeGallery,
  updateHomeGallery,
  editHomeGalleryImage,
  deleteHomeGallery,
} from "../api";
import type {
  CreateHomeGalleryInput,
  UpdateHomeGalleryInput,
  EditHomeGalleryImageInput,
  ID,
  HomeGallery,
} from "../types";
import { logActivity } from "@/lib/activity/log";

const QK = ["gallery", "home"] as const;

export function useGalleryHome() {
  const qc = useQueryClient();

  // READ
  const list = useQuery<HomeGallery[]>({
    queryKey: QK,
    queryFn: getHomeGallery,
    staleTime: 60_000,
    retry: false,
  });

  // CREATE
  const create = useMutation({
    mutationFn: (input: CreateHomeGalleryInput) => createHomeGallery(input),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: QK });
      logActivity({
        area: "Gallery",
        action: "create",
        message: `Banner “${v.title || v.name}” created`,
      });
    },
  });

  // UPDATE (fields/position)
  const update = useMutation({
    mutationFn: (input: UpdateHomeGalleryInput) => updateHomeGallery(input),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: QK });
      logActivity({
        area: "Gallery",
        action: "update",
        message: `Banner #${v.id} updated`,
      });
    },
  });

  // UPDATE image
  const updateImage = useMutation({
    mutationFn: (input: EditHomeGalleryImageInput) => editHomeGalleryImage(input),
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: QK });
      logActivity({
        area: "Gallery",
        action: "upload",
        message: `Banner #${v.id} image changed`,
      });
    },
  });

  // DELETE
  const remove = useMutation({
    mutationFn: (id: ID) => deleteHomeGallery(id),
    onSuccess: (_r, id) => {
      qc.invalidateQueries({ queryKey: QK });
      logActivity({
        area: "Gallery",
        action: "delete",
        message: `Banner #${id} deleted`,
      });
    },
  });

  return { list, create, update, updateImage, remove };
}
