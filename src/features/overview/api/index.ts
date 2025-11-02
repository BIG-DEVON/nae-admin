// src/features/overview/api/index.ts
export type ID = number | string;

import { authHeader } from "@/lib/api/authHeader";

const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// --- helpers -------------------------------------------------
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
  try { return JSON.parse(text) as T; } catch { return text as unknown as T; }
}

async function getJSON<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { ...authHeader(), Accept: "application/json" },
    mode: "cors",
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) throw { status: res.status, statusText: res.statusText, url, payload: safeParse(text) };
  return safeParse<T>(text);
}

async function sendJSON<T>(path: string, method: "POST" | "PATCH" | "DELETE", body: unknown): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json", ...authHeader() },
    body: JSON.stringify(body ?? {}),
    mode: "cors",
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) throw { status: res.status, statusText: res.statusText, url, payload: safeParse(text) };
  return text ? safeParse<T>(text) : ({} as T);
}

async function sendForm<T>(path: string, fd: FormData): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { ...authHeader() }, // do NOT set Content-Type for FormData
    body: fd,
    mode: "cors",
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) throw { status: res.status, statusText: res.statusText, url, payload: safeParse(text) };
  return text ? safeParse<T>(text) : ({} as T);
}

// --- public (token-required on your server) -------------------
export const getHistory = () => getJSON<unknown>("/overview/history/");
export const getOrganogram = () => getJSON<unknown>("/overview/organogram/").then(toArray);
export const getCommanders = () => getJSON<unknown>("/overview/commanders/").then(toArray);
export const getOverviewChronicles = () => getJSON<unknown>("/overview/chronicles/").then(toArray);
export const getOverviewChroniclesContents = (section_id: ID) =>
  getJSON<unknown>(`/overview/chronicles/contents/?section_id=${section_id}`).then(toArray);

// --- admin: history ------------------------------------------
export const createHistory = (payload: { title: string; content: string }) =>
  sendJSON("/overview-actions/history/", "POST", payload);
export const updateHistory = (payload: { history_id: ID; title?: string; content?: string }) =>
  sendJSON("/overview-actions/history/", "PATCH", payload);

// --- admin: organogram ---------------------------------------
export const createOrganogram = (payload: { position: number; image: File }) => {
  const fd = new FormData();
  fd.append("type", "create");
  fd.append("position", String(payload.position));
  fd.append("image", payload.image);
  return sendForm("/overview-actions/organogram/", fd);
};
export const updateOrganogramImage = (payload: { organogram_id: ID; image: File }) => {
  const fd = new FormData();
  fd.append("type", "edit-image");
  fd.append("organogram_id", String(payload.organogram_id));
  fd.append("image", payload.image);
  return sendForm("/overview-actions/organogram/", fd);
};
export const updateOrganogramPosition = (payload: { organogram_id: ID; position: number }) =>
  sendJSON("/overview-actions/organogram/", "PATCH", payload);
export const deleteOrganogram = (organogram_id: ID) =>
  sendJSON("/overview-actions/organogram/", "DELETE", { organogram_id });

// --- admin: commanders ---------------------------------------
export const createCommander = (payload: { title: string; content: string; position: number; image: File }) => {
  const fd = new FormData();
  fd.append("type", "create");
  fd.append("title", payload.title);
  fd.append("content", payload.content);
  fd.append("position", String(payload.position));
  fd.append("image", payload.image);
  return sendForm("/overview-actions/commanders/", fd);
};
export const updateCommander = (payload: { commander_id: ID; title?: string; content?: string; position?: number }) =>
  sendJSON("/overview-actions/commanders/", "PATCH", payload);
export const updateCommanderImage = (payload: { commander_id: ID; image: File }) => {
  const fd = new FormData();
  fd.append("type", "edit-image");
  fd.append("commander_id", String(payload.commander_id));
  fd.append("image", payload.image);
  return sendForm("/overview-actions/commanders/", fd);
};
export const deleteCommander = (commander_id: ID) =>
  sendJSON("/overview-actions/commanders/", "DELETE", { commander_id });

// --- admin: chronicles (+ contents) --------------------------
export const createOverviewChronicles = (payload: { title: string; position: number }) =>
  sendJSON("/overview-actions/chronicles/", "POST", payload);
export const updateOverviewChronicles = (payload: { overview_id: ID; title?: string; position?: number }) =>
  sendJSON("/overview-actions/chronicles/", "PATCH", payload);
export const deleteOverviewChronicles = (overview_id: ID) =>
  sendJSON("/overview-actions/chronicles/", "DELETE", { overview_id });

export const createOverviewChroniclesContent = (payload: {
  chronicles_id: ID; position: number;
  rank: string; name: string; pno: string; period: string; decoration: string;
}) => sendJSON("/overview-actions/chronicles/contents/", "POST", payload);

export const updateOverviewChroniclesContent = (payload: {
  content_id: ID; chronicles_id: ID; position?: number;
  rank?: string; name?: string; pno?: string; period?: string; decoration?: string;
}) => sendJSON("/overview-actions/chronicles/contents/", "PATCH", payload);

export const deleteOverviewChroniclesContent = (content_id: ID) =>
  sendJSON("/overview-actions/chronicles/contents/", "DELETE", { content_id });
