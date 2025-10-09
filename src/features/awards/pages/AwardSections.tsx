// src/features/awards/pages/AwardSections.tsx
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAwardSections } from "../hooks/useAwardSections";
import { useAwardMutations } from "../hooks/useAwardMutations";
import { notifySuccess, notifyError, extractErrorMessage } from "@/lib/notify";

// normalize helper (works with [], {data:[]}, {results:[]}, {items:[]})
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

type SectionRow = {
  id: number | string;
  award_id: number | string;
  title: string;
  position: number;
};

export default function AwardSections() {
  const [params] = useSearchParams();

  // Accept both award_id and awardId (legacy) but normalize to a single number
  const awardParam = params.get("award_id") ?? params.get("awardId");
  const awardId = awardParam ? Number(awardParam) : NaN;

  if (!awardParam || Number.isNaN(awardId)) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-red-600">
          Missing or invalid <code>award_id</code> query parameter.
        </p>
        <Link
          to="/awards"
          className="inline-flex rounded-lg border px-3 py-1.5 text-sm"
        >
          Back to Awards
        </Link>
      </div>
    );
  }

  const { data, isLoading, isError, isFetching, refetch } =
    useAwardSections(awardId);
  const items = toArray<SectionRow>(data);

  const { createSection, updateSection, deleteSection } = useAwardMutations();

  const [title, setTitle] = useState("");
  const [position, setPosition] = useState<number | "">("");

  const onCreate = async () => {
    const t = title.trim();
    const p = Number(position || 0);
    if (!t) {
      notifyError("Title required");
      return;
    }
    try {
      await createSection.mutateAsync({
        award_id: awardId,
        title: t,
        position: p,
      });
      notifySuccess("Section created");
      setTitle("");
      setPosition("");
      refetch();
    } catch (err) {
      notifyError("Failed to create section", extractErrorMessage(err));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Award Sections</h1>
        <div className="flex items-center gap-2">
          {isFetching && (
            <span className="text-xs rounded-full px-2 py-1 border text-neutral-600">
              Refreshing…
            </span>
          )}
          <Link
            to="/awards"
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Create */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-medium">
          Create section for Award #{awardId}
        </div>
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
            disabled={createSection.isPending}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
          >
            {createSection.isPending ? "Creating…" : "Create"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/60">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>ID</th>
              <th>Title</th>
              <th>Position</th>
              <th className="text-right">Actions</th>
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
            {items.map((s) => (
              <Row
                key={String(s.id)}
                awardId={awardId}
                item={s}
                onSave={async (patch) => {
                  try {
                    await updateSection.mutateAsync({
                      section_id: s.id,
                      award_id: awardId,
                      ...patch,
                    });
                    notifySuccess("Section updated");
                    refetch();
                  } catch (err) {
                    notifyError("Failed to update", extractErrorMessage(err));
                  }
                }}
                onDelete={async () => {
                  if (!confirm("Delete section?")) return;
                  try {
                    await deleteSection.mutateAsync(s.id);
                    notifySuccess("Section deleted");
                    refetch();
                  } catch (err) {
                    notifyError("Failed to delete", extractErrorMessage(err));
                  }
                }}
              />
            ))}
            {!isLoading && !isError && items.length === 0 && (
              <tr>
                <td
                  className="px-3 py-6 text-center text-neutral-500"
                  colSpan={4}
                >
                  No sections yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  item,
  awardId,
  onSave,
  onDelete,
}: {
  item: SectionRow;
  awardId: number;
  onSave: (patch: { title?: string; position?: number }) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [position, setPosition] = useState<number | "">(item.position);

  // Keep inputs in sync when parent refetches (while not editing)
  useEffect(() => {
    if (!isEditing) {
      setTitle(item.title);
      setPosition(item.position);
    }
  }, [item.id, item.title, item.position, isEditing]);

  const handleSave = () => {
    onSave({ title, position: Number(position || 0) });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(item.title);
    setPosition(item.position);
    setIsEditing(false);
  };

  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t">
      <td>{String(item.id)}</td>

      <td>
        {isEditing ? (
          <input
            className="rounded-lg border px-2 py-1 text-sm w-64"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <span className="font-medium">{item.title}</span>
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            className="rounded-lg border px-2 py-1 text-sm w-24"
            type="number"
            value={position}
            onChange={(e) =>
              setPosition(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        ) : (
          <span>{item.position}</span>
        )}
      </td>

      <td className="space-x-2 text-right">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="rounded-lg border px-2 py-1 hover:bg-zinc-50"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="rounded-lg border px-2 py-1 hover:bg-zinc-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg border px-2 py-1 hover:bg-zinc-50"
            >
              Edit
            </button>
            {/* Keep award_id in the URL so the contents page can link back correctly */}
            <Link
              to={`/awards/contents?section_id=${item.id}&award_id=${awardId}`}
              className="rounded-lg border px-2 py-1 hover:bg-zinc-50"
            >
              Contents
            </Link>
            <button
              onClick={onDelete}
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
