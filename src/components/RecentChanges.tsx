// src/components/RecentChanges.tsx
import { useEffect, useState } from "react";
import { getActivity, clearActivity, type ActivityItem } from "@/lib/activity/log";

export default function RecentChanges() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setItems(getActivity());
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(refresh, 120); // tiny delay for shimmer effect
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-medium">Recent changes</div>
        <button
          className="text-xs rounded-full border px-3 py-1.5 hover:bg-neutral-50"
          onClick={() => {
            clearActivity();
            refresh();
          }}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <ul className="mt-3 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-5 w-full animate-pulse rounded bg-neutral-100" />
          ))}
        </ul>
      ) : items.length === 0 ? (
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
