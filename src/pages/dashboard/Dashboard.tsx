// src/pages/dashboard/Dashboard.tsx
import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="space-y-8 p-6">
      {/* Page header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Quick overview and shortcuts.
        </p>
      </header>

      {/* Stats (pure Tailwind, no external Card component) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-background p-4">
          <div className="text-sm text-muted-foreground">Galleries</div>
          <div className="mt-2 text-3xl font-bold">—</div>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <div className="text-sm text-muted-foreground">Awards</div>
          <div className="mt-2 text-3xl font-bold">—</div>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <div className="text-sm text-muted-foreground">Formations</div>
          <div className="mt-2 text-3xl font-bold">—</div>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <div className="text-sm text-muted-foreground">Overview Items</div>
          <div className="mt-2 text-3xl font-bold">—</div>
        </div>
      </section>

      {/* Quick links */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/gallery"
          className="rounded-xl border p-4 transition-colors hover:bg-accent"
        >
          <h3 className="font-medium">Manage Gallery</h3>
          <p className="text-sm text-muted-foreground">
            Create, update and reorder images.
          </p>
        </Link>

        <Link
          to="/awards"
          className="rounded-xl border p-4 transition-colors hover:bg-accent"
        >
          <h3 className="font-medium">Manage Awards</h3>
          <p className="text-sm text-muted-foreground">
            Sections and contents for awards.
          </p>
        </Link>

        <Link
          to="/formations"
          className="rounded-xl border p-4 transition-colors hover:bg-accent"
        >
          <h3 className="font-medium">Manage Formations</h3>
          <p className="text-sm text-muted-foreground">
            Chronicles, sapper generals & more.
          </p>
        </Link>
      </section>
    </div>
  )
}
