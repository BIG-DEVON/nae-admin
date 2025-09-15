import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAwards } from '../hooks/useAwards';
import { useAwardMutations } from '../hooks/useAwardMutations';

// tiny helper to normalize API shapes: [], {data:[]}, {results:[]}, {items:[]}
function toArray<T = unknown>(input: unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    for (const k of ['data', 'results', 'items']) {
      const v = obj[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

type AwardRow = { id: number | string; title: string; position: number };

export default function Awards() {
  const { data, isLoading, isError, refetch } = useAwards();
  // normalize whatever the backend returns into a plain array
  const items = toArray<AwardRow>(data);

  const { createAward, updateAward, deleteAward } = useAwardMutations();

  const [title, setTitle] = useState('');
  const [position, setPosition] = useState<number | ''>('');

  const onCreate = async () => {
    if (!title) return alert('Title required');
    await createAward.mutateAsync({ title, position: Number(position || 0) });
    setTitle('');
    setPosition('');
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Awards</h1>

      {/* Create */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-medium">Create award</div>
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
              setPosition(e.target.value === '' ? '' : Number(e.target.value))
            }
          />
          <button
            onClick={onCreate}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50"
          >
            Create
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
            {items.map((a) => (
              <Row
                key={String(a.id)}
                item={a}
                onSave={async (p) => {
                  await updateAward.mutateAsync({ award_id: a.id, ...p });
                  refetch();
                }}
                onDelete={async () => {
                  if (!confirm('Delete award?')) return;
                  await deleteAward.mutateAsync(a.id);
                  refetch();
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  item,
  onSave,
  onDelete,
}: {
  item: AwardRow;
  onSave: (patch: { title?: string; position?: number }) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [position, setPosition] = useState<number | ''>(item.position);

  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t">
      <td>{String(item.id)}</td>
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
            setPosition(e.target.value === '' ? '' : Number(e.target.value))
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
          to={`/awards/sections?award_id=${item.id}`}
          className="rounded-lg border px-2 py-1 hover:bg-zinc-50"
        >
          Sections
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
