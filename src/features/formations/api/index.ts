// src/features/formations/api/index.ts
// Formations: chronicles (+ sections + contents), sapper generals, sapper chronicles (+ contents)
export type ID = number | string;

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function auth() {
  const token = (import.meta.env.VITE_API_TOKEN || localStorage.getItem('token') || '').trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toArray<T=unknown>(input: unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === 'object') {
    for (const k of ['data','results','items']) {
      const v = (input as any)?.[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

async function getJSON<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { headers: { ...auth() }, credentials: 'include' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function sendJSON<T>(path: string, method: 'POST'|'PATCH'|'DELETE', body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method, headers: { 'Content-Type': 'application/json', ...auth() }, body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(text || r.statusText);
  if (!text) return {} as T;
  try { return JSON.parse(text) as T; } catch { return {} as T; }
}
async function sendForm<T>(path: string, fd: FormData): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { method: 'POST', headers: { ...auth() }, body: fd });
  const text = await r.text();
  if (!r.ok) throw new Error(text || r.statusText);
  if (!text) return {} as T;
  try { return JSON.parse(text) as T; } catch { return {} as T; }
}

/* ---------- Public GETs ---------- */
export const getChronicles = async () => toArray(await getJSON<unknown>('/formations/chronicles/'));
export const getChronicleSections = async (chronicles_id: ID) =>
  toArray(await getJSON<unknown>(`/formations/chronicles/sections/?chronicles_id=${chronicles_id}`));
export const getChronicleContents = async (section_id: ID) =>
  toArray(await getJSON<unknown>(`/formations/chronicles/contents/?section_id=${section_id}`));

export const getSapperGenerals = async () =>
  toArray(await getJSON<unknown>('/formations/sapper-generals/'));
export const getSapperChronicles = async () =>
  toArray(await getJSON<unknown>('/formations/sapper-chronicles/'));
/**
 * NOTE: Postman shows GET contents by ?section_id for sapper chronicles.
 * If your backend expects chronicles_id instead, just change the param name here.
 */
export const getSapperChroniclesContents = async (section_id: ID) =>
  toArray(await getJSON<unknown>(`/formations/sapper-chronicles/contents/?section_id=${section_id}`));

/* ---------- Admin: Chronicles (parent) ---------- */
export const createChronicles = (payload: { title: string; position: number }) =>
  sendJSON('/formations-actions/chronicles/', 'POST', payload);
export const updateChronicles = (payload: { chronicles_id: ID; title?: string; position?: number }) =>
  sendJSON('/formations-actions/chronicles/', 'PATCH', payload);
export const deleteChronicles = (chronicles_id: ID) =>
  sendJSON('/formations-actions/chronicles/', 'DELETE', { chronicles_id });

/* ---------- Admin: Chronicles Sections ---------- */
export const createChronicleSection = (payload: { chronicles_id: ID; title: string; position: number }) =>
  sendJSON('/formations-actions/chronicles/sections/', 'POST', payload);
export const updateChronicleSection = (payload: {
  section_id: ID; chronicles_id: ID; title?: string; position?: number;
}) => sendJSON('/formations-actions/chronicles/sections/', 'PATCH', payload);
export const deleteChronicleSection = (section_id: ID) =>
  sendJSON('/formations-actions/chronicles/sections/', 'DELETE', { section_id });

/* ---------- Admin: Chronicles Contents ---------- */
export const createChronicleContent = (payload: {
  section_id: ID; position: number;
  rank?: string; name?: string; number?: string; year?: string; appointment?: string;
}) => sendJSON('/formations-actions/chronicles/contents/', 'POST', payload);
export const updateChronicleContent = (payload: {
  content_id: ID; section_id: ID; position?: number;
  rank?: string; name?: string; number?: string; year?: string; appointment?: string;
}) => sendJSON('/formations-actions/chronicles/contents/', 'PATCH', payload);
export const deleteChronicleContent = (content_id: ID) =>
  sendJSON('/formations-actions/chronicles/contents/', 'DELETE', { content_id });

/* ---------- Admin: Sapper Generals (with images) ---------- */
export const createSapperGeneral = (payload: {
  title: string; content: string; position: number; image: File;
}) => {
  const fd = new FormData();
  fd.append('type','create');
  fd.append('title', payload.title);
  fd.append('content', payload.content);
  fd.append('position', String(payload.position));
  fd.append('image', payload.image);
  return sendForm('/formations-actions/sapper-generals/', fd);
};
export const updateSapperGeneral = (payload: {
  general_id: ID; title?: string; content?: string; position?: number;
}) => sendJSON('/formations-actions/sapper-generals/', 'PATCH', payload);
export const updateSapperGeneralImage = (payload: { general_id: ID; image: File }) => {
  const fd = new FormData();
  fd.append('type','edit-image');
  fd.append('general_id', String(payload.general_id));
  fd.append('image', payload.image);
  return sendForm('/formations-actions/sapper-generals/', fd);
};
export const deleteSapperGeneral = (general_id: ID) =>
  sendJSON('/formations-actions/sapper-generals/', 'DELETE', { general_id });

/* ---------- Admin: Sapper Chronicles (+ contents) ---------- */
export const createSapperChronicles = (payload: { title: string; position: number; sub_title?: string }) =>
  sendJSON('/formations-actions/sapper-chronicles/', 'POST', payload);
export const updateSapperChronicles = (payload: {
  chronicles_id: ID; title?: string; sub_title?: string; position?: number;
}) => sendJSON('/formations-actions/sapper-chronicles/', 'PATCH', payload);
export const deleteSapperChronicles = (chronicles_id: ID) =>
  sendJSON('/formations-actions/sapper-chronicles/', 'DELETE', { chronicles_id });

export const createSapperChroniclesContent = (payload: {
  chronicles_id: ID; position: number;
  pno?: string; rank?: string; name?: string; doc?: string; noneffdate?: string;
  cadetcse?: string; commtype?: string; status?: string; remark?: string; duration?: string;
}) => sendJSON('/formations-actions/sapper-chronicles/contents/', 'POST', payload);
export const updateSapperChroniclesContent = (payload: {
  content_id: ID; chronicles_id: ID; position?: number;
  pno?: string; rank?: string; name?: string; doc?: string; noneffdate?: string;
  cadetcse?: string; commtype?: string; status?: string; remark?: string; duration?: string;
}) => sendJSON('/formations-actions/sapper-chronicles/contents/', 'PATCH', payload);
export const deleteSapperChroniclesContent = (content_id: ID) =>
  sendJSON('/formations-actions/sapper-chronicles/contents/', 'DELETE', { content_id });
