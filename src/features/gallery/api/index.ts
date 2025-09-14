import type {
  Gallery,
  HomeGallery,
  CreateHomeGalleryInput,
  UpdateHomeGalleryInput,
  EditHomeGalleryImageInput,
  ID,
} from '../types';

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function getAuthHeader() {
  const token = (import.meta.env.VITE_API_TOKEN || localStorage.getItem('token') || '').trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeArray<T>(json: any): T[] {
  if (Array.isArray(json)) return json as T[];
  return (json?.data as T[]) ?? (json?.results as T[]) ?? (json?.items as T[]) ?? [];
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

async function sendJSON<T>(path: string, method: 'POST' | 'PATCH' | 'DELETE', body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

async function sendForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

/* ------------------------ READ endpoints ------------------------ */

export const getGalleries = async () => {
  const json = await getJSON<any>('/gallery/');
  return normalizeArray<Gallery>(json);
};

export const getHomeGallery = async () => {
  const json = await getJSON<any>('/gallery/home-gallery/');
  return normalizeArray<HomeGallery>(json);
};

export const getGalleryContents = async (gallery_id: ID) => {
  const json = await getJSON<any>(`/gallery/contents/?gallery_id=${gallery_id}`);
  return normalizeArray<{ id: ID; gallery_id: ID; title: string; position: number; image_url?: string }>(json);
};

/* ---------------------- ADMIN: Home Gallery --------------------- */

export const createHomeGallery = (input: CreateHomeGalleryInput) => {
  const fd = new FormData();
  fd.append('type', input.type); // "create"
  fd.append('name', input.name);
  fd.append('title', input.title);
  fd.append('position', String(input.position));
  fd.append('image', input.image);
  return sendForm<HomeGallery>('/gallery-actions/home-gallery/', fd);
};

export const updateHomeGallery = (input: UpdateHomeGalleryInput) =>
  sendJSON<HomeGallery>('/gallery-actions/home-gallery/', 'PATCH', {
    id: input.id,
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.position !== undefined ? { position: input.position } : {}),
  });

export const editHomeGalleryImage = (input: EditHomeGalleryImageInput) => {
  const fd = new FormData();
  fd.append('type', input.type); // "edit-image"
  fd.append('id', String(input.id));
  fd.append('image', input.image);
  return sendForm<HomeGallery>('/gallery-actions/home-gallery/', fd);
};

// Aliases for older names some hooks expect
export const updateHomeGalleryImage = editHomeGalleryImage;
export const editHomeGallery = updateHomeGallery;

// DELETE json (ensure no hidden BOM before slash)
export const deleteHomeGallery = (id: ID) =>
  sendJSON<{ success: boolean }>('/gallery-actions/home-gallery/', 'DELETE', { id });

/* ---------------------- ADMIN: Gallery CRUD --------------------- */

export const createGallery = (payload: { title: string; position: number }) =>
  sendJSON<Gallery>('/gallery-actions/', 'POST', payload);

export const updateGallery = (payload: { gallery_id: ID; title?: string; position?: number }) =>
  sendJSON<Gallery>('/gallery-actions/', 'PATCH', payload);

export const deleteGallery = (gallery_id: ID) =>
  sendJSON<{ success: boolean }>('/gallery-actions/', 'DELETE', { gallery_id });

// hook also imports this name:
export const editGallery = updateGallery;

export const createGalleryContent = (payload: {
  gallery_id: ID;
  image: File;
  title: string;
  position: number;
}) => {
  const fd = new FormData();
  fd.append('gallery_id', String(payload.gallery_id));
  fd.append('image', payload.image);
  fd.append('title', payload.title);
  fd.append('position', String(payload.position));
  fd.append('type', 'create');
  return sendForm('/gallery-actions/contents/', fd);
};

export const editGalleryContent = (payload: {
  content_id: ID;
  gallery_id: ID;
  title?: string;
  position?: number;
}) => sendJSON('/gallery-actions/contents/', 'PATCH', payload);

export const editGalleryContentImage = (payload: { content_id: ID; image: File }) => {
  const fd = new FormData();
  fd.append('content_id', String(payload.content_id));
  fd.append('image', payload.image);
  fd.append('type', 'edit-image');
  return sendForm('/gallery-actions/contents/', fd);
};

export const deleteGalleryContent = (content_id: ID) =>
  sendJSON<{ success: boolean }>('/gallery-actions/contents/', 'DELETE', { content_id });
