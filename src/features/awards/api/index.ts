// src/features/awards/api/index.ts
import type { ID } from '@/features/gallery/types';
import type { Award, AwardSection, AwardContent } from '../types';

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Normalize API shapes: [], {data:[]}, {results:[]}, {items:[]}
function toArray<T = unknown>(input: unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    for (const k of ['data', 'results', 'items']) {
      const v = obj[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

async function sendJSON<T>(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body: unknown
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (text.trim().length === 0) return {} as T; // e.g., DELETE with no body
    throw new Error(text);
  }
  const text = await res.text();
  return (text ? (JSON.parse(text) as T) : ({} as T));
}

/* ------------------- READ (normalized) ------------------- */
export const getAwards = async () => {
  const json = await getJSON<unknown>('/awards/');
  return toArray<Award>(json);
};

export const getAwardSections = async (award_id: ID) => {
  const json = await getJSON<unknown>(`/awards/sections/?award_id=${award_id}`);
  return toArray<AwardSection>(json);
};

export const getAwardContents = async (section_id: ID) => {
  const json = await getJSON<unknown>(`/awards/contents/?section_id=${section_id}`);
  return toArray<AwardContent>(json);
};

/* ------------------- ADMIN: Awards ------------------- */
export const createAward = (payload: { title: string; position: number }) =>
  sendJSON<Award>('/awards-actions/', 'POST', payload);

export const updateAward = (payload: { award_id: ID; title?: string; position?: number }) =>
  sendJSON<Award>('/awards-actions/', 'PATCH', payload);

export const deleteAward = (award_id: ID) =>
  sendJSON<{ success?: boolean }>('/awards-actions/', 'DELETE', { award_id });

/* ------------------- ADMIN: Sections ------------------- */
export const createAwardSection = (payload: {
  award_id: ID; title: string; position: number;
}) => sendJSON<AwardSection>('/awards-actions/sections/', 'POST', payload);

export const updateAwardSection = (payload: {
  section_id: ID; award_id: ID; title?: string; position?: number;
}) => sendJSON<AwardSection>('/awards-actions/sections/', 'PATCH', payload);

export const deleteAwardSection = (section_id: ID) =>
  sendJSON<{ success?: boolean }>('/awards-actions/sections/', 'DELETE', { section_id });

/* ------------------- ADMIN: Contents ------------------- */
export const createAwardContent = (payload: {
  award_section_id: ID;
  position: number;
  rank?: string; name?: string; pno?: string; courseno?: string; unit?: string; year?: string;
}) => sendJSON<AwardContent>('/awards-actions/contents/', 'POST', payload);

export const updateAwardContent = (payload: {
  content_id: ID;
  award_section_id: ID;
  position?: number;
  rank?: string; name?: string; pno?: string; courseno?: string; unit?: string; year?: string;
}) => sendJSON<AwardContent>('/awards-actions/contents/', 'PATCH', payload);

export const deleteAwardContent = (content_id: ID) =>
  sendJSON<{ success?: boolean }>('/awards-actions/contents/', 'DELETE', { content_id });
