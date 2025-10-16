// src/pages/Dashboard.tsx
import { Link } from "react-router-dom";
import {
  Image,
  Trophy,
  Layers3,
  BookOpen,
  ChevronRight,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";

import { useGalleries } from "@/features/gallery/hooks/useGalleries";
import { useAwards } from "@/features/awards/hooks/useAwards";
import {
  useOverviewOrganogram,
  useOverviewCommanders,
} from "@/features/overview/hooks/useOverview";
import RecentChanges from "@/components/RecentChanges";
import SmartRecommendations from "@/components/SmartRecommendations";

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

/* ------------------------------- Count Up --------------------------------- */
function useCountUp(target: number, deps: unknown[] = [], duration = 650) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = value; // animate from current to new for smoothness
    const to = Math.max(0, Number.isFinite(target) ? target : 0);

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // cubic ease-out
      setValue(Math.round(from + (to - from) * eased));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return value;
}

/* ---------------------------------- page ---------------------------------- */
export default function Dashboard() {
  // Live data
  const galleries = useGalleries();
  const awards = useAwards();
  const organo = useOverviewOrganogram(); // images list
  const commanders = useOverviewCommanders(); // commanders list

  // Formations combined count
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

  // Derived totals
  const overviewTotal = useMemo(
    () => safeCount(organo.query.data) + safeCount(commanders.query.data),
    [organo.query.data, commanders.query.data]
  );

  // Animated numbers
  const galleryVal = useCountUp(safeCount(galleries.data), [galleries.data]);
  const awardsVal = useCountUp(safeCount(awards.data), [awards.data]);
  const formationsVal = useCountUp(formationsCount ?? 0, [formationsCount]);
  const overviewVal = useCountUp(overviewTotal, [overviewTotal]);

  const stats = [
    {
      key: "gallery",
      label: "Gallery",
      to: "/gallery",
      icon: <Image className="h-5 w-5" />,
      value: galleryVal,
      subtitle: "albums",
      loading: galleries.isLoading,
    },
    {
      key: "awards",
      label: "Awards",
      to: "/awards",
      icon: <Trophy className="h-5 w-5" />,
      value: awardsVal,
      subtitle: "award groups",
      loading: awards.isLoading,
    },
    {
      key: "formations",
      label: "Formations",
      to: "/formations/chronicles",
      icon: <Layers3 className="h-5 w-5" />,
      value: formationsVal,
      subtitle: "chronicles • generals",
      loading: formationsLoading,
    },
    {
      key: "overview",
      label: "Overview",
      to: "/overview/history",
      icon: <BookOpen className="h-5 w-5" />,
      value: overviewVal,
      subtitle: "organogram + commanders",
      loading: organo.query.isLoading || commanders.query.isLoading,
    },
  ] as const;

  return (
    <div className="relative space-y-8">
      {/* Ambient gradient backdrop */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-x-0 -top-10 -z-10 h-[300px]
          bg-[radial-gradient(80%_50%_at_50%_0%,rgba(16,185,129,0.18),transparent_60%)]
        "
      />
      <div
        aria-hidden
        className="
          pointer-events-none absolute -right-24 top-24 -z-10 h-64 w-64 rounded-full
          bg-[conic-gradient(at_30%_30%,rgba(16,185,129,0.25),transparent_50%,rgba(59,130,246,0.15))]
          blur-2xl opacity-70
        "
      />

      <header className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border bg-white/60 px-3 py-1 text-xs backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-neutral-700">Welcome back</span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-600">
          Your control center for galleries, awards, formations and overview.
        </p>
      </header>

      {/* Quick actions */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction to="/gallery" label="New Gallery" />
        <QuickAction to="/awards" label="Add Award Group" />
        <QuickAction to="/overview/organogram" label="Upload Organogram" />
        <QuickAction to="/overview/commanders" label="Add Commander" />
      </section>

      {/* Stats */}
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.key}
            to={s.to}
            className="
              group relative rounded-2xl border bg-white/70 p-5 backdrop-blur-sm
              shadow-[0_1px_0_0_rgba(0,0,0,0.03),0_20px_40px_-24px_rgba(16,185,129,0.35)]
              transition
              hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_28px_60px_-26px_rgba(16,185,129,0.45)]
              focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60
            "
          >
            {/* glossy top sheen */}
            <span
              aria-hidden
              className="
                pointer-events-none absolute inset-x-0 top-0 h-8 rounded-t-2xl
                bg-[linear-gradient(to_bottom,rgba(255,255,255,0.65),transparent)]
              "
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="
                    rounded-xl border bg-white p-2.5 shadow-sm transition
                    group-hover:border-emerald-400/80 group-hover:shadow-emerald-100
                  "
                >
                  {s.icon}
                </div>
                <div className="font-medium">{s.label}</div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-80" />
            </div>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tabular-nums">
                {s.loading ? "…" : s.value.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-500">{s.subtitle}</span>
            </div>

            <div className="mt-3 text-xs text-neutral-500">
              {s.key === "formations"
                ? "Manage Chronicles, Sections, Generals, Sapper Chronicles."
                : `Open ${s.label.toLowerCase()} module`}
            </div>

            {/* green accent underline */}
            <span
              aria-hidden
              className="
                pointer-events-none absolute inset-x-4 bottom-1 h-[3px]
                scale-x-0 bg-emerald-500/90 transition-transform duration-200
                group-hover:scale-x-100 rounded-full
              "
            />
          </Link>
        ))}
      </section>

      {/* Recommendations + Activity */}
      <section className="grid gap-6 xl:grid-cols-3">
        <SmartRecommendations />
        <div className="xl:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border bg-white/70 p-5 shadow-sm backdrop-blur-sm">
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

            <RecentChanges />
          </div>
        </div>
      </section>
    </div>
  );
}

/* --------------------------- Quick Action chip ---------------------------- */
function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="
        group inline-flex items-center justify-between gap-3 rounded-xl border
        bg-white/70 px-4 py-3 text-sm shadow-sm backdrop-blur-sm
        transition hover:-translate-y-0.5 hover:bg-emerald-50/30
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60
      "
    >
      <span className="inline-flex items-center gap-2 font-medium">
        <PlusCircle className="h-4 w-4 opacity-80" />
        {label}
      </span>
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full bg-emerald-400 transition group-hover:scale-125"
      />
    </Link>
  );
}
