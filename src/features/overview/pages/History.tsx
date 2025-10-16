// src/features/overview/pages/History.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import OverviewTabs from "@/features/overview/components/OverviewTabs";
import { useOverviewHistory } from "../hooks/useOverview";
import type { ID } from "../api";
import { notifySuccess, notifyError, extractErrorMessage } from "@/lib/notify";

/* ============================================================================
   Types + helpers
============================================================================ */

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
      obj.data && typeof obj.data === "object"
        ? (obj.data as Record<string, unknown>)
        : obj;

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
      content:
        typeof data.content === "string" ? (data.content as string) : undefined,
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

function countWords(s: string) {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/g).length;
}

/** Convert plain text into minimal formatted HTML (headings, paragraphs) */
function renderPreviewHTML(title: string, body: string) {
  const esc = (str: string) =>
    str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

  const lines = body.split(/\r?\n/);
  const blocks: string[] = [];
  let para: string[] = [];

  const pushPara = () => {
    if (para.length) {
      blocks.push(
        `<p class="leading-7 text-[15px] text-neutral-800">${esc(
          para.join(" ")
        )}</p>`
      );
      para = [];
    }
  };

  for (const line of lines) {
    if (/^\s*$/.test(line)) {
      pushPara();
      continue;
    }
    // simple heading detection: lines starting with #, ##, ###
    const m = line.match(/^(\s*#{1,3})\s+(.*)$/);
    if (m) {
      pushPara();
      const level = m[1].trim().length;
      const txt = esc(m[2].trim());
      const H =
        level === 1
          ? "h2"
          : level === 2
          ? "h3"
          : /* level === 3 */ "h4";
      const size =
        level === 1
          ? "text-xl"
          : level === 2
          ? "text-lg"
          : "text-base";
      blocks.push(
        `<${H} class="mt-4 mb-2 ${size} font-semibold text-neutral-900">${txt}</${H}>`
      );
    } else {
      para.push(line.trim());
    }
  }
  pushPara();

  const safeTitle = esc(title || "Untitled");
  return `
    <div class="space-y-3">
      <h1 class="text-2xl font-semibold text-neutral-900">${safeTitle}</h1>
      ${blocks.join("\n")}
    </div>
  `;
}

/* ============================================================================
   Draft (localStorage) helpers
============================================================================ */

const DRAFT_KEY = "overview_history_draft_v1";

type DraftPayload = {
  title: string;
  content: string;
  savedAt: number; // epoch ms
};

function loadDraft(): DraftPayload | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as DraftPayload;
    if (typeof obj?.title !== "string" || typeof obj?.content !== "string") {
      return null;
    }
    return obj;
  } catch {
    return null;
  }
}

function saveDraft(p: DraftPayload) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

/* ============================================================================
   Page
============================================================================ */

export default function History() {
  const { query, create, update } = useOverviewHistory();
  const doc = useMemo<HistoryDoc>(() => normalizeHistory(query.data), [query.data]);

  // last saved snapshot to compute "dirty"
  const lastSaved = useRef<{ title: string; content: string; historyId?: ID; ts?: number }>({
    title: doc.title ?? "",
    content: doc.content ?? "",
    historyId: doc.history_id ?? doc.id,
    ts: Date.now(),
  });

  const [historyId, setHistoryId] = useState<ID | undefined>(doc.history_id ?? doc.id);
  const [title, setTitle] = useState(doc.title ?? "");
  const [content, setContent] = useState(doc.content ?? "");

  const hasDoc = Boolean(historyId || doc.title || doc.content);
  const isDirty =
    title !== lastSaved.current.title || content !== lastSaved.current.content;

  // keep local state in sync when data loads/refetches
  useEffect(() => {
    const next = {
      title: doc.title ?? "",
      content: doc.content ?? "",
      historyId: doc.history_id ?? doc.id,
    };
    setHistoryId(next.historyId);
    setTitle((prev) => (prev === "" && next.title ? next.title : prev));
    setContent((prev) => (prev === "" && next.content ? next.content : prev));
    // if server changed, refresh snapshot
    lastSaved.current = { ...next, ts: Date.now() };
  }, [doc.history_id, doc.id, doc.title, doc.content]);

  // Load draft if newer than lastSaved and different
  useEffect(() => {
    const d = loadDraft();
    if (!d) return;
    const draftIsNewer = (d.savedAt ?? 0) > (lastSaved.current.ts ?? 0);
    const differs = d.title !== lastSaved.current.title || d.content !== lastSaved.current.content;
    if (draftIsNewer && differs) {
      setTitle(d.title);
      setContent(d.content);
      notifySuccess("Recovered local draft");
    }
  }, []);

  // Persist draft on edits (debounced-ish)
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (isDirty) {
        saveDraft({ title, content, savedAt: Date.now() });
      }
    }, 350);
    return () => clearTimeout(id);
  }, [title, content, isDirty]);

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

  // Hotkey: Cmd/Ctrl+S to save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmdS = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";
      if (isCmdS) {
        e.preventDefault();
        doSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, historyId]);

  const onRevert = () => {
    setTitle(lastSaved.current.title);
    setContent(lastSaved.current.content);
    notifySuccess("Changes reverted");
  };

  const doSubmit = useCallback(async () => {
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
        lastSaved.current = { title: t, content: c, historyId, ts: Date.now() };
        clearDraft();
      } else {
        // CREATE
        const res = await create.mutateAsync({ title: t, content: c });
        notifySuccess("History created");
        const createdId =
          (res as any)?.history_id ?? (res as any)?.id ?? historyId ?? lastSaved.current.historyId;
        if (createdId != null) setHistoryId(createdId as ID);
        lastSaved.current = { title: t, content: c, historyId: createdId, ts: Date.now() };
        clearDraft();
      }
    } catch (err) {
      notifyError("Failed to save", extractErrorMessage(err));
      return;
    }
  }, [title, content, hasDoc, historyId, create, update]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void doSubmit();
  };

  const saving = create.isPending || update.isPending;

  /* ------------------------------------------------------------------------
     UI
  ------------------------------------------------------------------------- */

  const titleWords = countWords(title);
  const contentWords = countWords(content);
  const previewHTML = useMemo(() => renderPreviewHTML(title, content), [title, content]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="mb-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Overview — History</h1>
            <div className="mt-2">
              <OverviewTabs />
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 mt-1">
            {query.isFetching && (
              <span className="text-xs rounded-full px-2 py-1 border text-neutral-600">
                Refreshing…
              </span>
            )}
            {!!doc.updated_at && (
              <span className="text-xs rounded-full px-2 py-1 border text-neutral-700">
                Last updated: {formatWhen(doc.updated_at)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Editor + Preview */}
      <section className="rounded-2xl border shadow-sm overflow-hidden">
        {/* Sticky toolbar */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b bg-white/90 backdrop-blur px-3 py-2">
          <div className="flex items-center gap-2">
            <span
              className={[
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                isDirty ? "border-emerald-500/60 text-emerald-700 bg-emerald-50" : "text-neutral-600",
              ].join(" ")}
              title={isDirty ? "Unsaved changes" : "All changes saved"}
            >
              {isDirty ? "Unsaved" : "Saved"}
            </span>
            {!hasDoc && (
              <span className="text-xs text-neutral-500">No history found — creating a new entry.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRevert}
              disabled={!isDirty || saving}
              className="rounded-full border px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-60"
              title="Revert changes"
            >
              Revert
            </button>
            <button
              type="button"
              onClick={() => {
                clearDraft();
                notifySuccess("Local draft cleared");
              }}
              className="rounded-full border px-3 py-1.5 text-sm hover:bg-neutral-50"
              title="Clear local draft"
            >
              Clear draft
            </button>
            <button
              type="button"
              onClick={() => void doSubmit()}
              disabled={saving || !isDirty}
              className="rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50 disabled:opacity-60"
              title="Save (Ctrl/Cmd+S)"
            >
              {hasDoc ? (saving ? "Saving…" : "Save") : saving ? "Creating…" : "Create"}
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0">
          {/* Editor */}
          <form className="p-4 space-y-4" onSubmit={onSubmit}>
            <label className="grid gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Title</span>
                <span className="text-xs text-neutral-500">{titleWords} words</span>
              </div>
              <input
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                placeholder="History title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="History title"
                autoCapitalize="sentences"
              />
            </label>

            <label className="grid gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Content</span>
                <span className="text-xs text-neutral-500">
                  {content.length.toLocaleString()} chars • {contentWords} words
                </span>
              </div>
              <textarea
                className="min-h-[300px] rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40"
                placeholder="Write the history content… (supports # headings and blank-line paragraphs)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                aria-label="History content"
                spellCheck
              />
            </label>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-emerald-50 disabled:opacity-60"
              >
                {hasDoc ? (saving ? "Saving…" : "Save changes") : saving ? "Creating…" : "Create"}
              </button>
              <span className="text-xs text-neutral-400">Tip: press ⌘/Ctrl+S to save</span>
            </div>
          </form>

          {/* Preview */}
          <aside className="border-t xl:border-t-0 xl:border-l bg-neutral-50/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium text-neutral-700">Live preview</div>
              <div className="text-xs text-neutral-500">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div
              className="prose prose-sm max-w-none prose-headings:scroll-mt-20"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: previewHTML }}
            />
          </aside>
        </div>
      </section>
    </div>
  );
}
