// src/features/overview/pages/Commanders.tsx
import { useMemo, useState } from "react";
import OverviewTabs from "@/features/overview/components/OverviewTabs";
import { useOverviewCommanders } from "../hooks/useOverview";

type Row = {
  id: number | string;
  title: string;
  content?: string;
  position: number;
  image_url?: string;
};

// Normalize API shapes: [], {data:[]}, {results:[]}, {items:[]}
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

export default function Commanders() {
  const { query, create, update, updateImage, remove } = useOverviewCommanders();

  const rows = useMemo<Row[]>(() => toArray<Row>(query.data), [query.data]);
  const lastPos = rows.length ? rows[rows.length - 1].position : 0;

  // create form
  const [f, setF] = useState<{
    title: string;
    content: string;
    position: number | "";
    image: File | null;
  }>({
    title: "",
    content: "",
    position: lastPos + 1,
    image: null,
  });

  const onCreate = async () => {
    if (!f.title || f.position === "" || !f.image) {
      alert("Title, position and image are required");
      return;
    }
    await create.mutateAsync({
      title: f.title,
      content: f.content,
      position: Number(f.position),
      image: f.image,
    });
    const freshLast = rows.length ? rows[rows.length - 1].position : 0;
    setF({
      title: "",
      content: "",
      position: freshLast + 1,
      image: null,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="mb-4">
        <h1 className="text-xl font-semibold">Overview — Commanders</h1>
        <div className="mt-2">
          {/* Tabs auto-detect the active route */}
          <OverviewTabs />
        </div>
      </header>

      {/* Create */}
      <section className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-medium">Add commander</div>
        <div className="grid md:grid-cols-5 gap-3">
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Title"
            value={f.title}
            onChange={(e) => setF((s) => ({ ...s, title: e.target.value }))}
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
            placeholder="Content"
            value={f.content}
            onChange={(e) => setF((s) => ({ ...s, content: e.target.value }))}
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Position"
            type="number"
            value={f.position}
            onChange={(e) =>
              setF((s) => ({
                ...s,
                position: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
          />
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            type="file"
            accept="image/*"
            onChange={(e) =>
              setF((s) => ({ ...s, image: e.target.files?.[0] ?? null }))
            }
          />
          <button
            onClick={onCreate}
            disabled={create.isPending}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-60 hover:bg-neutral-50"
          >
            {create.isPending ? "Creating…" : "Create"}
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
              <th>Content</th>
              <th>Position</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {query.isLoading && (
              <tr>
                <td className="px-3 py-3" colSpan={6}>
                  Loading…
                </td>
              </tr>
            )}

            {!query.isLoading &&
              rows.map((r) => (
                <Row
                  key={String(r.id)}
                  item={r}
                  actions={{ update, updateImage, remove }}
                />
              ))}

            {!query.isLoading && rows.length === 0 && (
              <tr>
                <td
                  className="px-3 py-6 text-center text-neutral-500"
                  colSpan={6}
                >
                  No commanders yet.
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

  const save = async () => {
    await actions.update.mutateAsync({
      commander_id: item.id,
      title,
      content,
      position: Number(pos || 0),
    });
    setEdit(false);
  };

  const changeImage = async (file: File | null | undefined) => {
    if (!file) return;
    await actions.updateImage.mutateAsync({ commander_id: item.id, image: file });
  };

  const del = async () => {
    if (!confirm("Delete this commander?")) return;
    await actions.remove.mutateAsync(item.id);
  };

  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t align-top">
      <td className="whitespace-nowrap">{String(item.id)}</td>

      <td>
        {item.image_url ? (
          <img
            src={item.image_url}
            alt=""
            className="h-14 w-14 object-cover rounded-md border"
          />
        ) : (
          <span className="text-neutral-500">No image</span>
        )}
        <label className="mt-1 block rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50 cursor-pointer w-fit">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => changeImage(e.target.files?.[0])}
          />
          Change image
        </label>
      </td>

      <td className="w-56">
        {edit ? (
          <input
            className="rounded-lg border px-2 py-1 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <span className="font-medium">{item.title}</span>
        )}
      </td>

      <td className="w-[28rem]">
        {edit ? (
          <input
            className="rounded-lg border px-2 py-1 w-full"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        ) : (
          <span className="text-neutral-700">{item.content || "—"}</span>
        )}
      </td>

      <td className="w-28">
        {edit ? (
          <input
            className="rounded-lg border px-2 py-1 w-24"
            type="number"
            value={pos}
            onChange={(e) =>
              setPos(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        ) : (
          <span>{item.position}</span>
        )}
      </td>

      <td className="text-right whitespace-nowrap space-x-2">
        {edit ? (
          <>
            <button
              onClick={save}
              className="rounded-lg border px-2 py-1 hover:bg-neutral-50"
            >
              Save
            </button>
            <button
              onClick={() => setEdit(false)}
              className="rounded-lg border px-2 py-1 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEdit(true)}
              className="rounded-lg border px-2 py-1 hover:bg-neutral-50"
            >
              Edit
            </button>
            <button
              onClick={del}
              className="rounded-lg border px-2 py-1 hover:bg-red-50 text-red-600"
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
