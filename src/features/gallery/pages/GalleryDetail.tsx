// src/features/gallery/pages/GalleryDetail.tsx
import { Link, useSearchParams } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { useGalleryContents } from "../hooks/useGalleryContents";
import { useGalleryMutations } from "../hooks/useGalleryMutations";
import type { ID } from "../types";
import { notifySuccess, notifyError, extractErrorMessage } from "@/lib/notify";

type ContentRow = {
  id: ID;
  gallery_id: ID;
  title: string;
  position: number;
  image_url?: string;
};

export default function GalleryDetail() {
  const [sp] = useSearchParams();
  const galleryId = sp.get("id");

  const { data, isLoading, isError, isFetching, refetch } = useGalleryContents(galleryId);

  const {
    createGalleryContent: createMut,
    editGalleryContent: editMut,
    editGalleryContentImage: editImgMut,
    deleteGalleryContent: delMut,
  } = useGalleryMutations();

  // ---------- Create form ----------
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState<number | "">("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const rows = useMemo<ContentRow[]>(
    () => (Array.isArray(data) ? (data as ContentRow[]) : []),
    [data]
  );

  if (!galleryId) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-red-600">Missing required query param: <code>id</code></p>
        <Link to="/gallery" className="inline-flex rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">
          ← Back to Galleries
        </Link>
      </div>
    );
  }

  // ---------- Handlers ----------
  const onCreate = async () => {
    const t = title.trim();
    const p = Number(position || 0);
    const file = fileRef.current?.files?.[0];

    if (!t) return notifyError("Title is required.");
    if (!file) return notifyError("Please choose an image.");

    try {
      await createMut.mutateAsync({
        gallery_id: galleryId as ID,
        image: file,
        title: t,
        position: p,
      });
      notifySuccess("Content created.");
      setTitle("");
      setPosition("");
      if (fileRef.current) fileRef.current.value = "";
      refetch();
    } catch (err) {
      notifyError("Failed to create", extractErrorMessage(err, "Could not create content."));
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
      notifyError("Failed to update", extractErrorMessage(err, "Could not update content."));
    }
  };

  const onEditImage = async (contentId: ID, file: File | null | undefined) => {
    if (!file) return;
    try {
      await editImgMut.mutateAsync({ content_id: contentId, image: file });
      notifySuccess("Image updated.");
      refetch();
    } catch (err) {
      notifyError("Failed to update image", extractErrorMessage(err, "Could not update image."));
    }
  };

  const onDelete = async (contentId: ID) => {
    if (!confirm("Delete this content item?")) return;
    try {
      await delMut.mutateAsync({ content_id: contentId });
      notifySuccess("Content deleted.");
      refetch();
    } catch (err) {
      notifyError("Failed to delete", extractErrorMessage(err, "Could not delete content."));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/gallery"
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            ← Back
          </Link>
          <h1 className="text-xl font-semibold">Gallery Contents</h1>
        </div>
        <div className="text-sm text-neutral-500">
          Gallery ID: <span className="font-medium">{galleryId}</span>
          {isFetching && <span className="ml-3">Refreshing…</span>}
        </div>
      </header>

      {/* Create */}
      <section className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-medium">Create content</div>
        <div className="grid gap-3 md:grid-cols-4">
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Content title"
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Position"
            type="number"
            value={position}
            onChange={(e) => setPosition(e.target.value === "" ? "" : Number(e.target.value))}
            aria-label="Content position"
          />
          <input
            ref={fileRef}
            className="rounded-lg border px-3 py-2 text-sm"
            type="file"
            accept="image/*"
            aria-label="Content image"
          />
          <button
            onClick={onCreate}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
            disabled={createMut.isPending}
          >
            {createMut.isPending ? "Creating…" : "Create"}
          </button>
        </div>
      </section>

      {/* List */}
      <section className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>ID</th>
              <th>Preview</th>
              <th>Title</th>
              <th>Position</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-3 py-3 text-neutral-500" colSpan={5}>
                  Loading…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td className="px-3 py-3 text-red-600" colSpan={5}>
                  Failed to load.
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-neutral-500" colSpan={5}>
                  No contents yet.
                </td>
              </tr>
            )}

            {rows.map((c) => (
              <ContentRow
                key={String(c.id)}
                item={c}
                onEdit={(patch) =>
                  onEdit({ content_id: c.id, gallery_id: c.gallery_id, ...patch })
                }
                onEditImage={(file) => onEditImage(c.id, file)}
                onDelete={() => onDelete(c.id)}
              />
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function ContentRow({
  item,
  onEdit,
  onEditImage,
  onDelete,
}: {
  item: ContentRow;
  onEdit: (patch: { title?: string; position?: number }) => void;
  onEditImage: (file: File | null | undefined) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [position, setPosition] = useState<number | "">(item.position ?? "");

  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t align-top">
      <td className="whitespace-nowrap">{String(item.id)}</td>

      <td>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt=""
            className="h-14 w-14 object-cover rounded-md border bg-white"
          />
        ) : (
          <span className="text-neutral-500">No image</span>
        )}
      </td>

      <td className="w-56">
        <input
          className="rounded-lg border px-2 py-1 text-sm w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </td>

      <td className="w-28">
        <input
          className="rounded-lg border px-2 py-1 text-sm w-24"
          type="number"
          value={position}
          onChange={(e) =>
            setPosition(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      </td>

      <td className="text-right whitespace-nowrap space-x-2">
        <button
          onClick={() => onEdit({ title: title.trim(), position: Number(position || 0) })}
          className="rounded-lg border px-2 py-1 hover:bg-neutral-50"
        >
          Save
        </button>

        <label className="rounded-lg border px-2 py-1 hover:bg-neutral-50 cursor-pointer">
          <input
            className="hidden"
            type="file"
            accept="image/*"
            onChange={(e) => onEditImage(e.target.files?.[0])}
          />
          Change image
        </label>

        <button
          onClick={onDelete}
          className="rounded-lg border px-2 py-1 hover:bg-red-50 text-red-600"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
