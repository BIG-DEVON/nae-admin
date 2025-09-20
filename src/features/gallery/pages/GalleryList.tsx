import { Link } from 'react-router-dom';
import Spinner from '@/components/ui/Spinner';
import { useGalleries } from '../hooks/useGalleries';

export default function GalleryList() {
  const { data, isLoading, isError } = useGalleries();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-2 text-sm text-neutral-600">
        <Spinner size={18} /> Loading galleries…
      </div>
    );
  }

  if (isError) {
    return <div className="p-6 text-red-600">Failed to load galleries.</div>;
  }

  const rows = Array.isArray(data) ? data : [];

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Galleries</h1>

        <Link
          to="/gallery/home"
          className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm"
        >
          Manage Home Gallery
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((g) => (
          <div key={g.id} className="rounded-xl border border-zinc-200/60 p-4">
            <div className="text-base font-medium">{g.title}</div>
            <p className="text-sm text-muted-foreground">Position: {g.position}</p>

            <div className="mt-3">
              <Link
                to={`/gallery/detail?id=${g.id}`}
                className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm"
              >
                Manage contents
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
