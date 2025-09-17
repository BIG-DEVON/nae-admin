import { useEffect, useState } from 'react';
import { getCommanders, createCommander, updateCommander, updateCommanderImage, deleteCommander } from '../api';

type Row = { id:number|string; title:string; content?:string; position:number; image?:string };

export default function CommandersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const load = async ()=>{ setRows(await getCommanders() as any); };
  useEffect(()=>{ load(); },[]);

  const [f, setF] = useState<{ title:string; content:string; position:number|''; image: File|null }>({ title:'', content:'', position:'', image:null });

  const create = async () => {
    if (!f.title || !f.image) return alert('title + image required');
    await createCommander({ title:f.title, content:f.content, position:Number(f.position||0), image:f.image }); setF({ title:'', content:'', position:'', image:null }); await load();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Overview – Commanders</h1>

      <div className="rounded-xl border p-4 grid md:grid-cols-4 gap-3">
        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Title" value={f.title} onChange={(e)=>setF(s=>({ ...s, title:e.target.value }))}/>
        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Position" type="number" value={f.position} onChange={(e)=>setF(s=>({ ...s, position:e.target.value===''?'':Number(e.target.value) }))}/>
        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Content" value={f.content} onChange={(e)=>setF(s=>({ ...s, content:e.target.value }))}/>
        <input className="border rounded-lg px-3 py-2 text-sm" type="file" onChange={(e)=>setF(s=>({ ...s, image:e.target.files?.[0] ?? null }))}/>
        <button onClick={create} className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Create</button>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/60"><tr className="[&>th]:px-3 [&>th]:py-2 text-left"><th>ID</th><th>Title</th><th>Pos</th><th>Content</th><th>Image</th><th>Actions</th></tr></thead>
          <tbody>{rows.map((r)=><Row key={String(r.id)} item={r} reload={load} />)}</tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ item, reload }:{ item:Row; reload:()=>void }) {
  const [t, setT] = useState(item.title);
  const [c, setC] = useState(item.content||'');
  const [p, setP] = useState<number|''>(item.position);
  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t">
      <td>{String(item.id)}</td>
      <td><input className="border rounded-lg px-2 py-1 w-48" value={t} onChange={(e)=>setT(e.target.value)}/></td>
      <td><input type="number" className="border rounded-lg px-2 py-1 w-24" value={p} onChange={(e)=>setP(e.target.value===''?'':Number(e.target.value))}/></td>
      <td><input className="border rounded-lg px-2 py-1 w-64" value={c} onChange={(e)=>setC(e.target.value)}/></td>
      <td className="w-64"><input type="file" onChange={async (e)=>{ const f=e.target.files?.[0]; if(!f) return; await updateCommanderImage({ commander_id:item.id, image:f }); await reload(); }}/></td>
      <td className="space-x-2">
        <button onClick={async ()=>{ await updateCommander({ commander_id:item.id, title:t, content:c, position:Number(p||0) }); await reload(); }} className="rounded-lg border px-2 py-1 hover:bg-zinc-50">Save</button>
        <button onClick={async ()=>{ if(!confirm('Delete commander?')) return; await deleteCommander(item.id); await reload(); }} className="rounded-lg border px-2 py-1 hover:bg-red-50 text-red-600">Delete</button>
      </td>
    </tr>
  );
}
