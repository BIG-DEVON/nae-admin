export default function Dashboard() {
  const cards = [
    { title: "Gallery", to: "/gallery" },
    { title: "Awards", to: "/awards" },
    { title: "Formations", to: "/formations" },
    { title: "Overview", to: "/overview" },
  ];
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Hall of Fame — Admin</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <a key={c.to} href={c.to} className="block rounded-xl border bg-white p-5 hover:shadow">
            <div className="text-sm text-gray-500">{c.title}</div>
            <div className="mt-2 font-medium">Manage {c.title}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
