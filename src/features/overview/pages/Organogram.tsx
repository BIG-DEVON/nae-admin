import { useEffect, useState } from 'react';
import { getOrganogram, createOrganogram, updateOrganogramImage, updateOrganogramPosition, deleteOrganogram } from '../api';

type Row = { id: number|string; position: number; image?: string };

export default function OrganogramPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [pos, setPos] = useState<number|''>(''); const [file, setFile] = useState<File|null>(null);

  const load = async () => { setRows(await getOrganogram() as any); };
  useEffect(()=>{ load(); },[]);

  const create = async () => {
    if (!file) return alert('Choose image');
    await createOrganogram({ position:Number(pos||0), image:file }); setPos(''); setFile(null); await load();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Overview – Organogram</h1>

      <div className="rounded-xl border p-4 grid md:grid-cols-4 gap-3">
        <input className="border rounded-lg px-3 py-2 text-sm" type="number" placeholder="Position" value={pos} onChange={(e)=>setPos(e.target.value===''?'':Number(e.target.value))}/>
        <input className="border rounded-lg px-3 py-2 text-sm" type="file" onChange={(e)=>setFile(e.target.files?.[0] ?? null)}/>
        <button onClick={create} className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Upload</button>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/60"><tr className="[&>th]:px-3 [&>th]:py-2 text-left"><th>ID</th><th>Pos</th><th>Image</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((r)=> <RowComp key={String(r.id)} item={r} reload={load} /> )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowComp({ item, reload }:{ item:Row; reload:()=>void }) {
  const [p, setP] = useState<number|''>(item.position);
  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t">
      <td>{String(item.id)}</td>
      <td><input type="number" className="border rounded-lg px-2 py-1 w-24" value={p} onChange={(e)=>setP(e.target.value===''?'':Number(e.target.value))}/></td>
      <td className="w-64">
        <input type="file" onChange={async (e)=>{ const f=e.target.files?.[0]; if(!f) return; await updateOrganogramImage({ organogram_id:item.id, image:f }); await reload(); }}/>
      </td>
      <td className="space-x-2">
        <button onClick={async ()=>{ await updateOrganogramPosition({ organogram_id:item.id, position:Number(p||0) }); await reload(); }} className="rounded-lg border px-2 py-1 hover:bg-zinc-50">Save</button>
        <button onClick={async ()=>{ if(!confirm('Delete image?')) return; await deleteOrganogram(item.id); await reload(); }} className="rounded-lg border px-2 py-1 hover:bg-red-50 text-red-600">Delete</button>
      </td>
    </tr>
  );
}
