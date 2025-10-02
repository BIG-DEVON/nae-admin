// src/features/overview/pages/Organogram.tsx
import { useMemo, useState } from "react";
import OverviewTabs from "@/features/overview/components/OverviewTabs";
import { useOverviewOrganogram } from "../hooks/useOverview";

type Row = { id: number | string; position: number; image_url?: string };

export default function Organogram() {
  const { query, create, updateImage, updatePosition, remove } = useOverviewOrganogram();

  const rows = useMemo<Row[]>(
    () => (Array.isArray(query.data) ? (query.data as Row[]) : []),
    [query.data]
  );

  // safer next position without using .at()
  const lastPos = rows.length ? rows[rows.length - 1].position : 0;

  const [position, setPosition] = useState<number | "">(lastPos + 1);
  const [file, setFile] = useState<File | null>(null);

  const onCreate = async () => {
    if (!file) return alert("Pick an image");
    await create.mutateAsync({ position: Number(position || 0), image: file });
    setFile(null);
    const newLast = rows.length ? rows[rows.length - 1].position : 0;
    setPosition(newLast + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">Overview — Organogram</h1>
        <div className="mt-2">
          {/* Tabs auto-detect the active route */}
          <OverviewTabs />
        </div>
      </header>

      {/* Create */}
      <section className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-medium">Add image</div>
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="number"
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <input
            type="file"
            accept="image/*"
            className="rounded-lg border px-3 py-2 text-sm"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={onCreate}
            disabled={create.isPending}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
          >
            {create.isPending ? "Uploading…" : "Create"}
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
              <th>Position</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {query.isLoading && (
              <tr>
                <td className="px-3 py-3" colSpan={4}>Loading…</td>
              </tr>
            )}

            {!query.isLoading &&
              rows.map((r) => (
                <Row
                  key={String(r.id)}
                  item={r}
                  onChangeImage={async (f) => {
                    if (!f) return;
                    await updateImage.mutateAsync({ organogram_id: r.id, image: f });
                  }}
                  onChangePos={async (pos) => {
                    await updatePosition.mutateAsync({
                      organogram_id: r.id,
                      position: Number(pos || 0),
                    });
                  }}
                  onDelete={async () => {
                    if (!confirm("Delete image?")) return;
                    await remove.mutateAsync(r.id);
                  }}
                />
              ))}

            {!query.isLoading && rows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-neutral-500" colSpan={4}>
                  No images yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Row({
  item,
  onChangeImage,
  onChangePos,
  onDelete,
}: {
  item: Row;
  onChangeImage: (file: File | null) => void;
  onChangePos: (pos: number | "") => void;
  onDelete: () => void;
}) {
  const [pos, setPos] = useState<number | "">(item.position);

  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t align-top">
      <td className="whitespace-nowrap">{String(item.id)}</td>
      <td>
        {item.image_url ? (
          <img src={item.image_url} alt="" className="h-16 w-auto rounded-md border bg-white" />
        ) : (
          <span className="text-neutral-500">No image</span>
        )}
      </td>
      <td className="w-28">
        <input
          type="number"
          className="rounded-lg border px-2 py-1 w-24"
          value={pos}
          onChange={(e) => setPos(e.target.value === "" ? "" : Number(e.target.value))}
          onBlur={() => onChangePos(pos)}
        />
      </td>
      <td className="text-right space-x-2">
        <label className="rounded-lg border px-2 py-1 hover:bg-neutral-50 cursor-pointer">
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
          className="rounded-lg border px-2 py-1 text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
