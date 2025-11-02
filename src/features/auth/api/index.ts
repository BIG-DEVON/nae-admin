// src/features/auth/api/index.ts
import { http } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

/** Pull a token out of various possible response shapes */
function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const obj = payload as Record<string, any>;

  const candidates = [
    obj.token,
    obj.accessToken,
    obj.access,
    obj.access_token,
    obj?.data?.token,
    obj?.data?.accessToken,
    obj?.data?.access,
    obj?.data?.access_token,
  ];
  for (const c of candidates) if (typeof c === "string" && c.trim()) return c.trim();
  return null;
}

export type LoginInput = { username: string; password: string };

/**
 * Single, strict JSON login. One request only.
 */
export async function login(input: LoginInput): Promise<string> {
  const res = await http<any>({
    method: "POST",
    path: endpoints.auth.login(), // "/auth/login/"
    body: { username: input.username, password: input.password },
    auth: "none",
  });

  const token = extractToken(res);
  if (!token) {
    throw new Error("Login succeeded but no token was returned by the server.");
  }
  return token;
}
