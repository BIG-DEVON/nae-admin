// src/features/awards/pages/AwardContent.tsx
import { useSearchParams, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useAwardContents } from '../hooks/useAwardContent';
import { useAwardMutations } from '../hooks/useAwardMutations';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type Row = {
  id: number | string;
  award_section_id: number | string;
  position: number;
  rank?: string;
  name?: string;
  pno?: string;
  courseno?: string;
  unit?: string;
  year?: string;
};

export default function AwardContents() {
  const [sp] = useSearchParams();

  const sectionId = sp.get('section_id');
  // ✅ Accept both award_id and awardId (for legacy links), but normalize to award_id going forward
  const awardId = sp.get('award_id') ?? sp.get('awardId') ?? '';

  const { data, isLoading, isError, refetch } = useAwardContents(sectionId);
  const { createContent, updateContent, deleteContent } = useAwardMutations();

  const rows = useMemo<Row[]>(
    () => (Array.isArray(data) ? (data as any) : []),
    [data]
  );

  // Create form
  const [createOpen, setCreateOpen] = useState(false);
  const [cForm, setCForm] = useState<Partial<Row>>({
    award_section_id: sectionId ?? '',
    position: (rows.at(-1)?.position ?? 0) + 1,
    rank: '', name: '', pno: '', courseno: '', unit: '', year: ''
  });

  // Inline edit tracking
  const [editingId, setEditingId] = useState<Row['id'] | null>(null);
  const [eForm, setEForm] = useState<Partial<Row>>({});

  // Delete confirm
  const [confirmId, setConfirmId] = useState<Row['id'] | null>(null);

  if (!sectionId) {
    return (
      <div className="p-6">
        <div className="mb-2 text-red-600">
          Missing required query param: <code>section_id</code>
        </div>
        <Link to="/awards" className="text-sm underline">Go to Awards</Link>
      </div>
    );
  }

  const onCreate = async () => {
    if (!cForm.position) cForm.position = 0;
    await createContent.mutateAsync({
      award_section_id: Number(sectionId),
      position: Number(cForm.position),
      rank: cForm.rank?.trim() || '',
      name: cForm.name?.trim() || '',
      pno: cForm.pno?.trim() || '',
      courseno: cForm.courseno?.trim() || '',
      unit: cForm.unit?.trim() || '',
      year: cForm.year?.trim() || '',
    });
    setCreateOpen(false);
    setCForm({
      award_section_id: sectionId ?? '',
      position: (rows.at(-1)?.position ?? 0) + 1,
      rank: '', name: '', pno: '', courseno: '', unit: '', year: ''
    });
    refetch();
  };

  const onSave = async (id: Row['id']) => {
    await updateContent.mutateAsync({
      content_id: id,
      award_section_id: Number(sectionId),
      position: Number(eForm.position ?? 0),
      rank: eForm.rank?.trim() || '',
      name: eForm.name?.trim() || '',
      pno: eForm.pno?.trim() || '',
      courseno: eForm.courseno?.trim() || '',
      unit: eForm.unit?.trim() || '',
      year: eForm.year?.trim() || '',
    });
    setEditingId(null);
    setEForm({});
    refetch();
  };

  const onDelete = async (id: Row['id']) => {
    await deleteContent.mutateAsync(id);
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Section Contents</h1>
        <div className="flex items-center gap-2">
          {/* ✅ Always navigate using award_id to satisfy the Sections page */}
          <Link
            to={awardId ? `/awards/sections?award_id=${awardId}` : '/awards/sections'}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            ← Back to Sections
          </Link>
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-black text-white px-3 py-1.5 text-sm"
          >
            New content
          </button>
        </div>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="text-left px-3 py-2">Position</th>
              <th className="text-left px-3 py-2">Rank</th>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">PNO</th>
              <th className="text-left px-3 py-2">Course No</th>
              <th className="text-left px-3 py-2">Unit</th>
              <th className="text-left px-3 py-2">Year</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="px-3 py-3" colSpan={8}>Loading…</td></tr>
            )}
            {isError && (
              <tr><td className="px-3 py-3 text-red-600" colSpan={8}>Failed to load.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={String(r.id)} className="border-t">
                <td className="px-3 py-2 w-24">
                  {editingId === r.id ? (
                    <input
                      type="number"
                      className="border rounded-lg px-2 py-1 w-24"
                      defaultValue={r.position ?? 0}
                      onChange={(e) => setEForm((s) => ({ ...s, position: Number(e.target.value) }))}
                    />
                  ) : (
                    r.position ?? '—'
                  )}
                </td>
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-32"
                      defaultValue={r.rank || ''}
                      onChange={(e) => setEForm((s) => ({ ...s, rank: e.target.value }))}
                    />
                  ) : (r.rank || '—')}
                </td>
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-48"
                      defaultValue={r.name || ''}
                      onChange={(e) => setEForm((s) => ({ ...s, name: e.target.value }))}
                    />
                  ) : (r.name || '—')}
                </td>
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-36"
                      defaultValue={r.pno || ''}
                      onChange={(e) => setEForm((s) => ({ ...s, pno: e.target.value }))}
                    />
                  ) : (r.pno || '—')}
                </td>
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-36"
                      defaultValue={r.courseno || ''}
                      onChange={(e) => setEForm((s) => ({ ...s, courseno: e.target.value }))}
                    />
                  ) : (r.courseno || '—')}
                </td>
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-36"
                      defaultValue={r.unit || ''}
                      onChange={(e) => setEForm((s) => ({ ...s, unit: e.target.value }))}
                    />
                  ) : (r.unit || '—')}
                </td>
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-28"
                      defaultValue={r.year || ''}
                      onChange={(e) => setEForm((s) => ({ ...s, year: e.target.value }))}
                    />
                  ) : (r.year || '—')}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2 justify-end">
                    {editingId === r.id ? (
                      <>
                        <button
                          onClick={() => onSave(r.id)}
                          className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-neutral-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEForm({}); }}
                          className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-neutral-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingId(r.id); setEForm(r); }}
                          className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-neutral-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmId(r.id)}
                          className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-neutral-50"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {createOpen && (
        <dialog open className="rounded-2xl p-0 w-[min(96vw,720px)]">
          <form method="dialog" onSubmit={(e) => { e.preventDefault(); onCreate(); }}>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Create Content</h3>
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="text-sm text-neutral-600"
                >
                  Close
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                {/* fields... unchanged */}
                <label className="grid gap-1 text-sm">
                  <span>Position</span>
                  <input
                    type="number"
                    className="border rounded-lg px-3 py-2"
                    value={cForm.position ?? 0}
                    onChange={(e) => setCForm((s) => ({ ...s, position: Number(e.target.value) }))}
                    required
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Rank</span>
                  <input
                    className="border rounded-lg px-3 py-2"
                    value={cForm.rank || ''}
                    onChange={(e) => setCForm((s) => ({ ...s, rank: e.target.value }))}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Name</span>
                  <input
                    className="border rounded-lg px-3 py-2"
                    value={cForm.name || ''}
                    onChange={(e) => setCForm((s) => ({ ...s, name: e.target.value }))}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>PNO</span>
                  <input
                    className="border rounded-lg px-3 py-2"
                    value={cForm.pno || ''}
                    onChange={(e) => setCForm((s) => ({ ...s, pno: e.target.value }))}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Course No</span>
                  <input
                    className="border rounded-lg px-3 py-2"
                    value={cForm.courseno || ''}
                    onChange={(e) => setCForm((s) => ({ ...s, courseno: e.target.value }))}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Unit</span>
                  <input
                    className="border rounded-lg px-3 py-2"
                    value={cForm.unit || ''}
                    onChange={(e) => setCForm((s) => ({ ...s, unit: e.target.value }))}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span>Year</span>
                  <input
                    className="border rounded-lg px-3 py-2"
                    value={cForm.year || ''}
                    onChange={(e) => setCForm((s) => ({ ...s, year: e.target.value }))}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-sm"
                >
                  Cancel
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-black text-white text-sm">
                  Create
                </button>
              </div>
            </div>
          </form>
        </dialog>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => (confirmId != null ? onDelete(confirmId) : undefined)}
        title="Delete content?"
        message="This will permanently remove the item."
        confirmText="Delete"
      />
    </div>
  );
}
