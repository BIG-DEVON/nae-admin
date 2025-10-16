// src/features/gallery/pages/GalleryList.tsx
import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGalleries } from "../hooks/useGalleries";
import { useGalleryMutations } from "../hooks/useGalleryMutations";
import type { ID } from "../types";
import { notifySuccess, notifyError, extractErrorMessage } from "@/lib/notify";
import SmartImage from "@/components/ui/SmartImage";
import { cn } from "@/utils/cn";

/* --------------------------------- helpers -------------------------------- */

// normalize helper for [], {data:[]}, {results:[]}, {items:[]}
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

/** Tiny deep getter: getDeep(obj, "cover.url") or "media[0].url" */
function getDeep(obj: any, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  const parts = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p as keyof typeof cur];
  }
  return cur;
}

/** Decide a base to prefix relative asset paths */
const RAW_BASE =
  (import.meta.env.VITE_ASSET_BASE as string | undefined) ||
  (import.meta.env.VITE_FILE_BASE_URL as string | undefined) ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "";

const ASSET_BASE = (RAW_BASE || "").replace(/\/+$/, "");

/** Normalize URL to absolute if needed */
function toAbsUrl(val?: string | null): string | undefined {
  if (!val || typeof val !== "string") return undefined;
  const v = val.trim();
  if (!v) return undefined;

  // already absolute or data URL
  if (/^(https?:)?\/\//i.test(v) || /^data:image\//i.test(v)) return v;

  // root-relative
  if (v.startsWith("/")) {
    return ASSET_BASE ? `${ASSET_BASE}${v}` : v;
  }

  // bare relative like "uploads/xyz.jpg"
  return ASSET_BASE ? `${ASSET_BASE}/${v.replace(/^\/+/, "")}` : `/${v.replace(/^\/+/, "")}`;
}

/** Try *hard* to resolve a cover image URL from common field names & shapes on the gallery row */
function resolveCoverUrlFromRow(raw: any): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  // Flat keys
  const flatKeys = [
    "cover_url",
    "coverUrl",
    "cover",
    "thumbnail_url",
    "thumbnail",
    "thumb_url",
    "thumb",
    "banner_url",
    "bannerUrl",
    "image_url",
    "imageUrl",
    "image",
    "photo_url",
    "photo",
    "path",
    "url",
  ];
  for (const k of flatKeys) {
    const v = (raw as any)[k];
    const u = toAbsUrl(typeof v === "string" ? v : undefined);
    if (u) return u;
  }

  // Nested shapes
  const nestedPaths = [
    "cover.url",
    "image.url",
    "photo.url",
    "banner.url",
    "thumbnail.url",
    "media[0].url",
    "images[0].url",
    "files[0].url",
    "assets[0].url",
    "cover.data.url",
    "image.data.url",
    "photo.data.url",
  ];
  for (const p of nestedPaths) {
    const v = getDeep(raw, p);
    const u = toAbsUrl(typeof v === "string" ? v : undefined);
    if (u) return u;
  }

  // Nested objects with path/src
  const nestedObjects = ["cover", "image", "photo", "banner", "thumbnail"];
  for (const k of nestedObjects) {
    const o = (raw as any)[k];
    if (o && typeof o === "object") {
      for (const kk of ["path", "src"]) {
        const u = toAbsUrl(typeof o[kk] === "string" ? o[kk] : undefined);
        if (u) return u;
      }
    }
  }

  return undefined;
}

/** Try to resolve an image URL from a gallery-item payload (for derived covers) */
function resolveUrlFromItem(it: any): string | undefined {
  if (typeof it === "string") return toAbsUrl(it);

  const flat = ["url", "image_url", "image", "photo_url", "photo", "path", "src", "file"];
  for (const k of flat) {
    const v = (it || {})[k];
    const u = toAbsUrl(typeof v === "string" ? v : undefined);
    if (u) return u;
  }

  const nested = [
    "file.url",
    "asset.url",
    "media[0].url",
    "images[0].url",
    "data.url",
    "image.url",
    "photo.url",
  ];
  for (const p of nested) {
    const v = getDeep(it, p);
    const u = toAbsUrl(typeof v === "string" ? v : undefined);
    if (u) return u;
  }

  return undefined;
}

/** endpoints to try for gallery contents (first hit wins) */
const CONTENT_PATHS = (
  (import.meta.env.VITE_GALLERY_CONTENTS_PATH as string | undefined)?.split(",") ?? [
    "/gallery/{id}/contents/",
    "/galleries/{id}/contents/",
    "/gallery/{id}/items/",
    "/galleries/{id}/items/",
    "/gallery/{id}/media/",
    "/galleries/{id}/media/",
  ]
).map((s) => s.trim()).filter(Boolean);

/** Fetch a derived cover for a gallery id by trying multiple endpoints */
async function fetchDerivedCover(galleryId: ID, signal?: AbortSignal): Promise<string | undefined> {
  const base = (import.meta.env.VITE_API_BASE_URL || "").toString().replace(/\/+$/, "");
  const token = (import.meta.env.VITE_API_TOKEN || localStorage.getItem("token") || "").trim();

  for (const tmpl of CONTENT_PATHS) {
    const url = `${base}${tmpl.replace("{id}", String(galleryId))}`;
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: "include",
        signal,
      });
      if (!res.ok) continue;
      const json = await res.json();
      const arr = toArray<any>(json);
      if (arr.length === 0) continue;

      // Pick first item that looks like an image
      for (const it of arr) {
        const u = resolveUrlFromItem(it);
        if (u) return u;
      }
    } catch {
      /* try next endpoint */
    }
  }

  return undefined;
}

type Row = { id: number | string; title: string; position: number } & Record<string, unknown>;

/* ---------------------------------- page ---------------------------------- */
export default function GalleryList() {
  const { data, isLoading, isError, isFetching, refetch } = useGalleries();
  const { createGallery, editGallery, deleteGallery } = useGalleryMutations();

  const rows = useMemo(() => {
    const list = toArray<Row>(data);
    return [...list].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [data]);

  // --------- Create form ---------
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState<number | "">("");

  // suggest next position after load/refetch
  useEffect(() => {
    const last = rows.length ? rows[rows.length - 1].position ?? 0 : 0;
    setPosition((prev) => (prev === "" ? "" : last + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  const onCreate = async () => {
    const t = title.trim();
    const p = position === "" ? 0 : Number(position);
    if (!t) {
      notifyError("Title is required");
      return;
    }
    try {
      await createGallery.mutateAsync({ title: t, position: p });
      notifySuccess("Gallery created");
      setTitle("");
      const last = rows.length ? rows[rows.length - 1].position ?? 0 : 0;
      setPosition(last + 1);
      refetch?.();
    } catch (err) {
      notifyError("Failed to create gallery", extractErrorMessage(err));
    }
  };

  // --------- Search / Sort UI ---------
  const [q, setQ] = useState("");
  const [asc, setAsc] = useState(true);

  const filtered = useMemo(() => {
    const qx = q.trim().toLowerCase();
    let list = rows;
    if (qx) {
      list = rows.filter((g) => g.title?.toLowerCase().includes(qx));
    }
    return [...list].sort((a, b) => (asc ? 1 : -1) * ((a.position ?? 0) - (b.position ?? 0)));
  }, [rows, q, asc]);

  // --------- Derived covers ---------
  const [coverMap, setCoverMap] = useState<Record<string, string | undefined>>({});
  const coversAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    // build list of ids that still need covers
    const need: Row[] = [];
    for (const g of filtered) {
      const rowCover = resolveCoverUrlFromRow(g);
      // if row already has cover, store it; else mark to fetch derived
      if (rowCover) {
        if (coverMap[String(g.id)] !== rowCover) {
          setCoverMap((m) => ({ ...m, [String(g.id)]: rowCover }));
        }
      } else if (coverMap[String(g.id)] == null) {
        need.push(g);
      }
    }
    if (need.length === 0) return;

    // abort previous batch
    coversAbort.current?.abort();
    const ac = new AbortController();
    coversAbort.current = ac;

    (async () => {
      const entries = await Promise.allSettled(
        need.map(async (g) => {
          const u = await fetchDerivedCover(g.id as ID, ac.signal);
          return [String(g.id), u] as const;
        })
      );

      const patch: Record<string, string | undefined> = {};
      for (const r of entries) {
        if (r.status === "fulfilled") {
          const [id, url] = r.value;
          patch[id] = url;
        }
      }
      setCoverMap((m) => ({ ...m, ...patch }));
    })();

    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.map((g) => g.id).join("|")]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Galleries</h1>
          <p className="text-sm text-neutral-600">Create, manage and curate your gallery albums.</p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && (
            <span className="text-xs rounded-full px-2 py-1 border text-neutral-600">
              Refreshing…
            </span>
          )}
          <Link
            to="/gallery/home"
            className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50"
          >
            Manage Home Gallery
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-neutral-600 mb-1">Search</label>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Find a gallery by title…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Sort</label>
            <button
              onClick={() => setAsc((s) => !s)}
              className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-emerald-50"
              title="Toggle sort by position"
            >
              Position: {asc ? "Ascending" : "Descending"}
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Quick actions</label>
            <button
              onClick={() => refetch?.()}
              className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
            >
              Refresh list
            </button>
          </div>
        </div>
      </section>

      {/* Create */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-medium">Create gallery</div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Position"
            type="number"
            value={position}
            onChange={(e) => setPosition(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <button
            onClick={onCreate}
            disabled={createGallery.isPending}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-emerald-50 disabled:opacity-60"
          >
            {createGallery.isPending ? "Creating…" : "Create"}
          </button>
        </div>
      </section>

      {/* List as gorgeous cards */}
      <section className="space-y-3">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl border bg-white shadow-sm animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm text-sm text-red-600">
            Failed to load galleries.
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm text-sm text-neutral-600">
            No galleries yet.
          </div>
        )}

        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g) => {
            const rowCover = resolveCoverUrlFromRow(g);
            const derived = coverMap[String(g.id)];
            const coverUrl = rowCover ?? derived;

            return (
              <li key={String(g.id)}>
                <GalleryCard
                  item={g}
                  coverUrl={coverUrl}
                  coverLoading={!rowCover && derived === undefined} // still fetching derived
                  onSave={async (patch) => {
                    try {
                      await editGallery.mutateAsync({ gallery_id: g.id, ...patch });
                      notifySuccess("Gallery updated");
                      refetch?.();
                    } catch (err) {
                      notifyError("Failed to update gallery", extractErrorMessage(err));
                    }
                  }}
                  onDelete={async () => {
                    if (!confirm("Delete gallery?")) return;
                    try {
                      await deleteGallery.mutateAsync(g.id as ID);
                      notifySuccess("Gallery deleted");
                      refetch?.();
                    } catch (err) {
                      notifyError("Failed to delete gallery", extractErrorMessage(err));
                    }
                  }}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

/* ========================================================================== */
/* Card                                                                       */
/* ========================================================================== */

function GalleryCard({
  item,
  coverUrl,
  coverLoading,
  onSave,
  onDelete,
}: {
  item: Row;
  coverUrl?: string;
  coverLoading?: boolean;
  onSave: (patch: { title?: string; position?: number }) => void;
  onDelete: () => void;
}) {
  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [pos, setPos] = useState<number | "">(item.position);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white",
        "shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_4px_16px_-8px_rgba(0,0,0,0.12)]",
        "transition hover:shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_18px_34px_-12px_rgba(16,185,129,0.35)]"
      )}
    >
      {/* media */}
      <div className="relative h-40 w-full">
        {coverLoading ? (
          <div className="h-40 w-full animate-pulse bg-neutral-100" />
        ) : (
          <SmartImage
            src={coverUrl}
            alt={item.title}
            className="h-40 w-full"
            imgClassName="object-cover"
            cacheBust
            maxRetries={1}
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-neutral-50">
                <div className="text-xs text-neutral-500">No cover</div>
              </div>
            }
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-emerald-400/0 group-hover:ring-4 group-hover:ring-emerald-400/30 transition" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs shadow ring-1 ring-black/10">
          Pos {item.position}
        </span>
      </div>

      {/* content */}
      <div className="p-4">
        {edit ? (
          <input
            className="mb-2 w-full rounded-lg border px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
        ) : (
          <h3 className="line-clamp-2 font-medium">{item.title || "Untitled gallery"}</h3>
        )}

        {/* actions */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            to={`/gallery/detail?id=${item.id}`}
            className="rounded-full border px-3 py-1.5 text-sm hover:bg-emerald-50"
          >
            Manage contents
          </Link>

          {edit ? (
            <>
              <input
                className="w-24 rounded-lg border px-2 py-1 text-sm"
                type="number"
                value={pos}
                onChange={(e) => setPos(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Position"
              />
              <button
                onClick={() => {
                  onSave({ title: title.trim(), position: Number(pos || 0) });
                  setEdit(false);
                }}
                className="rounded-lg border px-2 py-1 text-sm hover:bg-emerald-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTitle(item.title);
                  setPos(item.position);
                  setEdit(false);
                }}
                className="rounded-lg border px-2 py-1 text-sm hover:bg-neutral-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEdit(true)}
                className="rounded-lg border px-2 py-1 text-sm hover:bg-neutral-50"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="rounded-lg border px-2 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
