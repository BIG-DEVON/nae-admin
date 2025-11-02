// src/features/gallery/api/index.ts
import type {
  Gallery,
  HomeGallery,
  CreateHomeGalleryInput,
  UpdateHomeGalleryInput,
  EditHomeGalleryImageInput,
  ID,
} from "../types";
import { authHeader } from "@/lib/api/authHeader";

const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// --- helpers ---------------------------------------------------------

/** Normalize API shapes: [], {data:[]}, {results:[]}, {items:[]} */
function toArray<T = unknown>(input: unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    for (const k of ["data", "results", "items"] as const) {
      const v = obj[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

function safeParse<T = any>(text: string): T {
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers: { ...authHeader() },
    // NOTE: include not required unless server needs cookies; token is in header
    // credentials: "include",
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) throw new Error(text || res.statusText);
  return safeParse<T>(text);
}

async function sendJSON<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body: unknown
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body ?? {}),
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) throw new Error(text || res.statusText);
  if (!text) return {} as T;
  return safeParse<T>(text);
}

async function sendForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { ...authHeader() }, // do NOT set Content-Type for FormData
    body: form,
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) throw new Error(text || res.statusText);
  if (!text) return {} as T;
  return safeParse<T>(text);
}

// --- READ ------------------------------------------------------------

export const getGalleries = async () => {
  const json = await getJSON<unknown>("/gallery/");
  return toArray<Gallery>(json);
};

export const getHomeGallery = async () => {
  const json = await getJSON<unknown>("/gallery/home-gallery/");
  return toArray<HomeGallery>(json);
};

export const getGalleryContents = async (gallery_id: ID) => {
  const json = await getJSON<unknown>(`/gallery/contents/?gallery_id=${gallery_id}`);
  return toArray<{
    id: ID;
    gallery_id: ID;
    title: string;
    position: number;
    image_url?: string;
  }>(json);
};

// --- ADMIN: Home Gallery (banners) ----------------------------------

export const createHomeGallery = (input: CreateHomeGalleryInput) => {
  const fd = new FormData();
  fd.append("type", input.type); // "create"
  if (input.name) fd.append("name", input.name);
  if (input.title) fd.append("title", input.title);
  fd.append("position", String(input.position));
  fd.append("image", input.image);
  return sendForm<HomeGallery>("/gallery-actions/home-gallery/", fd);
};

export const updateHomeGallery = (input: UpdateHomeGalleryInput) =>
  sendJSON<HomeGallery>("/gallery-actions/home-gallery/", "PATCH", {
    id: input.id,
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.position !== undefined ? { position: input.position } : {}),
  });

export const editHomeGalleryImage = (input: EditHomeGalleryImageInput) => {
  const fd = new FormData();
  fd.append("type", input.type); // "edit-image"
  fd.append("id", String(input.id));
  fd.append("image", input.image);
  return sendForm<HomeGallery>("/gallery-actions/home-gallery/", fd);
};

// Aliases for older names some hooks expect
export const updateHomeGalleryImage = editHomeGalleryImage;
export const editHomeGallery = updateHomeGallery;

export const deleteHomeGallery = (id: ID) =>
  sendJSON<{ success: boolean }>("/gallery-actions/home-gallery/", "DELETE", { id });

// --- ADMIN: Galleries (albums) --------------------------------------

export const createGallery = (payload: { title: string; position: number }) =>
  sendJSON<Gallery>("/gallery-actions/", "POST", payload);

export const updateGallery = (payload: {
  gallery_id: ID;
  title?: string;
  position?: number;
}) => sendJSON<Gallery>("/gallery-actions/", "PATCH", payload);

export const deleteGallery = (gallery_id: ID) =>
  sendJSON<{ success: boolean }>("/gallery-actions/", "DELETE", { gallery_id });

// --- ADMIN: Gallery contents ----------------------------------------

export const createGalleryContent = (payload: {
  gallery_id: ID;
  image: File;
  title: string;
  position: number;
}) => {
  const fd = new FormData();
  fd.append("gallery_id", String(payload.gallery_id));
  fd.append("image", payload.image);
  fd.append("title", payload.title);
  fd.append("position", String(payload.position));
  fd.append("type", "create");
  return sendForm("/gallery-actions/contents/", fd);
};

export const editGalleryContent = (payload: {
  content_id: ID;
  gallery_id: ID;
  title?: string;
  position?: number;
}) => sendJSON("/gallery-actions/contents/", "PATCH", payload);

export const editGalleryContentImage = (payload: { content_id: ID; image: File }) => {
  const fd = new FormData();
  fd.append("content_id", String(payload.content_id));
  fd.append("image", payload.image);
  fd.append("type", "edit-image");
  return sendForm("/gallery-actions/contents/", fd);
};

export const deleteGalleryContent = (content_id: ID) =>
  sendJSON<{ success?: boolean }>("/gallery-actions/contents/", "DELETE", { content_id });
