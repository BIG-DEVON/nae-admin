import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGalleryContents } from '../hooks/useGalleryContents';
import { useGalleryMutations } from '../hooks/useGalleryMutations';
import type { ID } from '../types';

export default function GalleryDetail() {
  const [sp] = useSearchParams();
  const galleryId = sp.get('id');
  const { data, isLoading, isError, refetch } = useGalleryContents(galleryId);

  const {
    createGalleryContent: createMut,
    editGalleryContent: editMut,
    editGalleryContentImage: editImgMut,
    deleteGalleryContent: delMut,
  } = useGalleryMutations();

  // Create form state
  const [title, setTitle] = useState('');
  const [position, setPosition] = useState<number | ''>('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onCreate = async () => {
    if (!galleryId) return alert('No gallery id');
    const file = fileRef.current?.files?.[0];
    if (!file) return alert('Choose an image');
    if (!title) return alert('Title is required');

    await createMut.mutateAsync({
      gallery_id: galleryId as ID,
      image: file,
      title,
      position: Number(position || 0),
    });
    setTitle('');
    setPosition('');
    if (fileRef.current) fileRef.current.value = '';
    refetch();
  };

  const onEdit = async (content: { content_id: ID; gallery_id: ID; title?: string; position?: number }) => {
    await editMut.mutateAsync(content);
    refetch();
  };

  const onEditImage = async (contentId: ID, file: File | null | undefined) => {
    if (!file) return;
    await editImgMut.mutateAsync({ content_id: contentId, image: file });
    refetch();
  };

  const onDelete = async (contentId: ID) => {
    if (!confirm('Delete this content item?')) return;
    await delMut.mutateAsync({ content_id: contentId });
    refetch();
  };

  const rows = useMemo(() => data ?? [], [data]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Gallery Contents</h1>
        <div className="text-sm text-muted-foreground">Gallery ID: {galleryId ?? '—'}</div>
      </div>

      {/* Create */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-medium">Create content</div>
        <div className="grid gap-3 md:grid-cols-4">
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
            onChange={(e) => setPosition(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <input ref={fileRef} className="rounded-lg border px-3 py-2 text-sm" type="file" accept="image/*" />
          <button
            onClick={onCreate}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50"
            disabled={createMut.isPending}
          >
            {createMut.isPending ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/60">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>ID</th>
              <th>Preview</th>
              <th>Title</th>
              <th>Position</th>
              <th className="w-1/4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="px-3 py-3 text-muted-foreground" colSpan={5}>Loading…</td></tr>
            )}
            {isError && (
              <tr><td className="px-3 py-3 text-red-600" colSpan={5}>Failed to load.</td></tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr><td className="px-3 py-3 text-muted-foreground" colSpan={5}>No contents</td></tr>
            )}

            {rows.map((c) => (
              <ContentRow
                key={String(c.id)}
                item={c}
                onEdit={(patch) => onEdit({ content_id: c.id, gallery_id: c.gallery_id, ...patch })}
                onEditImage={(file) => onEditImage(c.id, file)}
                onDelete={() => onDelete(c.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContentRow({
  item,
  onEdit,
  onEditImage,
  onDelete,
}: {
  item: { id: ID; gallery_id: ID; title: string; position: number; image_url?: string };
  onEdit: (patch: { title?: string; position?: number }) => void;
  onEditImage: (file: File | null | undefined) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [position, setPosition] = useState<number | ''>(item.position ?? '');

  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t">
      <td>{String(item.id)}</td>
      <td>
        {item.image_url ? (
          <img src={item.image_url} alt="" className="h-10 w-10 object-cover rounded-md border" />
        ) : (
          <span className="text-xs text-muted-foreground">No image</span>
        )}
      </td>
      <td>
        <input
          className="rounded-lg border px-2 py-1 text-sm w-48"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </td>
      <td>
        <input
          className="rounded-lg border px-2 py-1 text-sm w-24"
          type="number"
          value={position}
          onChange={(e) => setPosition(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </td>
      <td className="space-x-2">
        <button
          onClick={() => onEdit({ title, position: Number(position || 0) })}
          className="rounded-lg border px-2 py-1 hover:bg-zinc-50"
        >
          Save
        </button>

        <label className="rounded-lg border px-2 py-1 hover:bg-zinc-50 cursor-pointer">
          <input
            className="hidden"
            type="file"
            accept="image/*"
            onChange={(e) => onEditImage(e.target.files?.[0])}
          />
          Change image
        </label>

        <button onClick={onDelete} className="rounded-lg border px-2 py-1 hover:bg-red-50 text-red-600">
          Delete
        </button>
      </td>
    </tr>
  );
}
