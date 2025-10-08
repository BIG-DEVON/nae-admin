// src/features/overview/api/index.ts
export type ID = number | string;

/* -------------------- helpers -------------------- */
const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

function auth(): Record<string, string> {
  const t = (import.meta.env.VITE_API_TOKEN || localStorage.getItem('token') || '').trim();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function toArray<T = unknown>(x: unknown): T[] {
  if (Array.isArray(x)) return x as T[];
  if (x && typeof x === 'object') {
    const obj = x as Record<string, unknown>;
    const keys = ['data', 'results', 'items'] as const;
    for (const k of keys) {
      const v = obj[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

async function getJSON<T>(p: string): Promise<T> {
  const r = await fetch(`${BASE}${p}`, {
    headers: auth(),
    credentials: 'include',
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

async function sendJSON<T>(p: string, m: 'POST' | 'PATCH' | 'DELETE', b: unknown): Promise<T> {
  const r = await fetch(`${BASE}${p}`, {
    method: m,
    headers: { 'Content-Type': 'application/json', ...auth() },
    body: JSON.stringify(b),
  });
  const t = await r.text();
  if (!r.ok) throw new Error(t || r.statusText);
  if (!t) return {} as T;
  try { return JSON.parse(t) as T; } catch { return {} as T; }
}

async function sendForm<T>(p: string, fd: FormData): Promise<T> {
  const r = await fetch(`${BASE}${p}`, {
    method: 'POST',
    headers: auth(), // do not set Content-Type for FormData
    body: fd,
  });
  const t = await r.text();
  if (!r.ok) throw new Error(t || r.statusText);
  if (!t) return {} as T;
  try { return JSON.parse(t) as T; } catch { return {} as T; }
}

/* -------------------- Public GETs -------------------- */
export const getHistory = async () => await getJSON<unknown>('/overview/history/');
export const getOrganogram = async () => toArray(await getJSON<unknown>('/overview/organogram/'));
export const getCommanders = async () => toArray(await getJSON<unknown>('/overview/commanders/'));
export const getOverviewChronicles = async () => toArray(await getJSON<unknown>('/overview/chronicles/'));
export const getOverviewChroniclesContents = async (section_id: ID) =>
  toArray(await getJSON<unknown>(`/overview/chronicles/contents/?section_id=${section_id}`));

/* -------------------- Admin: History (single doc) -------------------- */
export const createHistory = (payload: { title: string; content: string }) =>
  sendJSON('/overview-actions/history/', 'POST', payload);

// 🔧 FIX: PATCH must include history_id now
export const updateHistory = (payload: { history_id: ID; title?: string; content?: string }) =>
  sendJSON('/overview-actions/history/', 'PATCH', payload);

/* -------------------- Admin: Organogram (image list) -------------------- */
export const createOrganogram = (payload: { position: number; image: File }) => {
  const fd = new FormData();
  fd.append('type', 'create');
  fd.append('position', String(payload.position));
  fd.append('image', payload.image);
  return sendForm('/overview-actions/organogram/', fd);
};
export const updateOrganogramImage = (payload: { organogram_id: ID; image: File }) => {
  const fd = new FormData();
  fd.append('type', 'edit-image');
  fd.append('organogram_id', String(payload.organogram_id));
  fd.append('image', payload.image);
  return sendForm('/overview-actions/organogram/', fd);
};
export const updateOrganogramPosition = (payload: { organogram_id: ID; position: number }) =>
  sendJSON('/overview-actions/organogram/', 'PATCH', payload);
export const deleteOrganogram = (organogram_id: ID) =>
  sendJSON('/overview-actions/organogram/', 'DELETE', { organogram_id });

/* -------------------- Admin: Commanders (image + text) -------------------- */
export const createCommander = (payload: { title: string; content: string; position: number; image: File }) => {
  const fd = new FormData();
  fd.append('type', 'create');
  fd.append('title', payload.title);
  fd.append('content', payload.content);
  fd.append('position', String(payload.position));
  fd.append('image', payload.image);
  return sendForm('/overview-actions/commanders/', fd);
};
export const updateCommander = (payload: { commander_id: ID; title?: string; content?: string; position?: number }) =>
  sendJSON('/overview-actions/commanders/', 'PATCH', payload);
export const updateCommanderImage = (payload: { commander_id: ID; image: File }) => {
  const fd = new FormData();
  fd.append('type', 'edit-image');
  fd.append('commander_id', String(payload.commander_id));
  fd.append('image', payload.image);
  return sendForm('/overview-actions/commanders/', fd);
};
export const deleteCommander = (commander_id: ID) =>
  sendJSON('/overview-actions/commanders/', 'DELETE', { commander_id });

/* -------------------- Admin: Overview Chronicles (+ contents) -------------------- */
export const createOverviewChronicles = (payload: { title: string; position: number }) =>
  sendJSON('/overview-actions/chronicles/', 'POST', payload);
export const updateOverviewChronicles = (payload: { overview_id: ID; title?: string; position?: number }) =>
  sendJSON('/overview-actions/chronicles/', 'PATCH', payload);
export const deleteOverviewChronicles = (overview_id: ID) =>
  sendJSON('/overview-actions/chronicles/', 'DELETE', { overview_id });

export const createOverviewChroniclesContent = (payload: {
  chronicles_id: ID; position: number;
  rank: string; name: string; pno: string; period: string; decoration: string;
}) => sendJSON('/overview-actions/chronicles/contents/', 'POST', payload);

export const updateOverviewChroniclesContent = (payload: {
  content_id: ID; chronicles_id: ID; position?: number;
  rank?: string; name?: string; pno?: string; period?: string; decoration?: string;
}) => sendJSON('/overview-actions/chronicles/contents/', 'PATCH', payload);

export const deleteOverviewChroniclesContent = (content_id: ID) =>
  sendJSON('/overview-actions/chronicles/contents/', 'DELETE', { content_id });
