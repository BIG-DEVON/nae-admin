// src/features/gallery/pages/GalleryList.tsx
import { Link } from "react-router-dom";
import { useState } from "react";
import { useGalleries } from "../hooks/useGalleries";
import { useGalleryMutations } from "../hooks/useGalleryMutations";
import type { ID } from "../types";

type Row = { id: number | string; title: string; position: number };

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

export default function GalleryList() {
  const { data, isLoading, isError } = useGalleries();
  const { createGallery, editGallery, deleteGallery } = useGalleryMutations();

  const rows = toArray<Row>(data);

  // create form
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState<number | "">("");

  const onCreate = async () => {
    if (!title) return alert("Title required");
    await createGallery.mutateAsync({ title, position: Number(position || 0) });
    setTitle("");
    setPosition("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Galleries</h1>
        <Link
          to="/gallery/home"
          className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm"
        >
          Manage Home Gallery
        </Link>
      </div>

      {/* Create */}
      <section className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-medium">Create gallery</div>
        <div className="grid gap-3 md:grid-cols-3">
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
            onChange={(e) =>
              setPosition(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
          <button
            onClick={onCreate}
            disabled={createGallery.isPending}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
          >
            {createGallery.isPending ? "Creating…" : "Create"}
          </button>
        </div>
      </section>

      {/* List */}
      <section className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/60">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>ID</th>
              <th>Title</th>
              <th>Position</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="px-3 py-3" colSpan={4}>
                  Loading…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td className="px-3 py-3 text-red-600" colSpan={4}>
                  Failed to load.
                </td>
              </tr>
            )}
            {rows.map((g) => (
              <Row
                key={String(g.id)}
                item={g}
                onSave={async (patch) => {
                  await editGallery.mutateAsync({ gallery_id: g.id, ...patch });
                }}
                onDelete={async () => {
                  if (!confirm("Delete gallery?")) return;
                  await deleteGallery.mutateAsync(g.id as ID); // <-- pass raw ID
                }}
              />
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Row({
  item,
  onSave,
  onDelete,
}: {
  item: Row;
  onSave: (patch: { title?: string; position?: number }) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [position, setPosition] = useState<number | "">(item.position);

  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t">
      <td className="whitespace-nowrap">{String(item.id)}</td>
      <td>
        <input
          className="rounded-lg border px-2 py-1 text-sm w-64"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </td>
      <td>
        <input
          className="rounded-lg border px-2 py-1 text-sm w-24"
          type="number"
          value={position}
          onChange={(e) =>
            setPosition(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      </td>
      <td className="space-x-2">
        <button
          onClick={() => onSave({ title, position: Number(position || 0) })}
          className="rounded-lg border px-2 py-1 hover:bg-zinc-50"
        >
          Save
        </button>
        <Link
          to={`/gallery/detail?id=${item.id}`}
          className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm"
        >
          Manage contents
        </Link>
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
