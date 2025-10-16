// src/components/SmartRecommendations.tsx
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Image, Trophy, Layers3, BookOpen, PlusCircle } from "lucide-react";

import { useGalleries } from "@/features/gallery/hooks/useGalleries";
import { useAwards } from "@/features/awards/hooks/useAwards";
import {
  useOverviewOrganogram,
  useOverviewCommanders,
} from "@/features/overview/hooks/useOverview";

/* ------------------------------ util helpers ------------------------------ */

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

type Suggestion = {
  id: string;
  title: string;
  desc: string;
  to: string;
  icon: ReactNode; // ← fix: avoid JSX namespace by using ReactNode
  priority: number; // higher = more important
  cta?: string;
};

export default function SmartRecommendations() {
  // live counts we can derive from hooks
  const galleries = useGalleries();
  const awards = useAwards();
  const organo = useOverviewOrganogram();
  const commanders = useOverviewCommanders();

  const galleriesCount = safeCount(galleries.data);
  const awardsCount = safeCount(awards.data);
  const organoCount = safeCount(organo.query.data);
  const commandersCount = safeCount(commanders.query.data);

  // formations: combine a few endpoints into a single total
  const [formationsTotal, setFormationsTotal] = useState<number | null>(null);
  const [loadingFormations, setLoadingFormations] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingFormations(true);
      const urls = [
        "/formations/chronicles/",
        "/formations/sapper-generals/",
        "/formations/sapper-chronicles/",
      ];
      const parts = await Promise.all(urls.map(fetchCount));
      const total = parts.reduce((a, b) => a + b, 0);
      if (!cancelled) {
        setFormationsTotal(total);
        setLoadingFormations(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const suggestions = useMemo<Suggestion[]>(() => {
    const list: Suggestion[] = [];

    // 1) Zero-state suggestions (highest priority)
    if (galleriesCount === 0) {
      list.push({
        id: "create-gallery",
        title: "Create your first gallery",
        desc:
          "No albums found yet. Start by creating a gallery and uploading a hero image.",
        to: "/gallery",
        icon: <Image className="h-5 w-5" />,
        priority: 100,
        cta: "Create gallery",
      });
    }
    if (awardsCount === 0) {
      list.push({
        id: "create-awards",
        title: "Define award categories",
        desc:
          "Set up award groups and their sections so you can add recipients and content.",
        to: "/awards",
        icon: <Trophy className="h-5 w-5" />,
        priority: 95,
        cta: "Open Awards",
      });
    }
    if (organoCount === 0) {
      list.push({
        id: "upload-organogram",
        title: "Upload Organogram images",
        desc:
          "Add your organogram images to make the overview complete and engaging.",
        to: "/overview/organogram",
        icon: <BookOpen className="h-5 w-5" />,
        priority: 90,
        cta: "Add images",
      });
    }
    if (commandersCount === 0) {
      list.push({
        id: "add-commanders",
        title: "Add commanders",
        desc:
          "Introduce your commanders with photos and positions to enrich the overview.",
        to: "/overview/commanders",
        icon: <BookOpen className="h-5 w-5" />,
        priority: 88,
        cta: "Add commander",
      });
    }
    if (formationsTotal !== null && formationsTotal === 0) {
      list.push({
        id: "setup-formations",
        title: "Set up formations",
        desc:
          "Begin documenting chronicles, sapper generals, and sapper chronicles.",
        to: "/formations/chronicles",
        icon: <Layers3 className="h-5 w-5" />,
        priority: 85,
        cta: "Open Formations",
      });
    }

    // 2) Healthy-state nudges (medium priority)
    if (galleriesCount > 0 && galleriesCount < 3) {
      list.push({
        id: "grow-gallery",
        title: "Enrich the Gallery",
        desc:
          "You have a few albums — add more or populate existing ones with contents.",
        to: "/gallery",
        icon: <Image className="h-5 w-5" />,
        priority: 60,
        cta: "Open Gallery",
      });
    }
    if (commandersCount > 0 && organoCount === 0) {
      list.push({
        id: "pair-organogram",
        title: "Pair organogram with commanders",
        desc:
          "You’ve added commanders — upload organogram images to complete the story.",
        to: "/overview/organogram",
        icon: <BookOpen className="h-5 w-5" />,
        priority: 58,
        cta: "Upload images",
      });
    }
    if (awardsCount > 0 && awardsCount < 3) {
      list.push({
        id: "add-awards",
        title: "Add more award groups",
        desc:
          "Build out additional award categories and sections for richer recognition.",
        to: "/awards",
        icon: <Trophy className="h-5 w-5" />,
        priority: 55,
        cta: "Manage Awards",
      });
    }

    // 3) If nothing triggered, still show a “nice to do”
    if (list.length === 0) {
      list.push({
        id: "general-polish",
        title: "Polish content & visuals",
        desc:
          "Refresh images, confirm positions, and ensure modules have up-to-date info.",
        to: "/overview/history",
        icon: <PlusCircle className="h-5 w-5" />,
        priority: 20,
        cta: "Start with Overview",
      });
    }

    // sort by priority desc
    return list.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }, [galleriesCount, awardsCount, organoCount, commandersCount, formationsTotal]);

  const loading =
    galleries.isLoading ||
    awards.isLoading ||
    organo.query.isLoading ||
    commanders.query.isLoading ||
    loadingFormations;

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-medium">Recommended next steps</div>
        {loading && (
          <span className="text-xs rounded-full border px-2 py-1 text-neutral-600">
            Analysing…
          </span>
        )}
      </div>

      {/* list */}
      <ul className="mt-3 space-y-3">
        {suggestions.map((s) => (
          <li
            key={s.id}
            className="
              group relative rounded-xl border bg-white p-4
              transition hover:bg-emerald-50/30 hover:border-emerald-200/60
            "
          >
            <div className="flex items-start gap-3">
              <div
                className="
                  rounded-lg border bg-white p-2.5 shrink-0
                  group-hover:border-emerald-400 group-hover:shadow group-hover:shadow-emerald-100
                "
              >
                {s.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium">{s.title}</h4>
                <p className="text-sm text-neutral-600 mt-0.5">{s.desc}</p>
              </div>
              <Link
                to={s.to}
                className="
                  rounded-full border px-3 py-1.5 text-sm
                  hover:bg-emerald-50 hover:border-emerald-300
                "
              >
                {s.cta ?? "Open"}
              </Link>
            </div>

            {/* green accent bar */}
            <span
              className="
                pointer-events-none absolute inset-x-0 bottom-0 h-1
                scale-x-0 bg-emerald-500 transition-transform duration-200
                group-hover:scale-x-100 rounded-b-xl
              "
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
