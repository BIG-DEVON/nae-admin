// src/features/formations/pages/Formations.tsx
import { Link } from "react-router-dom";
import { ROUTES } from "@/app/routes/paths";

type Item = {
  title: string;
  desc: string;
  to: string; // ← ensure Link receives a string (not a union that might include a function type)
};

export default function Formations() {
  const items: Item[] = [
    {
      title: "Chronicles",
      desc: "Create and manage Chronicles (top-level).",
      to: String(ROUTES.formationsChronicles),
    },
    {
      title: "Chronicle Sections",
      desc: "Sections that belong to a Chronicle (needs ?chronicles_id=...).",
      to: String(ROUTES.formationsChronicleSections),
    },
    {
      title: "Chronicle Contents",
      desc: "Entries in a Chronicle Section (needs ?section_id=...).",
      to: String(ROUTES.formationsChronicleContents),
    },
    {
      title: "Sapper Generals",
      desc: "Manage Sapper Generals (text + image).",
      to: String(ROUTES.formationsSapperGenerals),
    },
    {
      title: "Sapper Chronicles",
      desc: "Top-level Sapper Chronicles (with sub-contents).",
      to: String(ROUTES.formationsSapperChronicles),
    },
    {
      title: "Sapper Chronicles Contents",
      desc: "Entries under a Sapper Chronicle (needs ?section_id=...).",
      to: String(ROUTES.formationsSapperChroniclesContents),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Formations</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Pick a module to work with. Some pages expect query params (you’ll land there from the parent table).
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.title}
            to={it.to}
            className="block rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="text-base font-medium text-neutral-900">{it.title}</div>
            <div className="mt-1 text-sm text-neutral-600">{it.desc}</div>
            <div className="mt-3 inline-flex text-sm font-medium text-brand-700">
              Open →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
