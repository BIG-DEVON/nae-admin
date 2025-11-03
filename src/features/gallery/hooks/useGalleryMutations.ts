// src/features/gallery/hooks/useGalleryMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queryKeys";
import type {
  ID,
  Gallery,
  HomeGallery,
  CreateHomeGalleryInput,
  UpdateHomeGalleryInput,
  EditHomeGalleryImageInput,
} from "../types";
import {
  createGallery,
  updateGallery,
  deleteGallery,
  createGalleryContent,
  editGalleryContent,
  editGalleryContentImage,
  deleteGalleryContent as apiDeleteGalleryContent,
  createHomeGallery,
  updateHomeGallery,
  editHomeGalleryImage,
  deleteHomeGallery,
} from "../api";
import { logActivity } from "@/lib/activity/log";

type EditGalleryContentVars = {
  content_id: ID;
  gallery_id: ID;
  title?: string;
  position?: number;
};
type EditGalleryContentImageVars = { content_id: ID; image: File };

export function useGalleryMutations() {
  const qc = useQueryClient();

  return {
    /* ----------------------- Galleries (albums) ----------------------- */
    createGallery: useMutation<Gallery, Error, { title: string; position: number }>({
      mutationFn: (vars) => createGallery(vars),
      onSuccess: (_r, v) => {
        qc.invalidateQueries({ queryKey: qk.gallery.list() });
        logActivity({ area: "Gallery", action: "create", message: `Album “${v.title}” created` });
      },
    }),

    editGallery: useMutation<Gallery, Error, { gallery_id: ID; title?: string; position?: number }>(
      {
        mutationFn: (vars) => updateGallery(vars),
        onSuccess: (_r, v) => {
          qc.invalidateQueries({ queryKey: qk.gallery.list() });
          logActivity({
            area: "Gallery",
            action: "update",
            message: `Album #${(v as any).gallery_id ?? ""} updated`,
          });
        },
      }
    ),

    deleteGallery: useMutation<{ success?: boolean }, Error, ID>({
      mutationFn: (gallery_id) => deleteGallery(gallery_id),
      onSuccess: (_r, id) => {
        qc.invalidateQueries({ queryKey: qk.gallery.list() });
        logActivity({ area: "Gallery", action: "delete", message: `Album #${id} deleted` });
      },
    }),

    /* ----------------------- Gallery contents ------------------------ */
    createGalleryContent: useMutation<
      unknown,
      Error,
      { gallery_id: ID; image: File; title: string; position: number }
    >({
      mutationFn: (vars) => createGalleryContent(vars),
      onSuccess: (_r, v) => {
        const gid = Number((v as any)?.gallery_id ?? (v as any)?.data?.gallery_id);
        if (Number.isFinite(gid)) {
          qc.invalidateQueries({ queryKey: qk.gallery.contents(gid) });
        } else {
          qc.invalidateQueries({ queryKey: qk.gallery.all });
        }
        logActivity({
          area: "Gallery",
          action: "create",
          message: `Content “${(v as any)?.title ?? ""}” added`,
        });
      },
    }),

    editGalleryContent: useMutation<unknown, Error, EditGalleryContentVars>({
      mutationFn: (vars) => editGalleryContent(vars),
      onSuccess: (_r, v) => {
        const gid = Number((v as any)?.gallery_id ?? (v as any)?.data?.gallery_id);
        if (Number.isFinite(gid)) {
          qc.invalidateQueries({ queryKey: qk.gallery.contents(gid) });
        } else {
          qc.invalidateQueries({ queryKey: qk.gallery.all });
        }
        logActivity({
          area: "Gallery",
          action: "update",
          message: `Content #${(v as any)?.content_id ?? ""} updated`,
        });
      },
    }),

    editGalleryContentImage: useMutation<unknown, Error, EditGalleryContentImageVars>({
      mutationFn: (vars) => editGalleryContentImage(vars),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: qk.gallery.all });
        logActivity({ area: "Gallery", action: "upload", message: `Content image changed` });
      },
    }),

    deleteGalleryContent: useMutation<{ success?: boolean }, Error, { content_id: ID }>({
      mutationFn: (vars) => apiDeleteGalleryContent(vars.content_id),
      onSuccess: (_r, vars) => {
        qc.invalidateQueries({ queryKey: qk.gallery.all });
        logActivity({ area: "Gallery", action: "delete", message: `Content #${vars.content_id} deleted` });
      },
    }),

    /* ----------------------- Home gallery (banners) ------------------ */
    createHomeGallery: useMutation<HomeGallery, Error, CreateHomeGalleryInput>({
      mutationFn: (vars) => createHomeGallery(vars),
      onSuccess: (_r, v) => {
        qc.invalidateQueries({ queryKey: qk.gallery.home() });
        logActivity({
          area: "Gallery",
          action: "create",
          message: `Banner “${v.title || v.name || ""}” created`,
        });
      },
    }),

    editHomeGallery: useMutation<HomeGallery, Error, UpdateHomeGalleryInput>({
      mutationFn: (vars) => updateHomeGallery(vars),
      onSuccess: (_r, v) => {
        qc.invalidateQueries({ queryKey: qk.gallery.home() });
        logActivity({ area: "Gallery", action: "update", message: `Banner #${v.id} updated` });
      },
    }),

    editHomeGalleryImage: useMutation<HomeGallery, Error, EditHomeGalleryImageInput>({
      mutationFn: (vars) => editHomeGalleryImage(vars),
      onSuccess: (_r, v) => {
        qc.invalidateQueries({ queryKey: qk.gallery.home() });
        logActivity({ area: "Gallery", action: "upload", message: `Banner #${v.id} image changed` });
      },
    }),

    deleteHomeGallery: useMutation<{ success: boolean }, Error, ID>({
      mutationFn: (id) => deleteHomeGallery(id),
      onSuccess: (_r, id) => {
        qc.invalidateQueries({ queryKey: qk.gallery.home() });
        logActivity({ area: "Gallery", action: "delete", message: `Banner #${id} deleted` });
      },
    }),
  };
}
