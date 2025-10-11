// src/features/overview/pages/Chronicles.tsx
import { useEffect, useMemo, useState } from "react";
import OverviewTabs from "@/features/overview/components/OverviewTabs";
import {
  useOverviewChroniclesList,
  useOverviewChroniclesContents,
  useOverviewChroniclesMutations,
} from "../hooks/useOverview";
import { notifySuccess, notifyError, extractErrorMessage } from "@/lib/notify";

/* --------------------------------- helpers -------------------------------- */
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
function getId(obj: Record<string, unknown>): string | number | undefined {
  const cand =
    (obj.overview_id as unknown) ??
    (obj.id as unknown) ??
    (obj.chronicles_id as unknown) ??
    (obj.section_id as unknown);
  return typeof cand === "string" || typeof cand === "number" ? cand : undefined;
}

/* ---------------------------------- types --------------------------------- */
type Section = {
  id: string | number;
  title: string;
  position: number;
};
type ContentRow = {
  id: string | number;
  chronicles_id: string | number;
  position: number;
  rank?: string;
  name?: string;
  pno?: string;
  period?: string;
  decoration?: string;
};

/* ---------------------------------- page ---------------------------------- */
export default function Chronicles() {
  /* Sections */
  const sectionsQ = useOverviewChroniclesList();
  const sections: Section[] = useMemo(() => {
    const list = toArray<Record<string, unknown>>(sectionsQ.data).map((r) => ({
      id: getId(r)!,
      title: String((r.title as string) ?? ""),
      position: Number((r.position as number) ?? 0),
    }));
    return list.sort((a, b) => a.position - b.position);
  }, [sectionsQ.data]);

  const [selected, setSelected] = useState<string | number | null>(null);

  // pick first section by default when list loads
  useEffect(() => {
    if (selected == null && sections.length) setSelected(sections[0].id);
  }, [sections, selected]);

  /* Section & Content mutations */
  const {
    create,
    update,
    remove,
    createContent,
    updateContent,
    deleteContent,
  } = useOverviewChroniclesMutations();

  /* Contents for selected section */
  const contentsQ = useOverviewChroniclesContents(selected);
  const rows: ContentRow[] = useMemo(() => {
    const list = toArray<Record<string, unknown>>(contentsQ.data).map((r) => ({
      id: getId(r)!,
      chronicles_id:
        (typeof r.chronicles_id === "string" || typeof r.chronicles_id === "number"
          ? r.chronicles_id
          : selected) ?? 0,
      position: Number((r.position as number) ?? 0),
      rank: (r.rank as string) ?? "",
      name: (r.name as string) ?? "",
      pno: (r.pno as string) ?? "",
      period: (r.period as string) ?? "",
      decoration: (r.decoration as string) ?? "",
    }));
    return list.sort((a, b) => a.position - b.position);
  }, [contentsQ.data, selected]);

  /* --------------------------- Section create/edit --------------------------- */
  const lastPos = sections.length ? sections[sections.length - 1].position : 0;

  const [sTitle, setSTitle] = useState("");
  const [sPos, setSPos] = useState<number | "">(lastPos + 1);

  const onCreateSection = async () => {
    const title = sTitle.trim();
    const pos = sPos === "" ? "" : Math.max(0, Number(sPos));
    if (!title || pos === "") {
      notifyError("Title and position are required for a section.");
      return;
    }
    try {
      await create.mutateAsync({ title, position: Number(pos) });
      notifySuccess("Section created");
      setSTitle("");
      setSPos((prev) => (typeof prev === "number" ? prev + 1 : ""));
    } catch (err) {
      notifyError("Failed to create section", extractErrorMessage(err));
    }
  };

  const onUpdateSection = async (
    section_id: Section["id"],
    patch: Partial<Pick<Section, "title" | "position">>
  ) => {
    try {
      await update.mutateAsync({
        overview_id: section_id,
        title: patch.title,
        position:
          typeof patch.position === "number"
            ? Math.max(0, patch.position)
            : patch.position,
      });
      notifySuccess("Section updated");
    } catch (err) {
      notifyError("Failed to update section", extractErrorMessage(err));
    }
  };

  const onDeleteSection = async (section_id: Section["id"]) => {
    if (!confirm("Delete this section? Its contents will also be removed.")) return;
    try {
      await remove.mutateAsync(section_id);
      notifySuccess("Section deleted");
      if (String(selected) === String(section_id)) {
        setSelected(null);
      }
    } catch (err) {
      notifyError("Failed to delete section", extractErrorMessage(err));
    }
  };

  /* ----------------------------- Content create ----------------------------- */
  const lastContentPos = rows.length ? rows[rows.length - 1].position : 0;

  const [cForm, setCForm] = useState<Partial<ContentRow>>({
    position: lastContentPos + 1,
    rank: "",
    name: "",
    pno: "",
    period: "",
    decoration: "",
  });

  useEffect(() => {
    // refresh default create position when list changes
    setCForm((s) => ({
      ...s,
      position: (rows[rows.length - 1]?.position ?? 0) + 1,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  const onCreateContent = async () => {
    if (!selected) {
      notifyError("Select a section first.");
      return;
    }
    if (typeof cForm.position !== "number") {
      notifyError("Position is required.");
      return;
    }
    try {
      await createContent.mutateAsync({
        chronicles_id: selected,
        position: Math.max(0, Number(cForm.position)),
        rank: cForm.rank ?? "",
        name: cForm.name ?? "",
        pno: cForm.pno ?? "",
        period: cForm.period ?? "",
        decoration: cForm.decoration ?? "",
      });
      notifySuccess("Content created");
      setCForm({
        position: (rows[rows.length - 1]?.position ?? 0) + 1,
        rank: "",
        name: "",
        pno: "",
        period: "",
        decoration: "",
      });
    } catch (err) {
      notifyError("Failed to create content", extractErrorMessage(err));
    }
  };

  const onUpdateContent = async (row: ContentRow, patch: Partial<ContentRow>) => {
    try {
      await updateContent.mutateAsync({
        content_id: row.id,
        chronicles_id: row.chronicles_id,
        position:
          typeof patch.position === "number"
            ? Math.max(0, patch.position)
            : patch.position,
        rank: patch.rank,
        name: patch.name,
        pno: patch.pno,
        period: patch.period,
        decoration: patch.decoration,
      });
      notifySuccess("Content updated");
    } catch (err) {
      notifyError("Failed to update content", extractErrorMessage(err));
    }
  };

  const onDeleteContent = async (row: ContentRow) => {
    if (!confirm("Delete this record?")) return;
    try {
      await deleteContent.mutateAsync(row.id);
      notifySuccess("Content deleted");
    } catch (err) {
      notifyError("Failed to delete content", extractErrorMessage(err));
    }
  };

  const busy =
    sectionsQ.isFetching ||
    contentsQ.isFetching ||
    create.isPending ||
    update.isPending ||
    remove.isPending ||
    createContent.isPending ||
    updateContent.isPending ||
    deleteContent.isPending;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-xl font-semibold">Overview — Chronicles</h1>
        <div className="mt-2">
          <OverviewTabs />
        </div>
      </header>

      {/* Layout: two cards side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* --------------------------- Sections (left) --------------------------- */}
        <section className="rounded-xl border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Sections</h2>
            {sectionsQ.isFetching && (
              <span className="text-xs text-neutral-500">Refreshing…</span>
            )}
          </div>

          {/* Create section */}
          <div className="grid gap-3 md:grid-cols-3">
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Title"
              value={sTitle}
              onChange={(e) => setSTitle(e.target.value)}
              aria-label="New section title"
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Position"
              type="number"
              value={sPos}
              onChange={(e) =>
                setSPos(
                  e.target.value === "" ? "" : Math.max(0, Number(e.target.value))
                )
              }
              aria-label="New section position"
            />
            <button
              onClick={onCreateSection}
              disabled={create.isPending}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
            >
              {create.isPending ? "Creating…" : "Create"}
            </button>
          </div>

          {/* List sections */}
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                  <th>ID</th>
                  <th>Title</th>
                  <th>Position</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sectionsQ.isLoading && (
                  <tr>
                    <td className="px-3 py-3" colSpan={4}>
                      Loading…
                    </td>
                  </tr>
                )}
                {!sectionsQ.isLoading && sections.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-neutral-500"
                      colSpan={4}
                    >
                      No sections yet.
                    </td>
                  </tr>
                )}
                {sections.map((s) => (
                  <SectionRow
                    key={String(s.id)}
                    item={s}
                    selected={String(selected) === String(s.id)}
                    onSelect={() => setSelected(s.id)}
                    onSave={(patch) => onUpdateSection(s.id, patch)}
                    onDelete={() => onDeleteSection(s.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --------------------------- Contents (right) -------------------------- */}
        <section className="rounded-xl border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              Contents {selected ? `(Section #${selected})` : ""}
            </h2>
            {contentsQ.isFetching && (
              <span className="text-xs text-neutral-500">Refreshing…</span>
            )}
          </div>

          {/* Create content */}
          <div className="grid gap-3 md:grid-cols-6 rounded-lg border p-3">
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Position"
              type="number"
              value={cForm.position ?? ""}
              onChange={(e) =>
                setCForm((s) => ({
                  ...s,
                  position:
                    e.target.value === ""
                      ? ""
                      : Math.max(0, Number(e.target.value)),
                }))
              }
              aria-label="Content position"
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Rank"
              value={cForm.rank ?? ""}
              onChange={(e) => setCForm((s) => ({ ...s, rank: e.target.value }))}
              aria-label="Content rank"
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Name"
              value={cForm.name ?? ""}
              onChange={(e) => setCForm((s) => ({ ...s, name: e.target.value }))}
              aria-label="Content name"
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="PNO"
              value={cForm.pno ?? ""}
              onChange={(e) => setCForm((s) => ({ ...s, pno: e.target.value }))}
              aria-label="Content PNO"
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Period"
              value={cForm.period ?? ""}
              onChange={(e) => setCForm((s) => ({ ...s, period: e.target.value }))}
              aria-label="Content period"
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Decoration"
              value={cForm.decoration ?? ""}
              onChange={(e) =>
                setCForm((s) => ({ ...s, decoration: e.target.value }))
              }
              aria-label="Content decoration"
            />
            <div className="md:col-span-6">
              <button
                onClick={onCreateContent}
                disabled={!selected || createContent.isPending}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60"
              >
                {createContent.isPending ? "Creating…" : "Add row"}
              </button>
            </div>
          </div>

          {/* List contents */}
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50">
                <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                  <th>Pos</th>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>PNO</th>
                  <th>Period</th>
                  <th>Decoration</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contentsQ.isLoading && (
                  <tr>
                    <td className="px-3 py-3" colSpan={7}>
                      Loading…
                    </td>
                  </tr>
                )}
                {!contentsQ.isLoading && rows.length === 0 && (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-neutral-500"
                      colSpan={7}
                    >
                      {selected
                        ? "No rows yet."
                        : "Select a section to view contents."}
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <ContentRow
                    key={String(r.id)}
                    item={r}
                    onSave={(patch) => onUpdateContent(r, patch)}
                    onDelete={() => onDeleteContent(r)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {busy && <div className="text-xs text-neutral-500">Working…</div>}
    </div>
  );
}

/* ------------------------------- row: section ------------------------------ */
function SectionRow({
  item,
  selected,
  onSelect,
  onSave,
  onDelete,
}: {
  item: Section;
  selected: boolean;
  onSelect: () => void;
  onSave: (patch: { title?: string; position?: number }) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [pos, setPos] = useState<number | "">(item.position);

  useEffect(() => {
    if (!editing) {
      setTitle(item.title);
      setPos(item.position);
    }
  }, [editing, item.title, item.position]);

  return (
    <tr
      className={[
        "[&>td]:px-3 [&>td]:py-2 border-t cursor-pointer",
        selected ? "bg-green-50/50" : "",
      ].join(" ")}
      onClick={() => !editing && onSelect()}
    >
      <td className="whitespace-nowrap">{String(item.id)}</td>
      <td>
        {editing ? (
          <input
            className="rounded-lg border px-2 py-1 w-64"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <span className="font-medium">{item.title}</span>
        )}
      </td>
      <td className="w-28">
        {editing ? (
          <input
            type="number"
            className="rounded-lg border px-2 py-1 w-24"
            value={pos}
            onChange={(e) =>
              setPos(
                e.target.value === "" ? "" : Math.max(0, Number(e.target.value))
              )
            }
          />
        ) : (
          <span>{item.position}</span>
        )}
      </td>
      <td className="text-right space-x-2">
        {editing ? (
          <>
            <button
              onClick={() => {
                onSave({ title: title.trim(), position: Number(pos || 0) });
                setEditing(false);
              }}
              className="rounded-lg border px-2 py-1 hover:bg-neutral-50"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTitle(item.title);
                setPos(item.position);
                setEditing(false);
              }}
              className="rounded-lg border px-2 py-1 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              className="rounded-lg border px-2 py-1 hover:bg-neutral-50"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
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

/* ------------------------------- row: content ------------------------------ */
function ContentRow({
  item,
  onSave,
  onDelete,
}: {
  item: ContentRow;
  onSave: (patch: Partial<ContentRow>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState<Partial<ContentRow>>({
    position: item.position,
    rank: item.rank ?? "",
    name: item.name ?? "",
    pno: item.pno ?? "",
    period: item.period ?? "",
    decoration: item.decoration ?? "",
  });

  useEffect(() => {
    if (!editing) {
      setF({
        position: item.position,
        rank: item.rank ?? "",
        name: item.name ?? "",
        pno: item.pno ?? "",
        period: item.period ?? "",
        decoration: item.decoration ?? "",
      });
    }
  }, [editing, item]);

  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t">
      <td className="w-24">
        {editing ? (
          <input
            type="number"
            className="rounded-lg border px-2 py-1 w-24"
            value={(f.position as number) ?? ""}
            onChange={(e) =>
              setF((s) => ({
                ...s,
                position:
                  e.target.value === "" ? "" : Math.max(0, Number(e.target.value)),
              }))
            }
          />
        ) : (
          item.position
        )}
      </td>
      <td className="w-28">
        {editing ? (
          <input
            className="rounded-lg border px-2 py-1 w-28"
            value={f.rank ?? ""}
            onChange={(e) => setF((s) => ({ ...s, rank: e.target.value }))}
          />
        ) : (
          item.rank || "—"
        )}
      </td>
      <td className="w-52">
        {editing ? (
          <input
            className="rounded-lg border px-2 py-1 w-52"
            value={f.name ?? ""}
            onChange={(e) => setF((s) => ({ ...s, name: e.target.value }))}
          />
        ) : (
          item.name || "—"
        )}
      </td>
      <td className="w-40">
        {editing ? (
          <input
            className="rounded-lg border px-2 py-1 w-40"
            value={f.pno ?? ""}
            onChange={(e) => setF((s) => ({ ...s, pno: e.target.value }))}
          />
        ) : (
          item.pno || "—"
        )}
      </td>
      <td className="w-40">
        {editing ? (
          <input
            className="rounded-lg border px-2 py-1 w-40"
            value={f.period ?? ""}
            onChange={(e) => setF((s) => ({ ...s, period: e.target.value }))}
          />
        ) : (
          item.period || "—"
        )}
      </td>
      <td className="w-48">
        {editing ? (
          <input
            className="rounded-lg border px-2 py-1 w-48"
            value={f.decoration ?? ""}
            onChange={(e) => setF((s) => ({ ...s, decoration: e.target.value }))}
          />
        ) : (
          item.decoration || "—"
        )}
      </td>
      <td className="text-right whitespace-nowrap space-x-2">
        {editing ? (
          <>
            <button
              onClick={() => {
                onSave({
                  position: (f.position as number) ?? item.position,
                  rank: f.rank,
                  name: f.name,
                  pno: f.pno,
                  period: f.period,
                  decoration: f.decoration,
                });
                setEditing(false);
              }}
              className="rounded-lg border px-2 py-1 hover:bg-neutral-50"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg border px-2 py-1 hover:bg-neutral-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border px-2 py-1 hover:bg-neutral-50"
            >
              Edit
            </button>
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
