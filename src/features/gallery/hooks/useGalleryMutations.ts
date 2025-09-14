import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queryKeys";
import {
  createGallery, editGallery, deleteGallery,
  createGalleryContent, editGalleryContent, editGalleryContentImage, deleteGalleryContent,
  createHomeGallery, editHomeGallery, editHomeGalleryImage, deleteHomeGallery
} from "../api";
import type { ID } from "../types";

type CreateGalleryVars = Parameters<typeof createGallery>[0];
type EditGalleryVars = Parameters<typeof editGallery>[0];
type DeleteGalleryVars = Parameters<typeof deleteGallery>[0];

type CreateGalleryContentVars = Parameters<typeof createGalleryContent>[0];
type EditGalleryContentVars = Parameters<typeof editGalleryContent>[0];
type EditGalleryContentImageVars = Parameters<typeof editGalleryContentImage>[0];

export function useGalleryMutations() {
  const qc = useQueryClient();

  return {
    createGallery: useMutation({
      mutationFn: (vars: CreateGalleryVars) => createGallery(vars),
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.list() }),
    }),
    editGallery: useMutation({
      mutationFn: (vars: EditGalleryVars) => editGallery(vars),
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.list() }),
    }),
    deleteGallery: useMutation({
      mutationFn: (vars: DeleteGalleryVars) => deleteGallery(vars),
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.list() }),
    }),

    createGalleryContent: useMutation({
      mutationFn: (vars: CreateGalleryContentVars) => createGalleryContent(vars),
      onSuccess: (_res, vars) => {
        const gid = Number(vars.gallery_id as ID);
        if (!Number.isNaN(gid)) {
          qc.invalidateQueries({ queryKey: qk.gallery.contents(gid) });
        } else {
          qc.invalidateQueries({ queryKey: qk.gallery.all });
        }
      },
    }),
    editGalleryContent: useMutation({
      mutationFn: (vars: EditGalleryContentVars) => editGalleryContent(vars),
      onSuccess: (_res, vars) => {
        const gid = Number(vars.gallery_id as ID);
        if (!Number.isNaN(gid)) {
          qc.invalidateQueries({ queryKey: qk.gallery.contents(gid) });
        } else {
          qc.invalidateQueries({ queryKey: qk.gallery.all });
        }
      },
    }),
    editGalleryContentImage: useMutation({
      mutationFn: (vars: EditGalleryContentImageVars) => editGalleryContentImage(vars),
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.all }),
    }),
    deleteGalleryContent: useMutation({
      mutationFn: (id: ID) => deleteGalleryContent(Number(id)),
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.all }),
    }),

    createHomeGallery: useMutation({
      mutationFn: createHomeGallery,
      onSuccess: () => qc.invalidateQueries({ queryKey: qk.gallery.home() }),
    }),
    editHomeGallery: useMutation({
      mutationFn: editHomeGallery,
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
