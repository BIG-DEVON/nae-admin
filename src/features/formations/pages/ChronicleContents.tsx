import { Link, useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useChronicleContents } from '../hooks/useChronicles';
import { useChronicleContentMutations } from '../hooks/useChronicles';

type Row = {
  id: number|string; section_id: number|string; position: number;
  rank?: string; name?: string; number?: string; year?: string; appointment?: string;
};

function toArray<T=unknown>(input:unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === 'object') { for (const k of ['data','results','items']) {
    const v = (input as any)[k]; if (Array.isArray(v)) return v as T[]; } }
  return [];
}

export default function ChronicleContents() {
  const [sp] = useSearchParams();
  const sectionId = sp.get('section_id');
  if (!sectionId) return <div className="p-6 text-red-600">Missing <code>section_id</code></div>;

  const { data, isLoading, isError, refetch } = useChronicleContents(sectionId);
  const { create, update, remove } = useChronicleContentMutations();
  const rows = useMemo<Row[]>(()=>toArray<Row>(data), [data]);

  // create
  const [c, setC] = useState<Partial<Row>>({
    position: (rows.at(-1)?.position ?? 0) + 1, rank:'', name:'', number:'', year:'', appointment:''
  });

  const onCreate = async () => {
    await create.mutateAsync({
      section_id: Number(sectionId),
      position: Number(c.position ?? 0),
      rank: c.rank || '', name: c.name || '', number: c.number || '', year: c.year || '', appointment: c.appointment || ''
    });
    setC({ position: (rows.at(-1)?.position ?? 0) + 1 }); refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chronicle Contents</h1>
        <Link to="/formations/chronicles" className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50">← Back</Link>
      </div>

      {/* create */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-medium">Create content</div>
        <div className="grid md:grid-cols-6 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Position" type="number"
                 value={c.position ?? 0} onChange={(e)=>setC(s=>({ ...s, position:Number(e.target.value) }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Rank" value={c.rank||''} onChange={(e)=>setC(s=>({ ...s, rank:e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Name" value={c.name||''} onChange={(e)=>setC(s=>({ ...s, name:e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Number" value={c.number||''} onChange={(e)=>setC(s=>({ ...s, number:e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Year" value={c.year||''} onChange={(e)=>setC(s=>({ ...s, year:e.target.value }))} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Appointment" value={c.appointment||''} onChange={(e)=>setC(s=>({ ...s, appointment:e.target.value }))} />
          <button onClick={onCreate} className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">Create</button>
        </div>
      </div>

      {/* list */}
      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/60">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>Pos</th><th>Rank</th><th>Name</th><th>Number</th><th>Year</th><th>Appointment</th><th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td className="px-3 py-3" colSpan={7}>Loading…</td></tr>}
            {isError && <tr><td className="px-3 py-3 text-red-600" colSpan={7}>Failed to load.</td></tr>}
            {rows.map((r)=> <Row key={String(r.id)} item={r} refetch={refetch} /> )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ item, refetch }:{ item: Row; refetch: ()=>void }) {
  const { update, remove } = useChronicleContentMutations();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState<Partial<Row>>(item);

  const save = async () => {
    await update.mutateAsync({
      content_id: item.id, section_id: item.section_id,
      position: Number(f.position ?? 0), rank:f.rank||'', name:f.name||'',
      number:f.number||'', year:f.year||'', appointment:f.appointment||'',
    });
    setEdit(false); refetch();
  };

  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t">
      <td className="w-20">{edit ? <input type="number" className="border rounded-lg px-2 py-1 w-20" defaultValue={item.position} onChange={(e)=>setF(s=>({ ...s, position:Number(e.target.value) }))} /> : item.position }</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-28" defaultValue={item.rank||''} onChange={(e)=>setF(s=>({ ...s, rank:e.target.value }))}/> : (item.rank||'—')}</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-40" defaultValue={item.name||''} onChange={(e)=>setF(s=>({ ...s, name:e.target.value }))}/> : (item.name||'—')}</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-32" defaultValue={item.number||''} onChange={(e)=>setF(s=>({ ...s, number:e.target.value }))}/> : (item.number||'—')}</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-28" defaultValue={item.year||''} onChange={(e)=>setF(s=>({ ...s, year:e.target.value }))}/> : (item.year||'—')}</td>
      <td>{edit ? <input className="border rounded-lg px-2 py-1 w-40" defaultValue={item.appointment||''} onChange={(e)=>setF(s=>({ ...s, appointment:e.target.value }))}/> : (item.appointment||'—')}</td>
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
