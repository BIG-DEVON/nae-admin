// Always return a plain { [header]: value } using the token *as-is*.
// No "Bearer", no "Token" prefix — exactly what’s stored/provided.

const STORAGE_KEY = "token";

function readToken(): string {
  // Prefer env override if present, else localStorage
  const fromEnv = (import.meta.env.VITE_API_TOKEN || "").trim();
  if (fromEnv) return fromEnv;

  try {
    const raw = (localStorage.getItem(STORAGE_KEY) || "").trim();
    // Some apps accidentally store JSON-stringified tokens — strip quotes only.
    if (raw.startsWith('"') && raw.endsWith('"')) {
      return raw.slice(1, -1).trim();
    }
    return raw;
  } catch {
    return "";
  }
}

export function authHeader(): Record<string, string> {
  const token = readToken();
  // Send token directly as the Authorization header value
  return token ? { Authorization: token } : {};
}
