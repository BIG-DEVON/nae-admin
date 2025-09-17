import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useChronicleSections, useChronicleSectionMutations } from '../hooks/useChronicles';

type Row = { id: number|string; chronicles_id: number|string; title: string; position: number };

function toArray<T=unknown>(input:unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === 'object') {
    for (const k of ['data','results','items']) { const v = (input as any)[k]; if (Array.isArray(v)) return v as T[]; }
  }
  return [];
}

export default function ChronicleSections() {
  const [sp] = useSearchParams();
  const id = sp.get('chronicles_id');
  if (!id) return <div className="p-6 text-red-600">Missing <code>chronicles_id</code></div>;

  const { data, isLoading, isError, refetch } = useChronicleSections(id);
  const { create, update, remove } = useChronicleSectionMutations();
  const items = toArray<Row>(data);

  const [title, setTitle] = useState('');
  const [position, setPosition] = useState<number|''>('');

  const onCreate = async () => {
    if (!title) return alert('Title required');
    await create.mutateAsync({ chronicles_id: Number(id), title, position: Number(position||0) });
    setTitle(''); setPosition(''); refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chronicle Sections</h1>
        <Link to="/formations/chronicles" className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50">← Back</Link>
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-medium">Create section</div>
        <div className="grid gap-3 md:grid-cols-3">
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Position" type="number"
                 value={position} onChange={(e)=>setPosition(e.target.value===''?'':Number(e.target.value))} />
          <button onClick={onCreate} className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Create</button>
        </div>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/60">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left"><th>ID</th><th>Title</th><th>Position</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td className="px-3 py-3" colSpan={4}>Loading…</td></tr>}
            {isError && <tr><td className="px-3 py-3 text-red-600" colSpan={4}>Failed to load.</td></tr>}
            {items.map((s)=>(
              <Row key={String(s.id)} item={s}
                onSave={async (patch)=>{ await update.mutateAsync({ section_id:s.id, chronicles_id:id, ...patch }); refetch(); }}
                onDelete={async ()=>{ if(!confirm('Delete section?')) return; await remove.mutateAsync(s.id); refetch(); }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ item, onSave, onDelete }:{
  item: Row; onSave:(p:{ title?:string; position?:number })=>void; onDelete:()=>void;
}) {
  const [title, setTitle] = useState(item.title);
  const [position, setPosition] = useState<number|''>(item.position);
  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t">
      <td>{String(item.id)}</td>
      <td><input className="rounded-lg border px-2 py-1 text-sm w-64" value={title} onChange={(e)=>setTitle(e.target.value)} /></td>
      <td><input className="rounded-lg border px-2 py-1 text-sm w-24" type="number" value={position}
                 onChange={(e)=>setPosition(e.target.value===''?'':Number(e.target.value))} /></td>
      <td className="space-x-2">
        <button onClick={()=>onSave({ title, position:Number(position||0) })} className="rounded-lg border px-2 py-1 hover:bg-zinc-50">Save</button>
        <Link to={`/formations/chronicles/contents?section_id=${item.id}`} className="rounded-lg border px-2 py-1 hover:bg-zinc-50">Contents</Link>
        <button onClick={onDelete} className="rounded-lg border px-2 py-1 hover:bg-red-50 text-red-600">Delete</button>
      </td>
    </tr>
  );
}
