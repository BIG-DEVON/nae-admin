// src/features/gallery/pages/GalleryDetail.tsx
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useGalleryContents } from "../hooks/useGalleryContents";
import { useGalleryMutations } from "../hooks/useGalleryMutations";
import type { ID } from "../types";
import { notifySuccess, notifyError, extractErrorMessage } from "@/lib/notify";
import SmartImage from "@/components/ui/SmartImage";

/* --------------------------------- types --------------------------------- */
type ContentRow = {
  id: ID;
  gallery_id: ID;
  title: string;
  position: number;
  image_url?: string | null;
  image?: string | null;
  path?: string | null;
};

/* ------------------------------ helpers ---------------------------------- */

// Normalize anything to an array
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

// Build a safe absolute url for images
const RAW_BASE =
  (import.meta.env.VITE_ASSET_BASE as string | undefined) ??
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "";

const ASSET_BASE = RAW_BASE.replace(/\/+$/, "");

function resolveImageUrl(raw?: string | null): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const v = raw.trim();
  if (!v) return undefined;
  if (/^(https?:)?\/\//i.test(v) || /^data:image\//i.test(v)) return v;
  if (v.startsWith("/")) return `${ASSET_BASE}${v}`;
  return ASSET_BASE ? `${ASSET_BASE}/${v}` : v;
}

/* ------------------------------ component -------------------------------- */

export default function GalleryDetail() {
  const [sp] = useSearchParams();
  const galleryId = sp.get("id");

  const { data, isLoading, isError, isFetching, refetch } =
    useGalleryContents(galleryId);

  const {
    createGalleryContent: createMut,
    editGalleryContent: editMut,
    editGalleryContentImage: editImgMut,
    deleteGalleryContent: delMut,
  } = useGalleryMutations();

  // UI: search / sort
  const [q, setQ] = useState("");
  const [asc, setAsc] = useState(true);

  // Lightbox
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Multi-upload state
  const pickerRef = useRef<HTMLInputElement | null>(null);
  const [isDropping, setIsDropping] = useState(false);

  const rows = useMemo<ContentRow[]>(
    () => toArray<ContentRow>(data),
    [data]
  );

  // Derived last position
  const lastPos = rows.length ? Math.max(...rows.map((r) => r.position)) : 0;

  // Filter/sort
  const visible = useMemo(() => {
    const text = q.trim().toLowerCase();
    let list = rows;
    if (text) {
      list = rows.filter((r) => r.title?.toLowerCase().includes(text));
    }
    list = [...list].sort((a, b) =>
      asc ? a.position - b.position : b.position - a.position
    );
    return list;
  }, [rows, q, asc]);

  // Guard
  if (!galleryId) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-red-600">
          Missing required query param: <code>id</code>
        </p>
        <Link
          to="/gallery"
          className="inline-flex rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          ← Back to Galleries
        </Link>
      </div>
    );
  }

  /* ---------------------------- actions ---------------------------------- */

  const createOne = async (file: File, opts: { title?: string; position?: number }) => {
    try {
      await createMut.mutateAsync({
        gallery_id: galleryId as ID,
        image: file,
        title: opts.title ?? file.name.replace(/\.[^.]+$/, "").slice(0, 120),
        position: Number(opts.position ?? 0),
      });
    } catch (err) {
      notifyError("Failed to create item", extractErrorMessage(err));
      throw err;
    }
  };

  const onCreateBatch = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) {
      notifyError("Please select one or more images.");
      return;
    }
    // Sequential creates to keep order stable
    let pos = lastPos;
    try {
      for (const f of arr) {
        pos += 1;
        await createOne(f, { position: pos });
      }
      notifySuccess(`${arr.length} item(s) added`);
      refetch();
    } catch {
      // errors already toasted
    }
  };

  const onEdit = async (payload: {
    content_id: ID;
    gallery_id: ID;
    title?: string;
    position?: number;
  }) => {
    try {
      await editMut.mutateAsync(payload);
      notifySuccess("Content updated.");
      refetch();
    } catch (err) {
      notifyError(
        "Failed to update content",
        extractErrorMessage(err, "Could not update content.")
      );
    }
  };

  const onEditImage = async (contentId: ID, file: File | null | undefined) => {
    if (!file) return;
    try {
      await editImgMut.mutateAsync({ content_id: contentId, image: file });
      notifySuccess("Image updated.");
      refetch();
    } catch (err) {
      notifyError(
        "Failed to update image",
        extractErrorMessage(err, "Could not update image.")
      );
    }
  };

  const onDelete = async (contentId: ID) => {
    if (!confirm("Delete this content item?")) return;
    try {
      await delMut.mutateAsync({ content_id: contentId });
      notifySuccess("Content deleted.");
      refetch();
    } catch (err) {
      notifyError(
        "Failed to delete content",
        extractErrorMessage(err, "Could not delete content.")
      );
    }
  };

  // Drag reorder (swap positions)
  const [dragging, setDragging] = useState<ID | null>(null);
  const onDragStart = (id: ID) => setDragging(id);
  const onDragEnd = () => setDragging(null);

  const swapPositions = async (a: ContentRow, b: ContentRow) => {
    if (!a || !b || a.id === b.id) return;
    try {
      // Optimistic UI could be added; for now do two updates
      await Promise.all([
        editMut.mutateAsync({
          content_id: a.id,
          gallery_id: a.gallery_id,
          position: b.position,
        }),
        editMut.mutateAsync({
          content_id: b.id,
          gallery_id: b.gallery_id,
          position: a.position,
        }),
      ]);
      notifySuccess("Items reordered");
      refetch();
    } catch (err) {
      notifyError("Reorder failed", extractErrorMessage(err));
    }
  };

  const findRow = useCallback(
    (id: ID) => rows.find((r) => String(r.id) === String(id)),
    [rows]
  );

  /* ------------------------------- UI ------------------------------------ */

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/gallery"
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            ← Back
          </Link>
          <h1 className="text-xl font-semibold">Gallery Contents</h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title…"
            className="rounded-full border px-3 py-1.5 text-sm w-56"
          />
          <button
            onClick={() => setAsc((s) => !s)}
            className="rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50"
            title="Toggle sort by position"
          >
            Sort: {asc ? "Asc" : "Desc"}
          </button>
          <button
            onClick={() => refetch()}
            className="rounded-full border px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            Refresh
          </button>
          <span className="text-xs text-neutral-500">
            Gallery ID: <b>{galleryId}</b>
            {isFetching && <span className="ml-2">Refreshing…</span>}
          </span>
        </div>
      </header>

      {/* Uploader (multi) */}
      <section
        className={[
          "rounded-2xl border bg-white p-4 shadow-sm transition",
          isDropping ? "ring-2 ring-emerald-400/60" : "",
        ].join(" ")}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDropping(true);
        }}
        onDragLeave={() => setIsDropping(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDropping(false);
          if (e.dataTransfer?.files?.length) {
            onCreateBatch(e.dataTransfer.files);
          }
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Add images</div>
            <p className="text-xs text-neutral-600">
              Drag & drop or use the picker. We’ll set the title from filename and position after{" "}
              {lastPos}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={pickerRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) onCreateBatch(e.target.files);
                if (pickerRef.current) pickerRef.current.value = "";
              }}
            />
            <button
              onClick={() => pickerRef.current?.click()}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
            >
              Choose files…
            </button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="min-h-[160px]">
        {isLoading ? (
          <div className="rounded-2xl border p-6 shadow-sm text-sm text-neutral-600">
            Loading…
          </div>
        ) : isError ? (
          <div className="rounded-2xl border p-6 shadow-sm text-sm text-red-600">
            Failed to load.
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border p-6 shadow-sm text-sm text-neutral-500">
            No contents yet.
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((c) => (
              <li
                key={String(c.id)}
                draggable
                onDragStart={() => onDragStart(c.id)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => {
                  e.preventDefault();
                  // allow drop
                }}
                onDrop={() => {
                  if (dragging == null) return;
                  const a = findRow(dragging);
                  const b = findRow(c.id);
                  if (a && b) swapPositions(a, b);
                }}
              >
                <Card
                  item={c}
                  onOpen={(src) => setLightbox(src ?? null)}
                  onEdit={(patch) =>
                    onEdit({ content_id: c.id, gallery_id: c.gallery_id, ...patch })
                  }
                  onEditImage={(file) => onEditImage(c.id, file)}
                  onDelete={() => onDelete(c.id)}
                  dragging={dragging != null}
                  isDragging={String(dragging) === String(c.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <dialog
          open
          className="backdrop:bg-black/60 rounded-xl p-0 w-[min(96vw,1000px)]"
          onClose={() => setLightbox(null)}
        >
          <div className="relative">
            <button
              onClick={() => setLightbox(null)}
              className="absolute right-3 top-3 z-10 rounded-md bg-white/90 px-2 py-1 text-xs border hover:bg-emerald-50"
              aria-label="Close preview"
            >
              Close
            </button>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <img
              src={lightbox}
              className="max-h-[82vh] w-auto object-contain rounded-xl"
              loading="eager"
            />
          </div>
        </dialog>
      )}
    </div>
  );
}

/* ------------------------------ Card item --------------------------------- */

function Card({
  item,
  onOpen,
  onEdit,
  onEditImage,
  onDelete,
  dragging,
  isDragging,
}: {
  item: ContentRow;
  onOpen: (src?: string) => void;
  onEdit: (patch: { title?: string; position?: number }) => void;
  onEditImage: (file: File | null | undefined) => void;
  onDelete: () => void;
  dragging: boolean;
  isDragging: boolean;
}) {
  const [title, setTitle] = useState(item.title);
  const [pos, setPos] = useState<number | "">(item.position);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    setTitle(item.title);
    setPos(item.position);
  }, [item.id, item.title, item.position]);

  const raw = item.image_url ?? (item as any).image ?? (item as any).path;
  const imgUrl = localPreview || resolveImageUrl(raw);

  return (
    <div
      className={[
        "rounded-2xl border bg-white p-3 shadow-sm transition",
        dragging ? "cursor-grabbing" : "cursor-grab",
        isDragging ? "opacity-70 ring-2 ring-emerald-400/60" : "",
      ].join(" ")}
      title={`ID ${item.id} • Drag to reorder`}
    >
      {/* preview */}
      <button
        type="button"
        onClick={() => imgUrl && onOpen(imgUrl)}
        className="group relative block"
      >
        <SmartImage
          src={imgUrl}
          alt={item.title}
          className="h-40 w-full"
          imgClassName="object-cover"
          cacheBust
          maxRetries={1}
          fallback={
            <div className="flex h-40 w-full items-center justify-center rounded-md border bg-neutral-50 text-xs text-neutral-400">
              No cover
            </div>
          }
        />
        <span className="pointer-events-none absolute inset-0 rounded-md ring-0 ring-emerald-500/0 group-hover:ring-4 group-hover:ring-emerald-400/30 transition" />
      </button>

      {/* fields */}
      <div className="mt-3 space-y-2">
        <input
          className="w-full rounded-lg border px-2 py-1 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-600">Position</span>
          <input
            className="w-24 rounded-lg border px-2 py-1 text-sm"
            type="number"
            value={pos}
            onChange={(e) =>
              setPos(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>
      </div>

      {/* actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() =>
            onEdit({ title: title.trim(), position: Number(pos || 0) })
          }
          className="rounded-lg border px-2 py-1 text-xs hover:bg-emerald-50"
        >
          Save
        </button>

        <label className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50 cursor-pointer">
          <input
            className="hidden"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                const url = URL.createObjectURL(f);
                setLocalPreview(url);
                onEditImage(f);
                // revoke later to avoid flicker
                setTimeout(() => URL.revokeObjectURL(url), 4000);
              }
            }}
          />
          Change image
        </label>

        <button
          onClick={onDelete}
          className="rounded-lg border px-2 py-1 text-xs hover:bg-red-50 text-red-600"
        >
          Delete
        </button>

        <span className="ml-auto text-[11px] text-neutral-500">
          ID {String(item.id)}
        </span>
      </div>
    </div>
  );
}
