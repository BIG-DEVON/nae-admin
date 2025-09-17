import { useSapperGenerals, useSapperGeneralsMutations } from '../hooks/useSapper';
import { useState } from 'react';

type Row = { id: number|string; title: string; content?: string; position: number; image?: string };

function toArray<T=unknown>(input:unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === 'object') { for (const k of ['data','results','items']) {
    const v = (input as any)[k]; if (Array.isArray(v)) return v as T[];
  } }
  return [];
}

export default function SapperGenerals() {
  const { data, isLoading, isError, refetch } = useSapperGenerals();
  const { create, update, updateImage, remove } = useSapperGeneralsMutations();
  const rows = toArray<Row>(data);

  const [f, setF] = useState<{title:string; content:string; position:number; image: File|null}>({
    title:'', content:'', position: (rows.at(-1)?.position ?? 0) + 1, image: null
  });

  const onCreate = async () => {
    if (!f.title || !f.image) return alert('Title + image required');
    await create.mutateAsync({ title: f.title, content: f.content, position: Number(f.position), image: f.image });
    setF({ title:'', content:'', position:(rows.at(-1)?.position ?? 0) + 1, image:null });
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Sapper Generals</h1>

      {/* Create */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="grid md:grid-cols-4 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Title" value={f.title} onChange={(e)=>setF(s=>({ ...s, title:e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Position" type="number" value={f.position} onChange={(e)=>setF(s=>({ ...s, position:Number(e.target.value) }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Content" value={f.content} onChange={(e)=>setF(s=>({ ...s, content:e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" type="file" onChange={(e)=>setF(s=>({ ...s, image: e.target.files?.[0] ?? null }))} />
          <button onClick={onCreate} className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Create</button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/60"><tr className="[&>th]:px-3 [&>th]:py-2 text-left"><th>ID</th><th>Title</th><th>Pos</th><th>Content</th><th>Image</th><th>Actions</th></tr></thead>
          <tbody>
            {isLoading && <tr><td className="px-3 py-3" colSpan={6}>Loading…</td></tr>}
            {isError && <tr><td className="px-3 py-3 text-red-600" colSpan={6}>Failed to load.</td></tr>}
            {rows.map((r)=> <Row key={String(r.id)} item={r} refetch={refetch} /> )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ item, refetch }:{ item: Row; refetch: ()=>void }) {
  const { update, updateImage, remove } = useSapperGeneralsMutations();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState<Partial<Row>>({ ...item });

  const save = async () => {
    await update.mutateAsync({ general_id: item.id, title:f.title, content:f.content, position:Number(f.position ?? 0) });
    setEdit(false); refetch();
  };

  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t">
      <td>{String(item.id)}</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-48" defaultValue={item.title} onChange={(e)=>setF(s=>({ ...s, title:e.target.value }))}/> : item.title}</td>
      <td>{edit ? <input type="number" className="border rounded-lg px-2 py-1 w-24" defaultValue={item.position} onChange={(e)=>setF(s=>({ ...s, position:Number(e.target.value) }))}/> : item.position}</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-64" defaultValue={item.content||''} onChange={(e)=>setF(s=>({ ...s, content:e.target.value }))}/> : (item.content||'—')}</td>
      <td className="w-64">
        <label className="inline-flex items-center gap-2">
          <span className="text-xs">Change image:</span>
          <input type="file" onChange={async (e)=>{ const file = e.target.files?.[0]; if(!file) return; await updateImage.mutateAsync({ general_id:item.id, image:file }); refetch(); }} />
        </label>
      </td>
      <td className="space-x-2">
        {edit ? (
          <>
            <button onClick={save} className="rounded-lg border px-2 py-1 hover:bg-zinc-50">Save</button>
            <button onClick={()=>setEdit(false)} className="rounded-lg border px-2 py-1 hover:bg-zinc-50">Cancel</button>
          </>
        ) : (
          <>
            <button onClick={()=>setEdit(true)} className="rounded-lg border px-2 py-1 hover:bg-zinc-50">Edit</button>
            <button onClick={async ()=>{ if(!confirm('Delete general?')) return; await remove.mutateAsync(item.id); refetch(); }} className="rounded-lg border px-2 py-1 hover:bg-red-50 text-red-600">Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}
