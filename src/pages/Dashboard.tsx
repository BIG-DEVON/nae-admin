// src/pages/Dashboard.tsx
import { Link } from "react-router-dom";
import { Image, Trophy, Layers3, BookOpen, ChevronRight } from "lucide-react";

import { useGalleries } from "@/features/gallery/hooks/useGalleries";
import { useAwards } from "@/features/awards/hooks/useAwards";
import {
  useOverviewOrganogram,
  useOverviewCommanders,
} from "@/features/overview/hooks/useOverview";
import RecentChanges from "@/components/RecentChanges";
import { useEffect, useMemo, useState } from "react";

/* --------------------------------- helpers -------------------------------- */
function safeCount(input: unknown): number {
  if (Array.isArray(input)) return input.length;
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    for (const k of ["data", "results", "items"]) {
      const v = obj[k];
      if (Array.isArray(v)) return v.length;
    }
  }
  return 0;
}

// Tiny fetcher just for counts (normalizes [], {data:[]}, {results:[]}, {items:[]})
async function fetchCount(path: string): Promise<number> {
  const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
  const token =
    (import.meta.env.VITE_API_TOKEN || localStorage.getItem("token") || "").trim();

  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: "include",
    });
    if (!res.ok) return 0;
    const json = await res.json();
    return safeCount(json);
  } catch {
    return 0;
  }
}

/* ---------------------------------- page ---------------------------------- */
export default function Dashboard() {
  // Live data
  const galleries = useGalleries();
  const awards = useAwards();
  const organo = useOverviewOrganogram();   // images list
  const commanders = useOverviewCommanders(); // commanders list

  // ---- Formations count (chronicles + sapper-generals + sapper-chronicles) ----
  const [formationsCount, setFormationsCount] = useState<number | null>(null);
  const [formationsLoading, setFormationsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFormationsLoading(true);
      const urls = [
        "/formations/chronicles/",
        "/formations/sapper-generals/",
        "/formations/sapper-chronicles/",
      ];
      const parts = await Promise.all(urls.map(fetchCount));
      const total = parts.reduce((a, b) => a + b, 0);
      if (!cancelled) {
        setFormationsCount(total);
        setFormationsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived numbers (memo to avoid flicker)
  const overviewTotal = useMemo(
    () => safeCount(organo.query.data) + safeCount(commanders.query.data),
    [organo.query.data, commanders.query.data]
  );

  const stats = [
    {
      label: "Gallery",
      to: "/gallery",
      icon: <Image className="h-5 w-5" />,
      count: safeCount(galleries.data),
      subtitle: "albums",
      loading: galleries.isLoading,
    },
    {
      label: "Awards",
      to: "/awards",
      icon: <Trophy className="h-5 w-5" />,
      count: safeCount(awards.data),
      subtitle: "award groups",
      loading: awards.isLoading,
    },
    {
      label: "Formations",
      to: "/formations/chronicles",
      icon: <Layers3 className="h-5 w-5" />,
      count: formationsCount ?? 0,
      subtitle: "chronicles • generals",
      loading: formationsLoading,
    },
    {
      label: "Overview",
      to: "/overview/history",
      icon: <BookOpen className="h-5 w-5" />,
      count: overviewTotal,
      subtitle: "organogram + commanders",
      loading: organo.query.isLoading || commanders.query.isLoading,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-600">
          Welcome to NAE Admin. Use the cards below to jump into each module.
        </p>
      </header>

      {/* Quick Links / Stats */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="
              group relative rounded-2xl border bg-white p-5
              shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_4px_16px_-8px_rgba(0,0,0,0.12)]
              ring-1 ring-black/0 transition
              hover:shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_14px_28px_-10px_rgba(16,185,129,0.35)]
              hover:ring-emerald-200/60 hover:bg-emerald-50/30
            "
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="
                    rounded-xl border bg-white p-2.5 
                    shadow-sm transition
                    group-hover:border-emerald-400 group-hover:shadow-emerald-100
                  "
                >
                  {s.icon}
                </div>
                <div className="font-medium">{s.label}</div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-80" />
            </div>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-3xl font-semibold">
                {s.loading ? "…" : s.count}
              </span>
              <span className="text-xs text-neutral-500">{s.subtitle}</span>
            </div>

            <div className="mt-3 text-xs text-neutral-500">
              {s.label === "Formations"
                ? "Manage Chronicles, Sections, Generals, Sapper Chronicles."
                : `Open ${s.label.toLowerCase()} module`}
            </div>

            {/* green accent stripe on hover */}
            <span
              className="
                pointer-events-none absolute inset-x-0 bottom-0 h-1 
                scale-x-0 bg-emerald-500 transition-transform duration-200
                group-hover:scale-x-100 rounded-b-2xl
              "
            />
          </Link>
        ))}
      </section>

      {/* Data Health / Tips / Activity */}
      <section className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="font-medium">Data refresh</div>
          <p className="mt-1 text-sm text-neutral-600">
            Lists auto-refresh when you create/update/delete items. Use the page
            actions for manual refetch.
          </p>
          <ul className="mt-3 text-sm list-disc pl-5 space-y-1 text-neutral-700">
            <li>Gallery → “Manage contents” inside each album</li>
            <li>Awards → Sections &amp; Contents per award</li>
            <li>Formations → Chronicles / Generals / Sapper</li>
            <li>Overview → History, Organogram, Commanders</li>
          </ul>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="font-medium">Recommended next steps</div>
          <ol className="mt-2 text-sm pl-4 list-decimal space-y-1 text-neutral-700">
            <li>
              Add a few Gallery banners from{" "}
              <Link
                to="/gallery/home"
                className="underline decoration-emerald-400 underline-offset-2 hover:text-emerald-700"
              >
                Home Gallery
              </Link>
              .
            </li>
            <li>Create Award sections and contents.</li>
            <li>Upload Organogram images and add Commanders.</li>
          </ol>
        </div>

        {/* Recent changes pulled from localStorage */}
        <RecentChanges />
      </section>
    </div>
  );
}
