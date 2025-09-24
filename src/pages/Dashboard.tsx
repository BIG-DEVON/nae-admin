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

export default function Dashboard() {
  // Live data (just to show some useful numbers)
  const galleries = useGalleries();
  const awards = useAwards();
  const organo = useOverviewOrganogram(); // images list
  const commanders = useOverviewCommanders(); // commanders list

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
      // we don’t have an easy single count; show “—” and keep it a link
      count: NaN,
      subtitle: "chronicles, generals",
      loading: false,
    },
    {
      label: "Overview",
      to: "/overview/history",
      icon: <BookOpen className="h-5 w-5" />,
      count:
        safeCount(organo.query.data) + safeCount(commanders.query.data),
      subtitle: "organogram + commanders",
      loading:
        organo.query.isLoading || commanders.query.isLoading,
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-neutral-600">
          Welcome to NAE Admin. Use the cards below to jump into each module.
        </p>
      </header>

      {/* Quick Links / Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group rounded-2xl border p-4 hover:bg-neutral-50 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg border bg-white p-2">{s.icon}</div>
                <div className="font-medium">{s.label}</div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-60 group-hover:translate-x-0.5 transition" />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-semibold">
                {s.loading ? "…" : Number.isNaN(s.count) ? "—" : s.count}
              </span>
              <span className="text-xs text-neutral-500">{s.subtitle}</span>
            </div>

            <div className="mt-3 text-xs text-neutral-500">
              {s.label === "Formations"
                ? "Manage Chronicles, Sections, Generals, Sapper Chronicles."
                : `Open ${s.label.toLowerCase()} module`}
            </div>
          </Link>
        ))}
      </section>

      {/* Data Health / Tips / Activity */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border p-4">
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

        <div className="rounded-2xl border p-4">
          <div className="font-medium">Recommended next steps</div>
          <ol className="mt-2 text-sm pl-4 list-decimal space-y-1 text-neutral-700">
            <li>
              Add a few Gallery banners from{" "}
              <Link to="/gallery/home" className="underline">
                Home Gallery
              </Link>
              .
            </li>
            <li>Create Award sections and contents.</li>
            <li>Upload Organogram images and add Commanders.</li>
          </ol>
        </div>

        {/* New: Recent changes pulled from localStorage */}
        <RecentChanges />
      </section>
    </div>
  );
}
