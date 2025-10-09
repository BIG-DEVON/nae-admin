// src/features/awards/pages/AwardContent.tsx
import { useSearchParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useAwardContents } from "../hooks/useAwardContent";
import { useAwardMutations } from "../hooks/useAwardMutations";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { notifySuccess, notifyError, extractErrorMessage } from "@/lib/notify";

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

  const sectionId = sp.get("section_id");
  // accept both award_id and awardId (legacy), prefer award_id
  const awardId = sp.get("award_id") ?? sp.get("awardId") ?? "";

  const { data, isLoading, isError, isFetching, refetch } = useAwardContents(sectionId);
  const { createContent, updateContent, deleteContent } = useAwardMutations();

  const rows = useMemo<Row[]>(() => (Array.isArray(data) ? (data as Row[]) : []), [data]);

  const lastPos = rows.length ? rows[rows.length - 1].position : 0;

  // Create form (modal)
  const [createOpen, setCreateOpen] = useState(false);
  const [cForm, setCForm] = useState<Partial<Row>>({
    award_section_id: sectionId ?? "",
    position: lastPos + 1,
    rank: "",
    name: "",
    pno: "",
    courseno: "",
    unit: "",
    year: "",
  });

  // Inline edit
  const [editingId, setEditingId] = useState<Row["id"] | null>(null);
  const [eForm, setEForm] = useState<Partial<Row>>({});

  // Delete confirm
  const [confirmId, setConfirmId] = useState<Row["id"] | null>(null);

  if (!sectionId) {
    return (
      <div className="p-6">
        <div className="mb-2 text-red-600">
          Missing required query param: <code>section_id</code>
        </div>
        <Link to="/awards" className="text-sm underline">
          Go to Awards
        </Link>
      </div>
    );
  }

  const onCreate = async () => {
    try {
      await createContent.mutateAsync({
        award_section_id: Number(sectionId),
        position: Number(cForm.position ?? 0),
        rank: cForm.rank?.trim() || "",
        name: cForm.name?.trim() || "",
        pno: cForm.pno?.trim() || "",
        courseno: cForm.courseno?.trim() || "",
        unit: cForm.unit?.trim() || "",
        year: cForm.year?.trim() || "",
      });
      notifySuccess("Content created");
      setCreateOpen(false);
      setCForm({
        award_section_id: sectionId ?? "",
        position: (rows.length ? rows[rows.length - 1].position : 0) + 1,
        rank: "",
        name: "",
        pno: "",
        courseno: "",
        unit: "",
        year: "",
      });
      refetch();
    } catch (err) {
      notifyError("Failed to create content", extractErrorMessage(err));
    }
  };

  const onSave = async (id: Row["id"]) => {
    try {
      await updateContent.mutateAsync({
        content_id: id,
        award_section_id: Number(sectionId),
        position: Number(eForm.position ?? 0),
        rank: eForm.rank?.trim() || "",
        name: eForm.name?.trim() || "",
        pno: eForm.pno?.trim() || "",
        courseno: eForm.courseno?.trim() || "",
        unit: eForm.unit?.trim() || "",
        year: eForm.year?.trim() || "",
      });
      notifySuccess("Content updated");
      setEditingId(null);
      setEForm({});
      refetch();
    } catch (err) {
      notifyError("Failed to update content", extractErrorMessage(err));
    }
  };

  const onDelete = async (id: Row["id"]) => {
    try {
      await deleteContent.mutateAsync(id);
      notifySuccess("Content deleted");
      refetch();
    } catch (err) {
      notifyError("Failed to delete content", extractErrorMessage(err));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Section Contents</h1>
        <div className="flex items-center gap-2">
          {isFetching && (
            <span className="text-xs rounded-full px-2 py-1 border text-neutral-600">
              Refreshing…
            </span>
          )}
          <Link
            to={awardId ? `/awards/sections?award_id=${awardId}` : "/awards/sections"}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            ← Back to Sections
          </Link>
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-black text-white px-3 py-1.5 text-sm disabled:opacity-60"
            disabled={createContent.isPending}
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
              <tr>
                <td className="px-3 py-3" colSpan={8}>
                  Loading…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td className="px-3 py-3 text-red-600" colSpan={8}>
                  Failed to load.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={String(r.id)} className="border-t">
                {/* Position */}
                <td className="px-3 py-2 w-24">
                  {editingId === r.id ? (
                    <input
                      type="number"
                      className="border rounded-lg px-2 py-1 w-24"
                      value={Number(eForm.position ?? r.position)}
                      onChange={(e) =>
                        setEForm((s) => ({
                          ...s,
                          position:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        }))
                      }
                    />
                  ) : (
                    r.position ?? "—"
                  )}
                </td>
                {/* Rank */}
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-32"
                      value={eForm.rank ?? r.rank ?? ""}
                      onChange={(e) =>
                        setEForm((s) => ({ ...s, rank: e.target.value }))
                      }
                    />
                  ) : (
                    r.rank || "—"
                  )}
                </td>
                {/* Name */}
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-48"
                      value={eForm.name ?? r.name ?? ""}
                      onChange={(e) =>
                        setEForm((s) => ({ ...s, name: e.target.value }))
                      }
                    />
                  ) : (
                    r.name || "—"
                  )}
                </td>
                {/* PNO */}
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-36"
                      value={eForm.pno ?? r.pno ?? ""}
                      onChange={(e) =>
                        setEForm((s) => ({ ...s, pno: e.target.value }))
                      }
                    />
                  ) : (
                    r.pno || "—"
                  )}
                </td>
                {/* Course No */}
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-36"
                      value={eForm.courseno ?? r.courseno ?? ""}
                      onChange={(e) =>
                        setEForm((s) => ({ ...s, courseno: e.target.value }))
                      }
                    />
                  ) : (
                    r.courseno || "—"
                  )}
                </td>
                {/* Unit */}
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-36"
                      value={eForm.unit ?? r.unit ?? ""}
                      onChange={(e) =>
                        setEForm((s) => ({ ...s, unit: e.target.value }))
                      }
                    />
                  ) : (
                    r.unit || "—"
                  )}
                </td>
                {/* Year */}
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <input
                      className="border rounded-lg px-2 py-1 w-28"
                      value={eForm.year ?? r.year ?? ""}
                      onChange={(e) =>
                        setEForm((s) => ({ ...s, year: e.target.value }))
                      }
                    />
                  ) : (
                    r.year || "—"
                  )}
                </td>

                {/* Actions */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2 justify-end">
                    {editingId === r.id ? (
                      <>
                        <button
                          onClick={() => onSave(r.id)}
                          disabled={updateContent.isPending}
                          className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-neutral-50 disabled:opacity-60"
                        >
                          {updateContent.isPending ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEForm({});
                          }}
                          disabled={updateContent.isPending}
                          className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-neutral-50 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(r.id);
                            setEForm(r);
                          }}
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
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-neutral-500">
                  No contents yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Custom modal (replaces <dialog>) */}
      {createOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4"
        >
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h3 className="text-lg font-semibold">Create Content</h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="text-sm text-neutral-600"
              >
                Close
              </button>
            </div>

            <div className="p-5">
              {/* Strict grid: 3 columns, every field same width */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <L label="Position">
                  <input
                    type="number"
                    className="border rounded-lg px-3 py-2 w-full"
                    value={cForm.position ?? 0}
                    onChange={(e) =>
                      setCForm((s) => ({
                        ...s,
                        position: e.target.value === "" ? 0 : Number(e.target.value),
                      }))
                    }
                    required
                  />
                </L>
                <L label="Rank">
                  <input
                    className="border rounded-lg px-3 py-2 w-full"
                    value={cForm.rank || ""}
                    onChange={(e) => setCForm((s) => ({ ...s, rank: e.target.value }))}
                  />
                </L>
                <L label="Name">
                  <input
                    className="border rounded-lg px-3 py-2 w-full"
                    value={cForm.name || ""}
                    onChange={(e) => setCForm((s) => ({ ...s, name: e.target.value }))}
                  />
                </L>
                <L label="PNO">
                  <input
                    className="border rounded-lg px-3 py-2 w-full"
                    value={cForm.pno || ""}
                    onChange={(e) => setCForm((s) => ({ ...s, pno: e.target.value }))}
                  />
                </L>
                <L label="Course No">
                  <input
                    className="border rounded-lg px-3 py-2 w-full"
                    value={cForm.courseno || ""}
                    onChange={(e) =>
                      setCForm((s) => ({ ...s, courseno: e.target.value }))
                    }
                  />
                </L>
                <L label="Unit">
                  <input
                    className="border rounded-lg px-3 py-2 w-full"
                    value={cForm.unit || ""}
                    onChange={(e) => setCForm((s) => ({ ...s, unit: e.target.value }))}
                  />
                </L>
                <L label="Year">
                  <input
                    className="border rounded-lg px-3 py-2 w-full"
                    value={cForm.year || ""}
                    onChange={(e) => setCForm((s) => ({ ...s, year: e.target.value }))}
                  />
                </L>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-3 py-1.5 rounded-lg border text-sm"
                  disabled={createContent.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={onCreate}
                  className="px-3 py-1.5 rounded-lg bg-black text-white text-sm disabled:opacity-60"
                  disabled={createContent.isPending}
                >
                  {createContent.isPending ? "Creating…" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        onClose={() => setConfirmId(null)}
        onConfirm={() => (confirmId != null ? onDelete(confirmId) : undefined)}
        title="Delete content?"
        message="This will permanently remove the item."
        confirmText={deleteContent.isPending ? "Deleting…" : "Delete"}
      />
    </div>
  );
}

/** Small label wrapper to keep markup tidy and alignment consistent */
function L({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-[13px] text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
