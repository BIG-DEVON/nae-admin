// src/features/awards/api/index.ts
import type { ID } from "@/features/gallery/types";
import type { Award, AwardSection, AwardContent } from "../types";
import { authHeader } from "@/lib/api/authHeader";

const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// Normalize API shapes: [], {data:[]}, {results:[]}, {items:[]}
function toArray<T = unknown>(input: unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    for (const k of ["data", "results", "items"]) {
      const v = obj[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { ...authHeader() }, // <- always a plain record
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

async function sendJSON<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body: unknown
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || res.statusText);

  // DELETE endpoints often return empty string
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

/* ------------------- READ (normalized) ------------------- */
export const getAwards = async () =>
  toArray<Award>(await getJSON<unknown>("/awards/"));

export const getAwardSections = async (award_id: ID) =>
  toArray<AwardSection>(
    await getJSON<unknown>(`/awards/sections/?award_id=${award_id}`)
  );

export const getAwardContents = async (section_id: ID) =>
  toArray<AwardContent>(
    await getJSON<unknown>(`/awards/contents/?section_id=${section_id}`)
  );

/* ------------------- ADMIN: Awards ------------------- */
export const createAward = (payload: { title: string; position: number }) =>
  sendJSON<Award>("/awards-actions/", "POST", payload);

export const updateAward = (payload: {
  award_id: ID;
  title?: string;
  position?: number;
}) => sendJSON<Award>("/awards-actions/", "PATCH", payload);

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
}) =>
  sendJSON<AwardSection>("/awards-actions/sections/", "PATCH", payload);

export const deleteAwardSection = (section_id: ID) =>
  sendJSON<{ success?: boolean }>(
    "/awards-actions/sections/",
    "DELETE",
    { section_id }
  );

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
  sendJSON<{ success?: boolean }>(
    "/awards-actions/contents/",
    "DELETE",
    { content_id }
  );
