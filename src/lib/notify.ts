// Simple wrappers around sonner's toast so we don't repeat options everywhere
import { toast } from "sonner";

export function notifySuccess(title: string, description?: string) {
  toast.success(title, description ? { description } : undefined);
}

export function notifyError(title: string, description?: string) {
  toast.error(title, description ? { description } : undefined);
}

/** Optional: unify error->message extraction */
export function extractErrorMessage(err: unknown, fallback = "Something went wrong") {
  if (!err) return fallback;

  // Our fetch layer throws `new Error(text)` so this usually works:
  if (err instanceof Error && err.message) return err.message;

  // If someone throws a string/JSON, try to make it readable:
  try {
    if (typeof err === "string") return err;
    const asJson = JSON.stringify(err);
    return asJson.length > 200 ? fallback : asJson;
  } catch {
    return fallback;
  }
}
