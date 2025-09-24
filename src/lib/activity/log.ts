// src/lib/activity/log.ts
import { toast } from "sonner";

export type ActivityAction = "create" | "update" | "delete" | "upload" | "login" | "logout";

export type ActivityItem = {
  id: string;       // uuid-ish
  ts: number;       // Date.now()
  area: string;     // "Gallery", "Awards", "Overview", etc.
  action: ActivityAction;
  message: string;  // human-readable
};

const KEY = "nae_activity";
const MAX = 50;

function read(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ActivityItem[]) : [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("activity.read failed", err);
    return [];
  }
}

function write(list: ActivityItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("activity.write failed", err);
  }
}

function uid(): string {
  try {
    return crypto?.randomUUID?.() ?? String(Math.random());
  } catch {
    return String(Math.random());
  }
}

export function logActivity(partial: Omit<ActivityItem, "id" | "ts">) {
  const item: ActivityItem = {
    id: uid(),
    ts: Date.now(),
    ...partial,
  };

  const list = [item, ...read()];
  write(list);

  // Dev visibility
  // eslint-disable-next-line no-console
  console.log(
    "[activity]",
    new Date(item.ts).toISOString(),
    `${item.area}::${item.action}`,
    item.message
  );

  // Optional toast (ignore if Toaster isn't mounted)
  try {
    toast(`${item.area}: ${item.message}`);
  } catch {
    /* noop */
  }
}

export function getActivity(): ActivityItem[] {
  return read();
}

export function clearActivity() {
  write([]);
}
