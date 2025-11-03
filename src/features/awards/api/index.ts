import type { ID } from "@/features/gallery/types";
import type { Award, AwardSection, AwardContent } from "../types";
import { authHeader } from "@/lib/api/authHeader";

const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

/* -------------------- helpers -------------------- */

// Normalize API shapes: [], {data:[]}, {results:[]}, {items:[]}
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
    // some endpoints return plain text / empty
    return text as unknown as T;
  }
}

async function getJSON<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { ...authHeader() },
    mode: "cors",
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw { status: res.status, statusText: res.statusText, url, payload: safeParse(text) };
  }
  return safeParse<T>(text);
}

async function sendJSON<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body: unknown
): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body ?? {}),
    mode: "cors",
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw { status: res.status, statusText: res.statusText, url, payload: safeParse(text) };
  }
  return safeParse<T>(text);
}

/* ------------------- READ (normalized) ------------------- */
export const getAwards = async () =>
  toArray<Award>(await getJSON<unknown>("/awards/"));

export const getAwardSections = async (award_id: ID) =>
  toArray<AwardSection>(await getJSON<unknown>(`/awards/sections/?award_id=${award_id}`));

export const getAwardContents = async (section_id: ID) =>
  toArray<AwardContent>(await getJSON<unknown>(`/awards/contents/?section_id=${section_id}`));

/* ------------------- ADMIN: Awards ------------------- */
export const createAward = (payload: { title: string; position: number }) =>
  sendJSON<Award>("/awards-actions/", "POST", payload);

export const updateAward = (payload: { award_id: ID; title?: string; position?: number }) =>
  sendJSON<Award>("/awards-actions/", "PATCH", payload);

export const deleteAward = (award_id: ID) =>
  sendJSON<{ success?: boolean }>("/awards-actions/", "DELETE", { award_id });

/* ------------------- ADMIN: Sections ------------------- */
export const createAwardSection = (payload: {
  award_id: ID;
  title: string;
  position: number;
}) => sendJSON<AwardSection>("/awards-actions/sections/", "POST", payload);

export const updateAwardSection = (payload: {
  section_id: ID;
  award_id: ID;
  title?: string;
  position?: number;
}) => sendJSON<AwardSection>("/awards-actions/sections/", "PATCH", payload);

export const deleteAwardSection = (section_id: ID) =>
  sendJSON<{ success?: boolean }>("/awards-actions/sections/", "DELETE", { section_id });

/* ------------------- ADMIN: Contents ------------------- */
export const createAwardContent = (payload: {
  award_section_id: ID;
  position: number;
  rank?: string;
  name?: string;
  pno?: string;
  courseno?: string;
  unit?: string;
  year?: string;
}) => sendJSON<AwardContent>("/awards-actions/contents/", "POST", payload);

export const updateAwardContent = (payload: {
  content_id: ID;
  award_section_id: ID;
  position?: number;
  rank?: string;
  name?: string;
  pno?: string;
  courseno?: string;
  unit?: string;
  year?: string;
}) => sendJSON<AwardContent>("/awards-actions/contents/", "PATCH", payload);

export const deleteAwardContent = (content_id: ID) =>
  sendJSON<{ success?: boolean }>("/awards-actions/contents/", "DELETE", { content_id });
