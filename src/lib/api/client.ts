type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";
const getToken = () => (import.meta.env.VITE_API_TOKEN || localStorage.getItem("token") || "").trim();

type RequestOptions = {
  method?: HttpMethod;
  path: string;                  // e.g. "/gallery/"
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;                    // JSON object or FormData
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

export async function http<T = unknown>(opts: RequestOptions): Promise<T> {
  const { method = "GET", path, query, body, signal, auth = "ifAvailable" } = opts;

  const qs = toQueryString(query);
  const url = `${BASE_URL}${path}${qs}`;

  const headers = new Headers();
  // Only set JSON headers if body is NOT FormData
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  if (!isForm && method !== "GET" && method !== "DELETE") {
    headers.set("Content-Type", "application/json");
  }

  // Attach token
  const token = getToken();
  const shouldAttachAuth =
    auth === "always" || (auth === "ifAvailable" && token.length > 0);
  if (shouldAttachAuth) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, {
    method,
    headers,
    signal,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
    // credentials: "include", // enable if server uses cookies
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
