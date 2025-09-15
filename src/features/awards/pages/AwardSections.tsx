import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useAwardSections } from '../hooks/useAwardSections';
import { useAwardSectionMutations } from '../hooks/useAwardSectionMutations';

// normalize helper (works with [], {data:[]}, {results:[]}, {items:[]})
function toArray<T = unknown>(input: unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    for (const k of ['data', 'results', 'items']) {
      const v = obj[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

type SectionRow = { id: number | string; award_id: number | string; title: string; position: number };

export default function AwardSections() {
  const [params] = useSearchParams();
  const awardParam = params.get('award_id');
  const awardId = awardParam ? Number(awardParam) : NaN;

  if (!awardParam || Number.isNaN(awardId)) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-red-600">Missing or invalid <code>award_id</code> query parameter.</p>
        <Link to="/awards" className="inline-flex rounded-lg border px-3 py-1.5 text-sm">Back to Awards</Link>
      </div>
    );
  }

  const { data, isLoading, isError, refetch } = useAwardSections(awardId);
  const items = toArray<SectionRow>(data);

  const { createSection, updateSection, deleteSection } = useAwardSectionMutations(awardId);

  const [title, setTitle] = useState('');
  const [position, setPosition] = useState<number | ''>('');

  const onCreate = async () => {
    if (!title) return alert('Title required');
    await createSection.mutateAsync({ award_id: awardId, title, position: Number(position || 0) });
    setTitle(''); setPosition('');
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Award Sections</h1>
        <div className="space-x-2">
          <Link to="/awards" className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50">← Back</Link>
        </div>
      </div>

      {/* Create */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="text-sm font-medium">Create section for Award #{awardId}</div>
        <div className="grid gap-3 md:grid-cols-3">
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
          <button onClick={onCreate} className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">
            Create
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/60">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>ID</th>
              <th>Title</th>
              <th>Position</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td className="px-3 py-3" colSpan={4}>Loading…</td></tr>
            )}
            {isError && (
              <tr><td className="px-3 py-3 text-red-600" colSpan={4}>Failed to load.</td></tr>
            )}
            {items.map((s) => (
              <Row
                key={String(s.id)}
                item={s}
                onSave={async (patch) => {
                  await updateSection.mutateAsync({ section_id: s.id, award_id: awardId, ...patch });
                  refetch();
                }}
                onDelete={async () => {
                  if (!confirm('Delete section?')) return;
                  await deleteSection.mutateAsync(s.id);
                  refetch();
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  item, onSave, onDelete,
}: {
  item: SectionRow;
  onSave: (patch: { title?: string; position?: number }) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [position, setPosition] = useState<number | ''>(item.position);

  return (
    <tr className="[&>td]:px-3 [&>td]:py-2 border-t">
      <td>{String(item.id)}</td>
      <td>
        <input
          className="rounded-lg border px-2 py-1 text-sm w-64"
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
          onClick={() => onSave({ title, position: Number(position || 0) })}
          className="rounded-lg border px-2 py-1 hover:bg-zinc-50"
        >
          Save
        </button>
        <Link
          to={`/awards/contents?section_id=${item.id}`}
          className="rounded-lg border px-2 py-1 hover:bg-zinc-50"
        >
          Contents
        </Link>
        <button
          onClick={onDelete}
          className="rounded-lg border px-2 py-1 hover:bg-red-50 text-red-600"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}



// import { useSearchParams } from 'react-router-dom';
// import { useAwardSections } from '../hooks/useAwardSections';
// import { useAwardContents } from '../hooks/useAwardContents';
// import { useAwardMutations } from '../hooks/useAwardMutations';
// import { useState } from 'react';
// import type { ID } from '@/features/gallery/types';

// export default function AwardSections() {
//   const [sp] = useSearchParams();
//   const awardId = sp.get('award_id');

//   const { data: sections, isLoading, isError, refetch } = useAwardSections(awardId);
//   const { createSection, updateSection, deleteSection } = useAwardMutations();

//   const [title, setTitle] = useState('');
//   const [position, setPosition] = useState<number | ''>('');

//   const onCreate = async () => {
//     if (!awardId) return alert('No award id');
//     if (!title) return alert('Title required');
//     await createSection.mutateAsync({ award_id: awardId, title, position: Number(position || 0) });
//     setTitle(''); setPosition('');
//     refetch();
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">Award Sections</h1>
//         <div className="text-sm text-muted-foreground">Award ID: {awardId ?? '—'}</div>
//       </div>

//       {/* Create section */}
//       <div className="rounded-xl border p-4 space-y-3">
//         <div className="text-sm font-medium">Create section</div>
//         <div className="grid gap-3 md:grid-cols-3">
//           <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Title"
//             value={title} onChange={e=>setTitle(e.target.value)} />
//           <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Position" type="number"
//             value={position} onChange={e=>setPosition(e.target.value===''?'':Number(e.target.value))} />
//           <button onClick={onCreate} className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">
//             Create
//           </button>
//         </div>
//       </div>

//       {/* Sections */}
//       <div className="rounded-xl border overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead className="bg-zinc-50/60">
//             <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
//               <th>ID</th><th>Title</th><th>Position</th><th>Contents</th><th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {isLoading && <tr><td className="px-3 py-3" colSpan={5}>Loading…</td></tr>}
//             {isError && <tr><td className="px-3 py-3 text-red-600" colSpan={5}>Failed to load.</td></tr>}
//             {sections?.map((s)=>(
//               <SectionRow key={String(s.id)} section={s} onSave={async (patch)=>{
//                 if (!awardId) return;
//                 await updateSection.mutateAsync({ section_id: s.id, award_id: awardId, ...patch });
//                 refetch();
//               }} onDelete={async ()=>{
//                 if (!confirm('Delete section?')) return;
//                 await deleteSection.mutateAsync(s.id);
//                 refetch();
//               }} />
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// function SectionRow({
//   section, onSave, onDelete,
// }: {
//   section: { id: ID; award_id: ID; title: string; position: number };
//   onSave: (patch: { title?: string; position?: number }) => void;
//   onDelete: () => void;
// }) {
//   const [title, setTitle] = useState(section.title);
//   const [position, setPosition] = useState<number | ''>(section.position);

//   const { data: contents, refetch } = useAwardContents(section.id);
//   const { createContent, updateContent, deleteContent } = useAwardMutations();

//   // create content state (light)
//   const [rank, setRank] = useState(''); const [name, setName] = useState('');
//   const [positionC, setPositionC] = useState<number | ''>('');

//   const onCreateContent = async () => {
//     await createContent.mutateAsync({
//       award_section_id: section.id,
//       position: Number(positionC || 0),
//       rank, name,
//     });
//     setRank(''); setName(''); setPositionC('');
//     refetch();
//   };

//   return (
//     <tr className="[&>td]:px-3 [&>td]:py-2 border-t align-top">
//       <td>{String(section.id)}</td>
//       <td>
//         <input className="rounded-lg border px-2 py-1 text-sm w-56"
//           value={title} onChange={e=>setTitle(e.target.value)} />
//       </td>
//       <td>
//         <input className="rounded-lg border px-2 py-1 text-sm w-24" type="number"
//           value={position} onChange={e=>setPosition(e.target.value===''?'':Number(e.target.value))} />
//       </td>
//       <td className="w-[560px]">
//         {/* create content */}
//         <div className="mb-2 grid gap-2 md:grid-cols-4">
//           <input className="rounded-lg border px-2 py-1 text-sm" placeholder="Rank"
//                  value={rank} onChange={e=>setRank(e.target.value)} />
//           <input className="rounded-lg border px-2 py-1 text-sm" placeholder="Name"
//                  value={name} onChange={e=>setName(e.target.value)} />
//           <input className="rounded-lg border px-2 py-1 text-sm" placeholder="Position" type="number"
//                  value={positionC} onChange={e=>setPositionC(e.target.value===''?'':Number(e.target.value))} />
//           <button onClick={onCreateContent} className="rounded-lg border px-2 py-1 hover:bg-zinc-50">
//             Add content
//           </button>
//         </div>

//         {/* list contents */}
//         <div className="space-y-2">
//           {contents?.map((c)=>(
//             <ContentRow key={String(c.id)} item={c}
//               onSave={async (patch)=>{
//                 await updateContent.mutateAsync({ content_id: c.id, award_section_id: section.id, ...patch });
//                 refetch();
//               }}
//               onDelete={async ()=>{
//                 if (!confirm('Delete content?')) return;
//                 await deleteContent.mutateAsync(c.id);
//                 refetch();
//               }} />
//           ))}
//           {!contents?.length && <div className="text-xs text-muted-foreground">No contents</div>}
//         </div>
//       </td>
//       <td className="space-x-2">
//         <button onClick={()=>onSave({ title, position: Number(position||0) })}
//                 className="rounded-lg border px-2 py-1 hover:bg-zinc-50">Save</button>
//         <button onClick={onDelete}
//                 className="rounded-lg border px-2 py-1 hover:bg-red-50 text-red-600">Delete</button>
//       </td>
//     </tr>
//   );
// }

// function ContentRow({
//   item, onSave, onDelete,
// }: {
//   item: { id: ID; position: number; rank?: string; name?: string };
//   onSave: (patch: { position?: number; rank?: string; name?: string }) => void;
//   onDelete: () => void;
// }) {
//   const [rank, setRank] = useState(item.rank ?? '');
//   const [name, setName] = useState(item.name ?? '');
//   const [position, setPosition] = useState<number | ''>(item.position);

//   return (
//     <div className="flex items-center gap-2">
//       <span className="text-xs w-10">#{String(item.id)}</span>
//       <input className="rounded-lg border px-2 py-1 text-sm w-28" placeholder="Rank" value={rank} onChange={e=>setRank(e.target.value)} />
//       <input className="rounded-lg border px-2 py-1 text-sm w-44" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
//       <input className="rounded-lg border px-2 py-1 text-sm w-24" type="number"
//              value={position} onChange={e=>setPosition(e.target.value===''?'':Number(e.target.value))} />
//       <button onClick={()=>onSave({ rank, name, position: Number(position||0) })}
//               className="rounded-lg border px-2 py-1 hover:bg-zinc-50">Save</button>
//       <button onClick={onDelete}
//               className="rounded-lg border px-2 py-1 hover:bg-red-50 text-red-600">Delete</button>
//     </div>
//   );
// }
