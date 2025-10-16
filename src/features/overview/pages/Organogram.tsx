// src/features/overview/pages/Organogram.tsx
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import OverviewTabs from "@/features/overview/components/OverviewTabs";
import { useOverviewOrganogram } from "../hooks/useOverview";
import { notifySuccess, notifyError, extractErrorMessage } from "@/lib/notify";
import SmartImage from "@/components/ui/SmartImage";

type Row = { id: number | string; position: number; image_url?: string | null };

/** ---- Upload constraints ---- */
const MAX_IMAGE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Resolve whatever the backend returns into a real URL */
function resolveImageUrl(item: Partial<Row> & Record<string, any>): string {
  const raw =
    item.image_url ??
    item.imageUrl ??
    item.image ??
    item.url ??
    item.path ??
    "";

  let src = String(raw || "").trim();
  if (!src) return "";

  // If protocol-relative: //cdn.com/file.jpg
  if (src.startsWith("//")) {
    return `${window.location.protocol}${src}`;
  }

  // If already absolute
  if (/^https?:\/\//i.test(src)) return src;

  // Prefer explicit file base, then API base
  const base =
    (import.meta.env.VITE_FILE_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    "";

  if (base) {
    const cleanBase = base.replace(/\/+$/, "");
    const cleanSrc = src.replace(/^\/+/, "");
    return `${cleanBase}/${cleanSrc}`;
  }

  // Fallback to root-relative
  return src.startsWith("/") ? src : `/${src}`;
}

/** Validate file before upload */
function validateFile(f: File | null): string | null {
  if (!f) return "Pick an image first";
  if (!ALLOWED_TYPES.includes(f.type))
    return "Unsupported image type. Use JPG, PNG or WEBP.";
  const mb = f.size / (1024 * 1024);
  if (mb > MAX_IMAGE_MB)
    return `Image too large (${mb.toFixed(1)}MB). Max ${MAX_IMAGE_MB}MB.`;
  return null;
}

export default function Organogram() {
  const { query, create, updateImage, updatePosition, remove } =
    useOverviewOrganogram();

  const rows = useMemo<Row[]>(
    () =>
      (Array.isArray(query.data) ? (query.data as Row[]) : []).slice().sort(
        (a, b) => a.position - b.position
      ),
    [query.data]
  );

  // last known position -> suggest the next one for create
  const lastPos = rows.length ? rows[rows.length - 1].position : 0;

  const [position, setPosition] = useState<number | "">(lastPos + 1);
  const [file, setFile] = useState<File | null>(null);

  // DnD state
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Lightbox
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const openLightboxByIndex = useCallback((idx: number) => {
    if (idx >= 0 && idx < rows.length) setLightboxIdx(idx);
  }, [rows.length]);

  const closeLightbox = () => setLightboxIdx(null);
  const hasLightbox = lightboxIdx != null;
  const currentLightbox = hasLightbox ? rows[lightboxIdx!] : null;

  // when rows change (after refetch), update the suggested next position
  useEffect(() => {
    setPosition((prev) => (prev === "" ? "" : lastPos + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastPos]);

  const onCreate = async () => {
    const err = validateFile(file);
    if (err) return notifyError(err);

    const pos = Number(position || 0);
    try {
      await create.mutateAsync({ position: pos, image: file! });
      notifySuccess("Organogram image created");
      setFile(null);
      setPosition(lastPos + 1);
    } catch (e) {
      notifyError("Failed to create image", extractErrorMessage(e));
    }
  };

  // Drag & drop handlers for the uploader
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    const msg = validateFile(f);
    if (msg) return notifyError(msg);
    setFile(f);
  };

  const onKeyNav = useCallback(
    (e: KeyboardEvent) => {
      if (!hasLightbox) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setLightboxIdx((i) => (i == null ? 0 : Math.min(rows.length - 1, i + 1)));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setLightboxIdx((i) => (i == null ? 0 : Math.max(0, i - 1)));
      }
    },
    [hasLightbox, rows.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyNav);
    return () => window.removeEventListener("keydown", onKeyNav);
  }, [onKeyNav]);

  return (
    <div className="p-6 space-y-6">
      <header className="mb-2">
        <h1 className="text-xl font-semibold">Overview — Organogram</h1>
        <div className="mt-2">
          <OverviewTabs />
        </div>
      </header>

      {/* Create / Upload */}
      <section className="rounded-2xl border p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Add image</div>
          <div className="text-xs text-neutral-500">JPG/PNG/WEBP • up to {MAX_IMAGE_MB}MB</div>
        </div>

        <div className="grid gap-3 md:grid-cols-[140px,1fr,120px]">
          {/* Position */}
          <input
            type="number"
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            placeholder="Position"
            value={position}
            onChange={(e) =>
              setPosition(e.target.value === "" ? "" : Number(e.target.value))
            }
            aria-label="Position"
          />

          {/* Dropzone */}
          <div
            className={[
              "rounded-lg border px-4 py-3 text-sm transition",
              "bg-white/70",
              dragOver ? "border-emerald-500/60 bg-emerald-50" : "hover:border-emerald-400/60",
              "flex items-center justify-between gap-4"
            ].join(" ")}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            role="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 overflow-hidden rounded-md border bg-white">
                {file ? (
                  <img
                    src={URL.createObjectURL(file)}
                    className="h-full w-full object-cover"
                    alt=""
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-100" />
                )}
              </div>
              <div className="text-neutral-700">
                {file ? (
                  <span className="font-medium">{file.name}</span>
                ) : (
                  <span className="text-neutral-500">
                    Drop an image here or <span className="underline">browse</span>
                  </span>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                const msg = validateFile(f);
                if (msg) return notifyError(msg);
                setFile(f);
              }}
              aria-label="Select image"
            />
          </div>

          {/* Create button */}
          <button
            onClick={onCreate}
            disabled={create.isPending}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-emerald-50 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
          >
            {create.isPending ? "Uploading…" : "Create"}
          </button>
        </div>
      </section>

      {/* Grid list */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Images</div>
          {query.isFetching && <span className="text-xs text-neutral-500">Refreshing…</span>}
        </div>

        {query.isLoading ? (
          <div className="rounded-2xl border p-6 text-sm text-neutral-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border p-6 text-sm text-neutral-500">
            No images yet. Add your first organogram image above.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((item, idx) => (
              <Card
                key={String(item.id)}
                item={item}
                index={idx}
                onOpen={() => openLightboxByIndex(idx)}
                onChangeImage={async (f) => {
                  const msg = validateFile(f);
                  if (msg) return notifyError(msg);
                  try {
                    await updateImage.mutateAsync({ organogram_id: item.id, image: f! });
                    notifySuccess("Image updated");
                  } catch (e) {
                    notifyError("Failed to update image", extractErrorMessage(e));
                  }
                }}
                onChangePos={async (pos) => {
                  try {
                    await updatePosition.mutateAsync({
                      organogram_id: item.id,
                      position: Number(pos || 0),
                    });
                    notifySuccess("Position updated");
                  } catch (e) {
                    notifyError("Failed to update position", extractErrorMessage(e));
                  }
                }}
                onDelete={async () => {
                  if (!confirm("Delete image?")) return;
                  try {
                    await remove.mutateAsync(item.id);
                    notifySuccess("Image deleted");
                  } catch (e) {
                    notifyError("Failed to delete image", extractErrorMessage(e));
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {hasLightbox && currentLightbox && (
        <dialog
          open
          className="backdrop:bg-black/50 rounded-2xl p-0 w-[min(96vw,1040px)]"
          onClose={closeLightbox}
        >
          <div className="relative">
            <div className="absolute left-0 right-0 top-0 z-10 mx-auto mt-3 w-[min(92%,720px)] rounded-xl border bg-white/95 px-3 py-2 text-center text-xs">
              Click the image (or use ← / →) to navigate. Press Esc to close.
            </div>

            <button
              onClick={closeLightbox}
              className="absolute right-3 top-3 z-10 rounded-md bg-white/95 px-2 py-1 text-xs border hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              aria-label="Close preview"
            >
              Close
            </button>

            <img
              src={resolveImageUrl(currentLightbox)}
              alt="Organogram large preview"
              className="mx-auto max-h-[82vh] w-auto object-contain rounded-2xl"
              loading="eager"
              onClick={() =>
                setLightboxIdx((i) => (i == null ? 0 : Math.min(rows.length - 1, i + 1)))
              }
            />

            {/* Prev / Next */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md border bg-white/85 px-2 py-1 text-xs hover:bg-emerald-50"
              onClick={() => setLightboxIdx((i) => (i == null ? 0 : Math.max(0, i - 1)))}
            >
              ← Prev
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border bg-white/85 px-2 py-1 text-xs hover:bg-emerald-50"
              onClick={() => setLightboxIdx((i) => (i == null ? 0 : Math.min(rows.length - 1, i + 1)))}
            >
              Next →
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}

/* --------------------------- Card (grid item) --------------------------- */

function Card({
  item,
  index,
  onOpen,
  onChangeImage,
  onChangePos,
  onDelete,
}: {
  item: Row;
  index: number;
  onOpen: () => void;
  onChangeImage: (file: File | null) => void;
  onChangePos: (pos: number | "") => void;
  onDelete: () => void;
}) {
  const [pos, setPos] = useState<number | "">(item.position);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPos(item.position);
  }, [item.position]);

  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 text-xs">
        <div className="inline-flex items-center gap-1">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="font-medium">#{String(item.id)}</span>
        </div>
        <div className="text-neutral-500">Pos</div>
      </div>

      {/* Image */}
      <div
        className="relative mx-3 overflow-hidden rounded-xl border bg-white"
        onClick={onOpen}
        role="button"
        title="Click to preview"
      >
        <SmartImage
          src={resolveImageUrl(item)}
          alt={`Organogram ${index + 1}`}
          className="h-[180px] w-full"
          imgClassName="object-contain"
          cacheBust
          maxRetries={1}
        />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2 p-3">
        <label className="col-span-1 inline-flex items-center rounded-lg border px-2 py-1 text-xs hover:bg-emerald-50 cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500/60">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onChangeImage(e.target.files?.[0] ?? null)}
          />
          Change image
        </label>

        <button
          onClick={onDelete}
          className="col-span-1 rounded-lg border px-2 py-1 text-xs text-red-600 hover:bg-red-50"
        >
          Delete
        </button>

        <div className="col-span-2 flex items-center justify-between rounded-lg border px-2 py-1">
          <input
            ref={inputRef}
            type="number"
            className="w-20 rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            value={pos}
            onChange={(e) =>
              setPos(e.target.value === "" ? "" : Number(e.target.value))
            }
            onBlur={() => onChangePos(pos)}
            aria-label="Position"
          />
          <button
            className="rounded-md border px-2 py-1 text-xs hover:bg-emerald-50"
            onClick={() => {
              inputRef.current?.blur();
              onChangePos(pos);
            }}
          >
            Save position
          </button>
        </div>
      </div>
    </div>
  );
}
