// src/features/overview/pages/History.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import OverviewTabs from "@/features/overview/components/OverviewTabs";
import { useOverviewHistory } from "../hooks/useOverview";
import type { ID } from "../api";
import { notifySuccess, notifyError, extractErrorMessage } from "@/lib/notify";

type HistoryDoc = {
  id?: ID;
  history_id?: ID;
  title?: string;
  content?: string;
  updated_at?: string | number | Date;
};

// Accepts { id/history_id, title, content, updated_at } or { data: { ... } }
function normalizeHistory(input: unknown): HistoryDoc {
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    const data =
      obj.data && typeof obj.data === "object" ? (obj.data as Record<string, unknown>) : obj;

    const idKey =
      typeof data.history_id === "number" || typeof data.history_id === "string"
        ? ("history_id" as const)
        : typeof data.id === "number" || typeof data.id === "string"
        ? ("id" as const)
        : undefined;

    return {
      id: idKey === "id" ? (data.id as ID) : undefined,
      history_id: idKey === "history_id" ? (data.history_id as ID) : undefined,
      title: typeof data.title === "string" ? (data.title as string) : undefined,
      content: typeof data.content === "string" ? (data.content as string) : undefined,
      updated_at: (data as any).updated_at,
    };
  }
  return {};
}

function formatWhen(x?: string | number | Date) {
  if (!x) return "";
  try {
    const d = new Date(x);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
  } catch {
    return "";
  }
}

export default function History() {
  const { query, create, update } = useOverviewHistory();
  const doc = useMemo<HistoryDoc>(() => normalizeHistory(query.data), [query.data]);

  // last saved snapshot to compute "dirty"
  const lastSaved = useRef<{ title: string; content: string; historyId?: ID }>({
    title: doc.title ?? "",
    content: doc.content ?? "",
    historyId: doc.history_id ?? doc.id,
  });

  const [historyId, setHistoryId] = useState<ID | undefined>(doc.history_id ?? doc.id);
  const [title, setTitle] = useState(doc.title ?? "");
  const [content, setContent] = useState(doc.content ?? "");

  // keep local state in sync when data loads/refetches
  useEffect(() => {
    const next = {
      title: doc.title ?? "",
      content: doc.content ?? "",
      historyId: doc.history_id ?? doc.id,
    };
    setHistoryId(next.historyId);
    setTitle(next.title);
    setContent(next.content);
    lastSaved.current = next;
  }, [doc.history_id, doc.id, doc.title, doc.content]);

  const isDirty =
    title !== lastSaved.current.title || content !== lastSaved.current.content;

  const hasDoc = Boolean(historyId || doc.title || doc.content);

  // warn on navigations with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const onRevert = () => {
    setTitle(lastSaved.current.title);
    setContent(lastSaved.current.content);
    notifySuccess("Changes reverted");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const c = content.trim();
    if (!t && !c) {
      notifyError("Please enter a title or content.");
      return;
    }
    try {
      if (hasDoc && historyId != null) {
        // UPDATE
        await update.mutateAsync({ history_id: historyId, title: t, content: c });
        notifySuccess("History updated");

        // ✅ make Revert work immediately (no need to wait for refetch)
        lastSaved.current = { title: t, content: c, historyId };
      } else {
        // CREATE
        const res = await create.mutateAsync({ title: t, content: c });
        notifySuccess("History created");

        // Try to pick an id from the API response so we enter edit mode immediately
        const createdId =
          (res as any)?.history_id ?? (res as any)?.id ?? historyId ?? lastSaved.current.historyId;

        if (createdId != null) setHistoryId(createdId as ID);

        // ✅ also update snapshot immediately
        lastSaved.current = { title: t, content: c, historyId: createdId };
      }
    } catch (err) {
      notifyError("Failed to save", extractErrorMessage(err));
      return;
    }
  };

  const saving = create.isPending || update.isPending;

  return (
    <div className="p-6 space-y-6">
      {/* Header / Toolbar */}
      <header className="mb-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Overview — History</h1>
            <div className="mt-2">
              <OverviewTabs />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            {query.isFetching && (
              <span className="text-xs rounded-full px-2 py-1 border text-neutral-600">
                Refreshing…
              </span>
            )}
            {!!doc.updated_at && (
              <span className="text-xs rounded-full px-2 py-1 border text-neutral-600">
                Last updated: {formatWhen(doc.updated_at)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <section className="rounded-xl border p-4">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Title</span>
            <input
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
              placeholder="History title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="History title"
            />
          </label>

          <label className="grid gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Content</span>
              <span className="text-xs text-neutral-500">
                {content.length.toLocaleString()} chars
              </span>
            </div>
            <textarea
              className="min-h-[240px] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
              placeholder="Write the history content…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              aria-label="History content"
            />
          </label>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
            >
              {hasDoc ? (saving ? "Saving…" : "Save changes") : saving ? "Creating…" : "Create"}
            </button>
            <button
              type="button"
              onClick={onRevert}
              disabled={!isDirty || saving}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
            >
              Revert
            </button>
            {!hasDoc && (
              <span className="text-xs text-neutral-500">
                No history found — creating a new entry.
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
