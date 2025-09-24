// always return a plain Record<string, string> (no undefined values)
export function authHeader(): Record<string, string> {
  try {
    const raw = localStorage.getItem("token") || localStorage.getItem("access_token");
    if (!raw) return {};
    const token = raw.replace(/^"|"$/g, ""); // in case it's stringified
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}
