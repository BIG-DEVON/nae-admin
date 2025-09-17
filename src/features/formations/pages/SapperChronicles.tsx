import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useSapperChronicles, useSapperChroniclesMutations } from '../hooks/useSapper';

type Row = { id: number|string; title: string; sub_title?: string; position: number };

function toArray<T=unknown>(input:unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === 'object') { for (const k of ['data','results','items']) {
    const v = (input as any)[k]; if (Array.isArray(v)) return v as T[]; } }
  return [];
}

export default function SapperChronicles() {
  const { data, isLoading, isError, refetch } = useSapperChronicles();
  const { create, update, remove } = useSapperChroniclesMutations();
  const items = toArray<Row>(data);

  const [t, setT] = useState(''); const [st, setST] = useState(''); const [p, setP] = useState<number|''>('');

  const onCreate = async () => {
    if (!t) return alert('title required');
    await create.mutateAsync({ title:t, sub_title:st || undefined, position:Number(p||0) });
    setT(''); setST(''); setP(''); refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sapper Chronicles</h1>
        <Link to="/formations/chronicles" className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50">← Back</Link>
      </div>

      <div className="rounded-xl border p-4 grid md:grid-cols-4 gap-3">
        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Title" value={t} onChange={(e)=>setT(e.target.value)} />
        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Sub title (optional)" value={st} onChange={(e)=>setST(e.target.value)} />
        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Position" type="number" value={p} onChange={(e)=>setP(e.target.value===''?'':Number(e.target.value))} />
        <button onClick={onCreate} className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Create</button>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/60"><tr className="[&>th]:px-3 [&>th]:py-2 text-left"><th>ID</th><th>Title</th><th>Sub</th><th>Pos</th><th>Actions</th></tr></thead>
          <tbody>
            {isLoading && <tr><td className="px-3 py-3" colSpan={5}>Loading…</td></tr>}
            {isError && <tr><td className="px-3 py-3 text-red-600" colSpan={5}>Failed to load.</td></tr>}
            {items.map((r)=>(
              <Row key={String(r.id)} item={r}
                onSave={async (patch)=>{ await update.mutateAsync({ chronicles_id:r.id, ...patch }); refetch(); }}
                onDelete={async ()=>{ if(!confirm('Delete?')) return; await remove.mutateAsync(r.id); refetch(); }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ item, onSave, onDelete }:{
  item: Row; onSave:(p:{ title?:string; sub_title?:string; position?:number })=>void; onDelete:()=>void;
}) {
  const [title, setTitle] = useState(item.title);
  const [sub, setSub] = useState(item.sub_title || '');
  const [pos, setPos] = useState<number|''>(item.position);

  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t">
      <td>{String(item.id)}</td>
      <td><input className="border rounded-lg px-2 py-1 text-sm w-64" value={title} onChange={(e)=>setTitle(e.target.value)} /></td>
      <td><input className="border rounded-lg px-2 py-1 text-sm w-48" value={sub} onChange={(e)=>setSub(e.target.value)} /></td>
      <td><input className="border rounded-lg px-2 py-1 text-sm w-24" type="number" value={pos}
                 onChange={(e)=>setPos(e.target.value===''?'':Number(e.target.value))} /></td>
      <td className="space-x-2">
        <button onClick={()=>onSave({ title, sub_title:sub || undefined, position:Number(pos||0) })} className="rounded-lg border px-2 py-1 hover:bg-zinc-50">Save</button>
        <Link to={`/formations/sapper-chronicles/contents?section_id=${item.id}`} className="rounded-lg border px-2 py-1 hover:bg-zinc-50">Contents</Link>
        <button onClick={onDelete} className="rounded-lg border px-2 py-1 hover:bg-red-50 text-red-600">Delete</button>
      </td>
    </tr>
  );
}
