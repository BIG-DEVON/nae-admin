export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

const BASE = import.meta.env.VITE_API_BASE_URL;

export async function http<T>(
  url: string,
  method: HttpMethod = "GET",
  body?: unknown,
  signal?: AbortSignal
): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}
