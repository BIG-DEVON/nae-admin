// src/features/overview/pages/Commanders.tsx
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import OverviewTabs from "@/features/overview/components/OverviewTabs";
import { useOverviewCommanders } from "../hooks/useOverview";
import { notifySuccess, notifyError, extractErrorMessage } from "@/lib/notify";
import SmartImage from "@/components/ui/SmartImage";
import { cn } from "@/utils/cn";

/* ------------------------------------------------------------------ */
/* Config & Helpers                                                    */
/* ------------------------------------------------------------------ */

const MAX_IMAGE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Coerce unknown payload shapes to arrays
function toArray<T = unknown>(input: unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    for (const k of ["data", "results", "items"]) {
      const v = obj[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

const RAW_BASE =
  (import.meta.env.VITE_ASSET_BASE as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  window.location.origin;

const ASSET_BASE = (RAW_BASE || "").replace(/\/+$/, "");

// Normalize any URL-ish value to a browser-usable URL
function resolveImageUrl(raw?: string | null): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const val = raw.trim();
  if (!val) return undefined;
  if (/^(https?:)?\/\//i.test(val) || /^data:image\//i.test(val)) return val;
  if (val.startsWith("/")) return `${ASSET_BASE}${val}`;
  return `${ASSET_BASE}/${val}`;
}

type Row = {
  id: number | string;
  title: string;
  content?: string;
  position: number;
  image_url?: string | null;
  image?: string | null;
  photo?: string | null;
  path?: string | null;
};

type UpdateCommanderInput = {
  commander_id: Row["id"];
  title?: string;
  content?: string;
  position?: number;
};

type UpdateCommanderImageInput = {
  commander_id: Row["id"];
  image: File;
};

function validateFile(file: File | null): string | null {
  if (!file) return "Choose an image file.";
  if (!ALLOWED_TYPES.includes(file.type))
    return "Unsupported image type. Use JPG, PNG, or WEBP.";
  const mb = file.size / (1024 * 1024);
  if (mb > MAX_IMAGE_MB) return `Image too large (${mb.toFixed(1)}MB). Max ${MAX_IMAGE_MB}MB.`;
  return null;
}

// Debounced callback without `any`
function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = 500
) {
  const tRef = useRef<number | null>(null);
  const cb = useCallback(
    (...args: Args) => {
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = window.setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
  useEffect(() => () => { if (tRef.current) window.clearTimeout(tRef.current); }, []);
  return cb;
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function Commanders() {
  const { query, create, update, updateImage, remove } = useOverviewCommanders();

  const rows = useMemo<Row[]>(() => {
    const r = toArray<Row>(query.data);
    return [...r].sort((a, b) => a.position - b.position);
  }, [query.data]);

  const lastPos = rows.length ? rows[rows.length - 1].position : 0;

  const [dense, setDense] = useState(false);

  // Create form
  const [f, setF] = useState<{ title: string; content: string; position: number | ""; image: File | null; }>({
    title: "",
    content: "",
    position: lastPos + 1,
    image: null,
  });

  // Create preview
  const [newPreview, setNewPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!f.image) {
      setNewPreview(null);
      return;
    }
    const url = URL.createObjectURL(f.image);
    setNewPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [f.image]);

  // Filter & sort
  const [qText, setQText] = useState("");
  const [asc, setAsc] = useState(true);

  const filteredBase = useMemo(() => {
    const text = qText.trim().toLowerCase();
    let list = rows;
    if (text) {
      list = rows.filter(
        (r) =>
          r.title?.toLowerCase().includes(text) ||
          r.content?.toLowerCase().includes(text)
      );
    }
    return [...list].sort((a, b) => (asc ? a.position - b.position : b.position - a.position));
  }, [rows, qText, asc]);

  // Local order (DnD + keyboard)
  const [ordered, setOrdered] = useState<Row[]>(filteredBase);
  useEffect(() => setOrdered(filteredBase), [filteredBase]);

  /* Create */

  const onCreate = async () => {
    const title = f.title.trim();
    const content = f.content.trim();
    const position = f.position === "" ? "" : Number(f.position);

    const vErr = validateFile(f.image);
    if (vErr) return notifyError(vErr);
    if (!title || position === "") return notifyError("Title and position are required.");

    try {
      await create.mutateAsync({ title, content, position: Number(position), image: f.image! });
      notifySuccess("Commander created");

      const freshLast = rows.length ? rows[rows.length - 1].position : 0;
      setF({ title: "", content: "", position: freshLast + 1, image: null });
      setNewPreview(null);
    } catch (err) {
      notifyError("Failed to create commander", extractErrorMessage(err));
    }
  };

  /* Drag & Drop */

  const dragIdRef = useRef<string | null>(null);

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    dragIdRef.current = id;
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (overId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const dragId = dragIdRef.current;
    if (!dragId || dragId === overId) return;

    const srcIdx = ordered.findIndex((r) => String(r.id) === dragId);
    const dstIdx = ordered.findIndex((r) => String(r.id) === overId);
    if (srcIdx < 0 || dstIdx < 0 || srcIdx === dstIdx) return;

    const next = [...ordered];
    const [moved] = next.splice(srcIdx, 1);
    next.splice(dstIdx, 0, moved);
    setOrdered(next);
  };

  const persistPositions = async (list: Row[]) => {
    try {
      const originalMap = new Map(rows.map((r) => [String(r.id), r.position]));
      for (const r of list) {
        if (originalMap.get(String(r.id)) !== r.position) {
          const payload: UpdateCommanderInput = { commander_id: r.id, position: r.position };
          await update.mutateAsync(payload as unknown as Parameters<typeof update.mutateAsync>[0]);
        }
      }
      notifySuccess("Positions saved");
    } catch (err) {
      notifyError("Failed to save positions", extractErrorMessage(err));
    }
  };

  const onDropGrid = async () => {
    dragIdRef.current = null;
    const next = ordered.map((r, i) => ({ ...r, position: i + 1 }));
    setOrdered(next);
    await persistPositions(next);
  };

  /* Keyboard reordering */

  const moveItemBy = async (id: number | string, delta: number) => {
    const idx = ordered.findIndex((x) => String(x.id) === String(id));
    if (idx < 0) return;

    const newIdx = Math.max(0, Math.min(ordered.length - 1, idx + delta));
    if (newIdx === idx) return;

    const next = [...ordered];
    const [moved] = next.splice(idx, 1);
    next.splice(newIdx, 0, moved);

    const renum = next.map((r, i) => ({ ...r, position: i + 1 }));
    setOrdered(renum);
    await persistPositions(renum);
  };

  /* Bulk normalize */

  const normalizePositions = async () => {
    const renum = ordered.map((r, i) => ({ ...r, position: i + 1 }));
    setOrdered(renum);
    await persistPositions(renum);
  };

  /* Render */

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Link to="/overview/history" className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">
            ← Overview
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Overview — Commanders</h1>
            <div className="mt-2">
              <OverviewTabs />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            className="rounded-full border px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            placeholder="Search list…"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            aria-label="Search commanders"
          />
          <button
            onClick={() => setAsc((s) => !s)}
            className="rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            title="Toggle sort by position"
          >
            Sort: {asc ? "Asc" : "Desc"}
          </button>
          <button
            onClick={() => setDense((d) => !d)}
            className="rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            title="Toggle dense grid"
          >
            {dense ? "Comfort" : "Dense"}
          </button>
          <button
            onClick={normalizePositions}
            className="rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            title="Renumber positions 1…n"
          >
            Normalize positions
          </button>
        </div>
      </header>

      {/* Create */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">Add commander</h2>
          <div className="text-xs text-neutral-500">JPG/PNG/WEBP • up to {MAX_IMAGE_MB}MB</div>
        </div>

        <div className="grid gap-3 md:grid-cols-5 mt-3">
          <input
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            placeholder="Title"
            value={f.title}
            onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))}
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm md:col-span-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            placeholder="Content"
            value={f.content}
            onChange={(e) => setF((s) => ({ ...s, content: e.target.value }))}
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            placeholder="Position"
            type="number"
            value={f.position}
            onChange={(e) =>
              setF((s) => ({ ...s, position: e.target.value === "" ? "" : Number(e.target.value) }))
            }
          />

          <label className="rounded-lg border px-3 py-2 text-sm cursor-pointer hover:bg-neutral-50 flex items-center gap-2">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                const v = validateFile(file);
                if (v) {
                  notifyError(v);
                  return;
                }
                setF((s) => ({ ...s, image: file }));
              }}
            />
            <span>Choose file</span>
          </label>

          {/* Preview */}
          <div className="md:col-span-5 flex items-center gap-3">
            <div className="h-32 w-32">
              <SmartImage
                src={newPreview ?? undefined}
                alt="New commander preview"
                className="h-32 w-32"
                imgClassName="object-cover"
                cacheBust={false}
                maxRetries={0}
                fallback={
                  <div className="flex h-full w-full items-center justify-center rounded-md border bg-neutral-50 text-[10px] text-neutral-400">
                    No preview
                  </div>
                }
              />
            </div>
            <button
              onClick={() => setF((s) => ({ ...s, image: null }))}
              className={cn("rounded-lg border px-3 py-2 text-sm", "hover:bg-neutral-50 disabled:opacity-60")}
              disabled={!f.image}
            >
              Clear file
            </button>
            <button
              onClick={onCreate}
              disabled={create.isPending}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-emerald-50 disabled:opacity-60"
            >
              {create.isPending ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      </section>

      {/* List */}
      <section className="space-y-3">
        {query.isLoading && (
          <div className="rounded-2xl border p-6 shadow-sm text-sm text-neutral-600">Loading…</div>
        )}

        {!query.isLoading && ordered.length === 0 && (
          <div className="rounded-2xl border p-6 shadow-sm text-center text-sm text-neutral-500">
            No commanders found.
          </div>
        )}

        <ul
          className={cn(
            "grid gap-4",
            dense ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-3"
          )}
          onDrop={onDropGrid}
          onDragOver={(e) => e.preventDefault()}
        >
          {ordered.map((item, idx) => (
            <li
              key={String(item.id)}
              draggable
              onDragStart={onDragStart(String(item.id))}
              onDragOver={onDragOver(String(item.id))}
              tabIndex={0}
              onKeyDown={async (e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  await moveItemBy(item.id, -1);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  await moveItemBy(item.id, +1);
                }
              }}
              aria-label={`Commander ${item.title}, position ${item.position}, row ${idx + 1}`}
            >
              <CommanderCard item={item} actions={{ update, updateImage, remove }} />
            </li>
          ))}
        </ul>

        {ordered.length > 0 && (
          <p className="text-xs text-neutral-500">
            Tip: drag cards to reorder, or focus a card and press <kbd>↑</kbd>/<kbd>↓</kbd>. Changes auto-save.
          </p>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                               */
/* ------------------------------------------------------------------ */

function CommanderCard({
  item,
  actions,
}: {
  item: Row;
  actions: {
    update: ReturnType<typeof useOverviewCommanders>["update"];
    updateImage: ReturnType<typeof useOverviewCommanders>["updateImage"];
    remove: ReturnType<typeof useOverviewCommanders>["remove"];
  };
}) {
  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content ?? "");
  const [pos, setPos] = useState<number | "">(item.position);

  // lightbox
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // Resolve image from possible keys without `any`
  const rec = item as Record<string, unknown>;
  const rawImage =
    item.image_url ??
    (rec["image"] as string | null | undefined) ??
    (rec["photo"] as string | null | undefined) ??
    (rec["path"] as string | null | undefined) ??
    null;
  const imgUrl = resolveImageUrl(rawImage ?? undefined);

  // Debounced autosave while editing
  const debouncedSave = useDebouncedCallback(
    async (t: string, c: string, p: number | "") => {
      if (!edit) return;
      try {
        const payload: UpdateCommanderInput = {
          commander_id: item.id,
          title: t.trim(),
          content: c.trim(),
          position: typeof p === "number" ? p : item.position,
        };
        await actions.update.mutateAsync(
          payload as unknown as Parameters<typeof actions.update.mutateAsync>[0]
        );
      } catch (err) {
        notifyError("Failed to save changes", extractErrorMessage(err));
      }
    },
    700
  );

  useEffect(() => {
    if (edit) debouncedSave(title, content, pos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, pos, edit]);

  const saveOnce = async () => {
    try {
      const payload: UpdateCommanderInput = {
        commander_id: item.id,
        title: title.trim(),
        content: content.trim(),
        position: typeof pos === "number" ? pos : item.position,
      };
      await actions.update.mutateAsync(
        payload as unknown as Parameters<typeof actions.update.mutateAsync>[0]
      );
      notifySuccess("Commander updated");
      setEdit(false);
    } catch (err) {
      notifyError("Failed to update commander", extractErrorMessage(err));
    }
  };

  const changeImage = async (file: File | null | undefined) => {
    if (!file) return;
    const v = validateFile(file);
    if (v) return notifyError(v);
    try {
      const payload: UpdateCommanderImageInput = { commander_id: item.id, image: file };
      await actions.updateImage.mutateAsync(
        payload as unknown as Parameters<typeof actions.updateImage.mutateAsync>[0]
      );
      notifySuccess("Image updated");
    } catch (err) {
      notifyError("Failed to update image", extractErrorMessage(err));
    }
  };

  const del = async () => {
    if (!confirm("Delete this commander?")) return;
    try {
      await actions.remove.mutateAsync(item.id as never);
      notifySuccess("Commander deleted");
    } catch (err) {
      notifyError("Failed to delete commander", extractErrorMessage(err));
    }
  };

  return (
    <div className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex gap-4 p-4">
        {/* Drag handle hint */}
        <div className="select-none text-neutral-300 pt-1 pr-1" title="Drag card to reorder" aria-hidden>
          ⋮⋮
        </div>

        {/* Larger Thumbnail */}
        <button
          type="button"
          className="group relative h-32 w-32 shrink-0"
          onClick={() => imgUrl && setOpen(true)}
          title={imgUrl ? "Click to preview" : "No image"}
        >
          <SmartImage
            src={imgUrl}
            alt={item.title}
            className="h-32 w-32"
            imgClassName="object-cover"
            cacheBust
            maxRetries={1}
          />
          <span className="pointer-events-none absolute inset-0 rounded-md ring-0 ring-emerald-500/0 group-hover:ring-4 group-hover:ring-emerald-400/30 transition" />
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            {edit ? (
              <input
                className="rounded-lg border px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            ) : (
              <h3 className="font-medium truncate">{item.title}</h3>
            )}

            <span className="rounded-full border px-2 py-0.5 text-xs text-neutral-600">Pos {item.position}</span>
          </div>

          <div className="mt-2">
            {edit ? (
              <input
                className="rounded-lg border px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content"
              />
            ) : (
              <p className="text-sm text-neutral-700 line-clamp-2">{item.content || "—"}</p>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="rounded-lg border px-2 py-1 text-xs hover:bg-emerald-50 cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500/60">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => changeImage(e.target.files?.[0])}
              />
              Change image
            </label>

            {edit ? (
              <>
                <button onClick={saveOnce} className="rounded-lg border px-2 py-1 text-xs hover:bg-emerald-50">
                  Save
                </button>
                <button onClick={() => setEdit(false)} className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEdit(true)} className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50">
                  Edit
                </button>
                <button onClick={del} className="rounded-lg border px-2 py-1 text-xs hover:bg-red-50 text-red-600">
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {edit && (
        <div className="border-t p-3 flex items-center gap-2">
          <span className="text-xs text-neutral-600">Position</span>
          <input
            className="rounded-lg border px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            type="number"
            value={pos}
            onChange={(e) => setPos(e.target.value === "" ? "" : Number(e.target.value))}
          />
        </div>
      )}

      {open && imgUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onClick={close}
          onKeyDown={(e) => e.key === "Escape" && close()}
          tabIndex={-1}
        >
          <div className="relative max-h-[90vh] max-w-[min(92vw,1200px)]" onClick={(e) => e.stopPropagation()}>
            <img src={imgUrl} alt={item.title} className="max-h-[90vh] w-auto rounded-xl shadow-2xl" />
            <button
              type="button"
              onClick={close}
              className="absolute -right-3 -top-3 rounded-full bg-white px-3 py-1 text-sm shadow ring-1 ring-black/10 hover:bg-emerald-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
