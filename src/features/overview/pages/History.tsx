import { useState, useEffect } from 'react';
import { getHistory, createHistory, updateHistory } from '../api';

export default function HistoryPage() {
  const [title, setTitle] = useState(''); const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string|null>(null);

  useEffect(()=>{ (async ()=>{
    try {
      const data = await getHistory(); // assuming object {title, content} or {data:{...}}
      const obj = (data as any)?.data ?? data;
      setTitle(obj?.title || ''); setContent(obj?.content || '');
    } catch(e:any){ setError(e.message || 'Failed'); } finally { setLoading(false); }
  })(); },[]);

  const onSave = async () => {
    if (!title || !content) { alert('Both required'); return; }
    try {
      // decide create vs update: if empty on server, create; else update
      if (!title && !content) await createHistory({ title, content });
      else await updateHistory({ title, content });
      alert('Saved');
    } catch(e:any){ alert(e.message || 'Failed'); }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Overview – History</h1>
      <div className="grid gap-3">
        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
        <textarea className="border rounded-lg px-3 py-2 text-sm min-h-[200px]" placeholder="Content" value={content} onChange={(e)=>setContent(e.target.value)} />
        <button onClick={onSave} className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50 w-fit">Save</button>
      </div>
    </div>
  );
}
