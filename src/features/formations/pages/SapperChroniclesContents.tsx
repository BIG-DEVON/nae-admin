import { Link, useSearchParams } from 'react-router-dom';
import { useSapperChroniclesContents, useSapperChroniclesContentMutations } from '../hooks/useSapper';
import { useMemo, useState } from 'react';

type Row = {
  id: number|string; position: number; chronicles_id?: number|string;
  pno?: string; rank?: string; name?: string; doc?: string; noneffdate?: string;
  cadetcse?: string; commtype?: string; status?: string; remark?: string; duration?: string;
};

function toArray<T=unknown>(input:unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === 'object') { for (const k of ['data','results','items']) {
    const v = (input as any)[k]; if (Array.isArray(v)) return v as T[]; } }
  return [];
}

export default function SapperChroniclesContents() {
  const [sp] = useSearchParams();
  const sectionId = sp.get('section_id'); // using section_id per GET API
  if (!sectionId) return <div className="p-6 text-red-600">Missing <code>section_id</code></div>;

  const { data, isLoading, isError, refetch } = useSapperChroniclesContents(sectionId);
  const { create, update, remove } = useSapperChroniclesContentMutations();
  const rows = useMemo<Row[]>(()=>toArray<Row>(data), [data]);

  const [c, setC] = useState<Partial<Row>>({ position:(rows.at(-1)?.position ?? 0) + 1 });

  const onCreate = async () => {
    // NOTE: admin create expects chronicles_id; we pass the same ID we used as section_id
    await create.mutateAsync({ chronicles_id: Number(sectionId), position:Number(c.position ?? 0),
      pno:c.pno||'', rank:c.rank||'', name:c.name||'', doc:c.doc||'', noneffdate:c.noneffdate||'',
      cadetcse:c.cadetcse||'', commtype:c.commtype||'', status:c.status||'', remark:c.remark||'', duration:c.duration||'' });
    setC({ position:(rows.at(-1)?.position ?? 0) + 1 }); refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sapper Chronicles – Contents</h1>
        <Link to="/formations/sapper-chronicles" className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50">← Back</Link>
      </div>

      {/* Create */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="grid md:grid-cols-4 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" type="number" placeholder="Position" value={c.position ?? 0} onChange={(e)=>setC(s=>({ ...s, position:Number(e.target.value) }))}/>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="PNO" value={c.pno||''} onChange={(e)=>setC(s=>({ ...s, pno:e.target.value }))}/>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Rank" value={c.rank||''} onChange={(e)=>setC(s=>({ ...s, rank:e.target.value }))}/>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Name" value={c.name||''} onChange={(e)=>setC(s=>({ ...s, name:e.target.value }))}/>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="DOC" value={c.doc||''} onChange={(e)=>setC(s=>({ ...s, doc:e.target.value }))}/>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Non Eff Date" value={c.noneffdate||''} onChange={(e)=>setC(s=>({ ...s, noneffdate:e.target.value }))}/>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Cadet Cse" value={c.cadetcse||''} onChange={(e)=>setC(s=>({ ...s, cadetcse:e.target.value }))}/>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Comm Type" value={c.commtype||''} onChange={(e)=>setC(s=>({ ...s, commtype:e.target.value }))}/>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Status" value={c.status||''} onChange={(e)=>setC(s=>({ ...s, status:e.target.value }))}/>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Remark" value={c.remark||''} onChange={(e)=>setC(s=>({ ...s, remark:e.target.value }))}/>
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Duration" value={c.duration||''} onChange={(e)=>setC(s=>({ ...s, duration:e.target.value }))}/>
          <button onClick={onCreate} className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Create</button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/60">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left"><th>Pos</th><th>PNO</th><th>Rank</th><th>Name</th><th>DOC</th><th>Status</th><th>Remark</th><th>Duration</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td className="px-3 py-3" colSpan={9}>Loading…</td></tr>}
            {isError && <tr><td className="px-3 py-3 text-red-600" colSpan={9}>Failed to load.</td></tr>}
            {rows.map((r)=> <Row key={String(r.id)} item={r} sectionId={sectionId!} refetch={refetch} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ item, sectionId, refetch }:{ item: Row; sectionId: string; refetch: ()=>void }) {
  const { update, remove } = useSapperChroniclesContentMutations();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState<Partial<Row>>(item);

  const save = async () => {
    await update.mutateAsync({ content_id:item.id, chronicles_id:Number(sectionId), position:Number(f.position ?? 0),
      pno:f.pno||'', rank:f.rank||'', name:f.name||'', doc:f.doc||'', noneffdate:f.noneffdate||'',
      cadetcse:f.cadetcse||'', commtype:f.commtype||'', status:f.status||'', remark:f.remark||'', duration:f.duration||'' });
    setEdit(false); refetch();
  };

  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t">
      <td className="w-20">{edit ? <input type="number" className="border rounded-lg px-2 py-1 w-20" defaultValue={item.position} onChange={(e)=>setF(s=>({ ...s, position:Number(e.target.value) }))}/> : item.position}</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-32" defaultValue={item.pno||''} onChange={(e)=>setF(s=>({ ...s, pno:e.target.value }))}/> : (item.pno||'—')}</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-28" defaultValue={item.rank||''} onChange={(e)=>setF(s=>({ ...s, rank:e.target.value }))}/> : (item.rank||'—')}</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-40" defaultValue={item.name||''} onChange={(e)=>setF(s=>({ ...s, name:e.target.value }))}/> : (item.name||'—')}</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-32" defaultValue={item.doc||''} onChange={(e)=>setF(s=>({ ...s, doc:e.target.value }))}/> : (item.doc||'—')}</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-32" defaultValue={item.status||''} onChange={(e)=>setF(s=>({ ...s, status:e.target.value }))}/> : (item.status||'—')}</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-40" defaultValue={item.remark||''} onChange={(e)=>setF(s=>({ ...s, remark:e.target.value }))}/> : (item.remark||'—')}</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-28" defaultValue={item.duration||''} onChange={(e)=>setF(s=>({ ...s, duration:e.target.value }))}/> : (item.duration||'—')}</td>
      <td className="text-right">
        {edit ? (
          <div className="inline-flex gap-2">
            <button onClick={save} className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-zinc-50">Save</button>
            <button onClick={()=>setEdit(false)} className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-zinc-50">Cancel</button>
          </div>
        ) : (
          <div className="inline-flex gap-2">
            <button onClick={()=>setEdit(true)} className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-zinc-50">Edit</button>
            <button onClick={async ()=>{ if(!confirm('Delete row?')) return; await remove.mutateAsync(item.id); refetch(); }} className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-red-50 text-red-600">Delete</button>
          </div>
        )}
      </td>
    </tr>
  );
}
