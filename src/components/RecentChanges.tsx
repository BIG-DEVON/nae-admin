// src/components/RecentChanges.tsx
import { useEffect, useState } from "react";
import { getActivity, clearActivity, type ActivityItem } from "@/lib/activity/log";

export default function RecentChanges() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  const refresh = () => setItems(getActivity());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">Recent changes</div>
        <button
          className="text-xs rounded-md border px-2 py-1 hover:bg-neutral-50"
          onClick={() => { clearActivity(); refresh(); }}
        >
          Clear
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-600">No recent activity yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.slice(0, 10).map((it) => (
            <li key={it.id} className="text-sm flex items-start justify-between gap-3">
              <div>
                <span className="font-medium">{it.area}</span>{" "}
                <span className="text-neutral-700">{it.message}</span>
              </div>
              <time className="text-xs text-neutral-500 whitespace-nowrap">
                {new Date(it.ts).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
