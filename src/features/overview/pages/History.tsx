import { useEffect, useMemo, useState } from "react";

import { useOverviewHistory } from '../hooks/useOverview';

type HistoryDoc = { title?: string; content?: string };

export default function History() {
  const { query, create, update } = useOverviewHistory();

  // Normalize the GET payload (it may be an object or wrapped)
  const doc = useMemo<HistoryDoc>(() => {
    const d: any = query.data;
    if (!d) return {};
    if (d.data && typeof d.data === "object") return d.data as HistoryDoc;
    return d as HistoryDoc;
  }, [query.data]);

  const [title, setTitle] = useState(doc.title ?? "");
  const [content, setContent] = useState(doc.content ?? "");

  // keep local state in sync when data loads/refetches
  useEffect(() => {
    setTitle(doc.title ?? "");
    setContent(doc.content ?? "");
  }, [doc.title, doc.content]);

  const hasDoc = Boolean(doc.title || doc.content);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      alert("Please enter a title or content.");
      return;
    }
    if (hasDoc) {
      await update.mutateAsync({ title: title.trim(), content: content.trim() });
    } else {
      await create.mutateAsync({ title: title.trim(), content: content.trim() });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Overview — History</h1>
        {query.isFetching && <span className="text-sm text-neutral-500">Refreshing…</span>}
      </header>

      <section className="rounded-xl border p-4">
        <form className="grid gap-3" onSubmit={onSubmit}>
          <label className="grid gap-1">
            <span className="text-sm font-medium">Title</span>
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="History title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Content</span>
            <textarea
              className="min-h-[220px] rounded-lg border px-3 py-2"
              placeholder="Write the history content…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </label>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={create.isPending || update.isPending}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
            >
              {hasDoc
                ? update.isPending
                  ? "Saving…"
                  : "Save changes"
                : create.isPending
                ? "Creating…"
                : "Create"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
