import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queryKeys";
import type { ID } from "../types";
import {
  createGallery,
  updateGallery,
  deleteGallery,
  createGalleryContent,
  editGalleryContent,
  editGalleryContentImage,
  deleteGalleryContent,     // <— add this
  createHomeGallery,
  updateHomeGallery,
  editHomeGalleryImage,
  deleteHomeGallery,
} from "../api";


export function useGalleryMutations() {
  const qc = useQueryClient();

  return {
    createGallery: useMutation({
      mutationFn: createGallery,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.list() }),
    }),

    // (renamed in api: updateGallery, not editGallery)
    editGallery: useMutation({
      mutationFn: updateGallery,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.list() }),
    }),

    deleteGallery: useMutation({
      mutationFn: deleteGallery,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.list() }),
    }),

    createGalleryContent: useMutation({
      mutationFn: createGalleryContent,
      onSuccess: (_res, vars: { gallery_id: ID; image: File; title: string; position: number }) => {
        qc.invalidateQueries({ queryKey: qk.gallery.contents(Number(vars.gallery_id)) });
      },
    }),

    editGalleryContent: useMutation({
      mutationFn: editGalleryContent,
      onSuccess: (_res, vars: { gallery_id?: ID }) => {
        if (vars.gallery_id != null) {
          qc.invalidateQueries({ queryKey: qk.gallery.contents(Number(vars.gallery_id)) });
        } else {
          qc.invalidateQueries({ queryKey: qk.gallery.all });
        }
      },
    }),

    editGalleryContentImage: useMutation({
      mutationFn: editGalleryContentImage,
      onSuccess: (_res, vars: { content_id: ID }) => {
        // If you know the parent gallery id, you can invalidate that instead
        qc.invalidateQueries({ queryKey: qk.gallery.all });
      },
    }),

    deleteGalleryContent: useMutation({
      mutationFn: deleteGalleryContent,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.all }),
    }),


    createHomeGallery: useMutation({
      mutationFn: createHomeGallery,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.home() }),
    }),

    // (renamed in api: updateHomeGallery, not editHomeGallery)
    editHomeGallery: useMutation({
      mutationFn: updateHomeGallery,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.home() }),
    }),

    editHomeGalleryImage: useMutation({
      mutationFn: editHomeGalleryImage,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.home() }),
    }),

    deleteHomeGallery: useMutation({
      mutationFn: deleteHomeGallery,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.home() }),
    }),
  };
}
