// src/lib/api/shape.ts
export function toArray<T = unknown>(input: unknown, keys: string[] = ['data', 'results', 'items']): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === 'object') {
    for (const k of keys) {
      const v = (input as any)[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}
