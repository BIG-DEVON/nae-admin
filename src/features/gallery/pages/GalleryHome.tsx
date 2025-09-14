import { useEffect, useMemo, useState } from 'react';
import { useGalleryHome } from '../hooks/useGalleryHome';
import type { HomeGallery } from '../types';

type CreateState = {
  name: string;
  title: string;
  position: number | '';
  image: File | null;
};

type EditState = {
  id: HomeGallery['id'] | null;
  name: string;
  title: string;
  position: number | '';
};

export default function GalleryHome() {
  const { list, create, update, updateImage, remove } = useGalleryHome();

  // ---------- Create form state ----------
  const [c, setC] = useState<CreateState>({
    name: '',
    title: '',
    position: '',
    image: null,
  });

  // ---------- Edit form state ----------
  const [e, setE] = useState<EditState>({
    id: null,
    name: '',
    title: '',
    position: '',
  });

  // Populate edit form when user selects a row
  const items = useMemo(() => (Array.isArray(list.data) ? list.data : []), [list.data]);

  useEffect(() => {
    if (e.id == null) return;
    const row = items.find(r => String(r.id) === String(e.id));
    if (!row) return;
    setE({
      id: row.id,
      name: row.name ?? '',
      title: row.title ?? '',
      position: row.position ?? '',
    });
  }, [e.id, items]);

  const onCreate = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!c.image || c.position === '') return alert('Select an image and position');

    create.mutate({
      type: 'create',
      name: c.name,
      title: c.title,
      position: Number(c.position),
      image: c.image,
    }, {
      onSuccess: () => {
        setC({ name: '', title: '', position: '', image: null });
      },
      onError: (err: any) => alert(normalizeError(err)),
    });
  };

  const onUpdate = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (e.id == null) return;
    update.mutate(
      {
        id: e.id,
        name: e.name || undefined,
        title: e.title || undefined,
        position: e.position === '' ? undefined : Number(e.position),
      },
      { onError: (err: any) => alert(normalizeError(err)) }
    );
  };

  const onUpdateImage = (file: File | null) => {
    if (!file || e.id == null) return;
    updateImage.mutate(
      { type: 'edit-image', id: e.id, image: file },
      { onError: (err: any) => alert(normalizeError(err)) }
    );
  };

  const onDelete = (id: HomeGallery['id']) => {
    if (!confirm('Delete this banner?')) return;
    remove.mutate(id, { onError: (err: any) => alert(normalizeError(err)) });
  };

  return (
    <div className="p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Home Gallery (Banners)</h1>
        {list.isFetching && <span className="text-sm text-muted-foreground">Refreshing…</span>}
      </header>

      {/* ---------- Create ---------- */}
      <section className="rounded-xl border p-4">
        <h2 className="font-medium mb-3">Create banner</h2>
        <form className="grid grid-cols-1 md:grid-cols-5 gap-3" onSubmit={onCreate}>
          <input
            className="col-span-1 md:col-span-1 rounded-lg border px-3 py-2"
            placeholder="Name"
            value={c.name}
            onChange={(e) => setC((s) => ({ ...s, name: e.target.value }))}
          />
          <input
            className="col-span-1 md:col-span-2 rounded-lg border px-3 py-2"
            placeholder="Title"
            value={c.title}
            onChange={(e) => setC((s) => ({ ...s, title: e.target.value }))}
          />
          <input
            className="col-span-1 rounded-lg border px-3 py-2"
            placeholder="Position"
            type="number"
            value={c.position}
            onChange={(e) => setC((s) => ({ ...s, position: e.target.valueAsNumber || '' }))}
          />
          <input
            className="col-span-1 rounded-lg border px-3 py-2"
            type="file"
            accept="image/*"
            onChange={(e) => setC((s) => ({ ...s, image: e.target.files?.[0] ?? null }))}
          />
          <button
            type="submit"
            disabled={create.isLoading}
            className="col-span-1 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm disabled:opacity-60"
          >
            {create.isLoading ? 'Creating…' : 'Create'}
          </button>
        </form>
      </section>

      {/* ---------- Table/List ---------- */}
      <section className="rounded-xl border">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                <th>ID</th>
                <th>Preview</th>
                <th>Name</th>
                <th>Title</th>
                <th>Position</th>
                <th className="text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-t [&>td]:px-3 [&>td]:py-2 align-top">
                  <td className="whitespace-nowrap">{row.id}</td>
                  <td>
                    {row.image_url ? (
                      <img src={row.image_url} alt={row.title} className="h-14 w-auto rounded-md border" />
                    ) : (
                      <span className="text-muted-foreground">No image</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap">{row.name}</td>
                  <td className="whitespace-pre-wrap">{row.title}</td>
                  <td className="whitespace-nowrap">{row.position}</td>
                  <td className="text-right space-x-2">
                    <button
                      className="rounded-lg border px-2 py-1"
                      onClick={() => setE({ id: row.id, name: row.name, title: row.title, position: row.position })}
                    >
                      Edit
                    </button>
                    <label className="inline-flex items-center rounded-lg border px-2 py-1 cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(ev) => onUpdateImage(ev.target.files?.[0] ?? null)}
                      />
                      Edit image
                    </label>
                    <button
                      className="rounded-lg border px-2 py-1 text-red-600"
                      onClick={() => onDelete(row.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {items.length === 0 && !list.isLoading && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    No banners yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- Edit panel ---------- */}
      {e.id != null && (
        <section className="rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Edit banner (ID {String(e.id)})</h2>
            <button className="text-sm text-muted-foreground" onClick={() => setE({ id: null, name: '', title: '', position: '' })}>
              Close
            </button>
          </div>

          <form className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={onUpdate}>
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="Name"
              value={e.name}
              onChange={(ev) => setE((s) => ({ ...s, name: ev.target.value }))}
            />
            <input
              className="md:col-span-2 rounded-lg border px-3 py-2"
              placeholder="Title"
              value={e.title}
              onChange={(ev) => setE((s) => ({ ...s, title: ev.target.value }))}
            />
            <input
              className="rounded-lg border px-3 py-2"
              placeholder="Position"
              type="number"
              value={e.position}
              onChange={(ev) => setE((s) => ({ ...s, position: ev.target.valueAsNumber || '' }))}
            />
            <div className="md:col-span-4">
              <button
                type="submit"
                disabled={update.isLoading}
                className="inline-flex items-center rounded-lg border px-3 py-2 text-sm disabled:opacity-60"
              >
                {update.isLoading ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

function normalizeError(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) return String((err as any).message);
  try { return JSON.stringify(err); } catch { return 'Unknown error'; }
}
