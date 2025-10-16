// src/features/gallery/pages/GalleryHome.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useGalleryHome } from "../hooks/useGalleryHome";
import type { HomeGallery, ID } from "../types";
import { notifySuccess, notifyError, extractErrorMessage } from "@/lib/notify";
import SmartImage from "@/components/ui/SmartImage";

/* ----------------------------------------------------------------------------
   URL resolver (accepts ANY input shape; no index signature required)
---------------------------------------------------------------------------- */
const RAW_BASE =
  (import.meta.env.VITE_ASSET_BASE as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "";

const ASSET_BASE = (RAW_BASE || "").replace(/\/+$/, "");

function resolveImageUrl(input: unknown): string | undefined {
  try {
    if (!input) return undefined;

    if (typeof input === "string") {
      const raw = input.trim();
      if (!raw) return undefined;
      if (/^(https?:)?\/\//i.test(raw) || /^data:image\//i.test(raw)) return raw;
      if (raw.startsWith("/")) return ASSET_BASE ? `${ASSET_BASE}${raw}` : raw;
      return ASSET_BASE ? `${ASSET_BASE}/${raw}` : `/${raw}`;
    }

    if (typeof input === "object") {
      const obj = input as Record<string, unknown>;
      const cand =
        obj.image_url ??
        (obj as any).imageUrl ??
        (obj as any).image ??
        (obj as any).url ??
        (obj as any).path ??
        "";
      return resolveImageUrl(String(cand || ""));
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/* ----------------------------------------------------------------------------
   Create / Edit state
---------------------------------------------------------------------------- */
type CreateState = {
  name: string;
  title: string;
  position: number | "";
  image: File | null;
  previewUrl: string | null;
};

type EditState = {
  id: HomeGallery["id"] | null;
  name: string;
  title: string;
  position: number | "";
};

export default function GalleryHome() {
  const { list, create, update, updateImage, remove } = useGalleryHome();

  const items = useMemo<HomeGallery[]>(
    () => (Array.isArray(list.data) ? list.data : []),
    [list.data]
  );

  /* ------------------------------------------------------------------------ */
  /* UX helpers: search + sort                                                */
  /* ------------------------------------------------------------------------ */
  const [query, setQuery] = useState("");
  const [asc, setAsc] = useState(true);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let src = items;
    if (q) {
      src = items.filter(
        (r) =>
          (r.name ?? "").toLowerCase().includes(q) ||
          (r.title ?? "").toLowerCase().includes(q)
      );
    }
    const arr = [...src];
    arr.sort((a, b) => {
      const pa = (a as any).position ?? 0;
      const pb = (b as any).position ?? 0;
      return asc ? pa - pb : pb - pa;
    });
    return arr;
  }, [items, query, asc]);

  /* ------------------------------------------------------------------------ */
  /* Create form                                                              */
  /* ------------------------------------------------------------------------ */
  const [c, setC] = useState<CreateState>({
    name: "",
    title: "",
    position: "",
    image: null,
    previewUrl: null,
  });
  const createInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!c.image) {
      if (c.previewUrl) URL.revokeObjectURL(c.previewUrl);
      setC((s) => (s.previewUrl ? { ...s, previewUrl: null } : s));
      return;
    }
    const url = URL.createObjectURL(c.image);
    setC((s) => ({ ...s, previewUrl: url }));
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.image]);

  const onCreate = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const name = c.name.trim();
    const title = c.title.trim();
    const position = c.position === "" ? "" : Number(c.position);

    if (!c.image || c.position === "") {
      notifyError("Please choose an image and a position.");
      return;
    }

    try {
      await create.mutateAsync({
        type: "create", // ✅ required by your types
        name,
        title,
        position: Number(position),
        image: c.image,
      });
      notifySuccess("Banner created.");
      setC({ name: "", title: "", position: "", image: null, previewUrl: null });
      if (createInputRef.current) createInputRef.current.value = "";
    } catch (err) {
      notifyError("Failed to create banner", extractErrorMessage(err));
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Edit drawer                                                              */
  /* ------------------------------------------------------------------------ */
  const [e, setE] = useState<EditState>({
    id: null,
    name: "",
    title: "",
    position: "",
  });

  useEffect(() => {
    if (e.id == null) return;
    const row = items.find((r) => String(r.id) === String(e.id));
    if (!row) return;
    setE({
      id: row.id,
      name: row.name ?? "",
      title: row.title ?? "",
      position: (row as any).position ?? "",
    });
  }, [e.id, items]);

  const onUpdate = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (e.id == null) return;
    try {
      await update.mutateAsync({
        id: e.id,
        name: e.name.trim() || undefined,
        title: e.title.trim() || undefined,
        position: e.position === "" ? undefined : Number(e.position),
      });
      notifySuccess("Banner updated.");
    } catch (err) {
      notifyError("Failed to update banner", extractErrorMessage(err));
    }
  };

  const onUpdateImage = async (id: HomeGallery["id"], file: File | null) => {
    if (!file) return;
    try {
      await updateImage.mutateAsync({ type: "edit-image", id, image: file }); // ✅ required by your types
      notifySuccess("Image updated.");
    } catch (err) {
      notifyError("Failed to update image", extractErrorMessage(err));
    }
  };

  const onDelete = async (id: HomeGallery["id"]) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await remove.mutateAsync(id);
      notifySuccess("Banner deleted.");
      if (String(e.id) === String(id)) {
        setE({ id: null, name: "", title: "", position: "" });
      }
    } catch (err) {
      notifyError("Failed to delete banner", extractErrorMessage(err));
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Lightbox                                                                 */
  /* ------------------------------------------------------------------------ */
  const [lightbox, setLightbox] = useState<string | null>(null);
  const openLightbox = useCallback((u?: string) => u && setLightbox(u), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  /* ------------------------------------------------------------------------ */
  /* UI                                                                        */
  /* ------------------------------------------------------------------------ */
  return (
    <div className="p-6 space-y-8">
      {/* Header / Tools */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {/* BACK BUTTON */}
          <Link
            to="/gallery"
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Home Gallery (Banners)
          </h1>
          {list.isFetching && (
            <span className="ml-2 text-xs rounded-full px-2 py-1 border inline-block text-neutral-600">
              Refreshing…
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            className="rounded-full border px-3 py-1.5 text-sm w-56"
            placeholder="Search banners…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={() => setAsc((s) => !s)}
            className="rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50"
            title="Toggle sort by position"
          >
            Sort: {asc ? "Asc" : "Desc"}
          </button>
        </div>
      </header>

      {/* Create */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="font-medium mb-3">Create banner</h2>
        <form className="grid grid-cols-1 gap-3 md:grid-cols-6" onSubmit={onCreate}>
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Name"
            value={c.name}
            onChange={(e) => setC((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            className="md:col-span-2 rounded-lg border px-3 py-2 text-sm"
            placeholder="Title"
            value={c.title}
            onChange={(e) => setC((s) => ({ ...s, title: e.target.value }))}
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Position"
            type="number"
            value={c.position}
            onChange={(e) =>
              setC((s) => ({
                ...s,
                position: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
          />
          <label className="rounded-lg border px-3 py-2 text-sm cursor-pointer hover:bg-neutral-50 flex items-center gap-2">
            <input
              ref={createInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setC((s) => ({ ...s, image: e.target.files?.[0] ?? null }))}
            />
            Choose file
          </label>
          <button
            type="submit"
            disabled={create.isPending}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-60 hover:bg-emerald-50"
          >
            {create.isPending ? "Creating…" : "Create"}
          </button>

          {/* Live preview row */}
          <div className="md:col-span-6 flex items-center gap-3">
            <div className="h-16 w-28">
              <SmartImage
                src={c.previewUrl ?? undefined}
                alt="New banner preview"
                className="h-16 w-28"
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
              type="button"
              onClick={() => {
                setC((s) => ({ ...s, image: null, previewUrl: null }));
                if (createInputRef.current) createInputRef.current.value = "";
              }}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
              disabled={!c.image}
            >
              Clear file
            </button>
          </div>
        </form>
      </section>

      {/* Grid of banners (cards equal height via fixed header image) */}
      <section>
        {list.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-60 rounded-2xl border bg-neutral-50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border p-10 text-center text-neutral-600 bg-white">
            No banners yet.
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((row) => (
              <li key={String(row.id)} className="h-full">
                <BannerCard
                  row={row}
                  onOpenLightbox={() => {
                    const u = resolveImageUrl(row);
                    if (u) openLightbox(u);
                  }}
                  onEdit={() =>
                    setE({
                      id: row.id,
                      name: row.name ?? "",
                      title: row.title ?? "",
                      position: (row as any).position ?? "",
                    })
                  }
                  onEditImage={(file) => onUpdateImage(row.id, file ?? null)}
                  onDelete={() => onDelete(row.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Edit drawer */}
      {e.id != null && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setE({ id: null, name: "", title: "", position: "" })}
          />
          <aside className="absolute right-0 top-0 h-full w-[min(520px,100vw)] bg-white shadow-2xl p-5 overflow-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">
                Edit banner <span className="text-neutral-500">#{String(e.id)}</span>
              </h2>
              <button
                className="rounded-md border px-2 py-1 text-sm hover:bg-neutral-50"
                onClick={() => setE({ id: null, name: "", title: "", position: "" })}
              >
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-3" onSubmit={onUpdate}>
              <label className="grid gap-1">
                <span className="text-sm font-medium">Name</span>
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  value={e.name}
                  onChange={(ev) => setE((s) => ({ ...s, name: ev.target.value }))}
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Title</span>
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  value={e.title}
                  onChange={(ev) => setE((s) => ({ ...s, title: ev.target.value }))}
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Position</span>
                <input
                  className="rounded-lg border px-3 py-2 text-sm"
                  type="number"
                  value={e.position}
                  onChange={(ev) =>
                    setE((s) => ({
                      ...s,
                      position: ev.target.value === "" ? "" : Number(ev.target.value),
                    }))
                  }
                />
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={update.isPending}
                  className="rounded-lg border px-3 py-2 text-sm disabled:opacity-60 hover:bg-emerald-50"
                >
                  {update.isPending ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
          onClick={closeLightbox}
          onKeyDown={(e) => e.key === "Escape" && closeLightbox()}
          tabIndex={-1}
        >
          <div
            className="relative max-h-[90vh] max-w-[min(92vw,1400px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox}
              alt="Banner preview"
              className="max-h-[90vh] w-auto rounded-xl shadow-2xl"
            />
            <button
              type="button"
              onClick={closeLightbox}
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

/* ----------------------------------------------------------------------------
   Card component — equal height via fixed header image
---------------------------------------------------------------------------- */
function BannerCard({
  row,
  onOpenLightbox,
  onEdit,
  onEditImage,
  onDelete,
}: {
  row: HomeGallery;
  onOpenLightbox: () => void;
  onEdit: () => void;
  onEditImage: (file: File | null) => void;
  onDelete: () => void;
}) {
  const url = resolveImageUrl(row);

  return (
    <div
      className="
        group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white
        shadow-[0_1px_0_rgba(0,0,0,0.02),0_12px_32px_-16px_rgba(16,185,129,0.25)]
        transition hover:shadow-[0_1px_0_rgba(0,0,0,0.02),0_22px_44px_-18px_rgba(16,185,129,0.35)]
      "
    >
      {/* Fixed-height header image for perfect alignment */}
      <button
        type="button"
        className="relative block h-44 w-full"
        onClick={onOpenLightbox}
        title={url ? "Click to preview" : "No image"}
      >
        <SmartImage
          src={url}
          alt={row.title || row.name || ""}
          className="h-44 w-full"
          imgClassName="object-cover"
          cacheBust
          maxRetries={1}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs shadow">
          Pos {(row as any).position ?? "—"}
        </span>
      </button>

      {/* Body grows to fill, actions stick to bottom */}
      <div className="flex flex-1 flex-col p-4">
        <div className="min-w-0">
          <div className="font-medium truncate">{row.name || "—"}</div>
          <div className="mt-1 text-sm text-neutral-700 line-clamp-2">
            {row.title || "—"}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="rounded-lg border px-2 py-1 text-xs hover:bg-emerald-50 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(ev) => onEditImage(ev.target.files?.[0] ?? null)}
            />
            Change image
          </label>

          <button
            onClick={onEdit}
            className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50"
          >
            Edit details
          </button>

          <button
            onClick={onDelete}
            className="ml-auto rounded-lg border px-2 py-1 text-xs hover:bg-red-50 text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <span
        className="
          pointer-events-none absolute inset-x-0 bottom-0 h-1
          scale-x-0 bg-emerald-500 transition-transform duration-300
          group-hover:scale-x-100
        "
      />
    </div>
  );
}
