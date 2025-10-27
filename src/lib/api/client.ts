// src/lib/client.ts
type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL || "").trim();
// strip trailing slashes just in case
const BASE_URL = RAW_BASE.replace(/\/+$/, "");

// Prefer token from env for staging/demo, else localStorage
const getToken = () =>
  (import.meta.env.VITE_API_TOKEN || localStorage.getItem("token") || "").trim();

type RequestOptions = {
  method?: HttpMethod;
  path: string; // e.g. "/gallery/" or "gallery/"
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown; // JSON object or FormData
  signal?: AbortSignal;
  auth?: "always" | "ifAvailable" | "none";
};

function toQueryString(query?: RequestOptions["query"]) {
  if (!query) return "";
  const sp = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// Normalize to ensure we always call `${BASE_URL}/...`
function normalizePath(p: string) {
  if (!p) return "/";
  return p.startsWith("/") ? p : `/${p}`;
}

export async function http<T = unknown>(opts: RequestOptions): Promise<T> {
  const { method = "GET", path, query, body, signal, auth = "ifAvailable" } = opts;

  const qs = toQueryString(query);
  const url = `${BASE_URL}${normalizePath(path)}${qs}`;

  const headers = new Headers();
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  if (!isForm && method !== "GET" && method !== "DELETE") {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  const shouldAttachAuth =
    auth === "always" || (auth === "ifAvailable" && token.length > 0);
  if (shouldAttachAuth) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, {
    method,
    headers,
    signal,
    body: isForm ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const asJson = contentType.includes("application/json");

  if (!res.ok) {
    const errPayload = asJson ? await res.json().catch(() => ({})) : await res.text();
    throw {
      status: res.status,
      statusText: res.statusText,
      url,
      payload: errPayload,
    };
  }

  return (asJson ? res.json() : (res.text() as unknown)) as T;
}
