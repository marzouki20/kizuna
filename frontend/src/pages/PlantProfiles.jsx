import { useMemo, useState } from "react";
import { MapPin, Search, Sprout } from "lucide-react";
import { PlantProfile } from "../components/PlantProfile";
import { plantStatuses, statusStyle } from "../components/plantProfileUtils";

export default function PlantProfiles({ plants, selectedPlantId, onSelectPlant, onClearSelection, onOpenFieldMap }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const selectedPlant = plants.find((plant) => plant.id === selectedPlantId);
  const visiblePlants = useMemo(() => plants.filter((plant) => {
    const matchesQuery = `${plant.id} ${plant.name}`.toLowerCase().includes(query.toLowerCase().trim());
    return matchesQuery && (statusFilter === "All statuses" || plant.status === statusFilter);
  }), [plants, query, statusFilter]);

  if (selectedPlant) {
    return <PlantProfile plant={selectedPlant} onBack={onClearSelection} onOpenFieldMap={onOpenFieldMap} />;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-green-800"><Sprout size={20} /><span className="text-sm font-semibold uppercase tracking-wider">Orchard registry</span></div><h2 className="mt-2 text-2xl font-bold text-gray-900">Plant Profiles</h2><p className="mt-1 text-sm text-gray-500">One shared profile per tree · {plants.length} trees in this simulated 100 × 100 m field</p></div><span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900">SIMULATION</span></div>
        <div className="mt-5 grid gap-3 md:grid-cols-[minmax(220px,1fr)_240px]"><label className="relative block"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by OL ID or tree name" className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-600">{["All statuses", ...plantStatuses].map((status) => <option key={status}>{status}</option>)}</select></div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visiblePlants.map((plant) => <article key={plant.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="relative h-40 bg-gray-100"><img src={plant.photo} alt={`Olive canopy for ${plant.name}`} className="h-full w-full object-cover" /><span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle(plant.status)}`}>{plant.status}</span></div><div className="p-4"><div className="flex items-start justify-between"><div><p className="text-xs font-bold tracking-wide text-green-800">{plant.id}</p><h3 className="mt-1 text-lg font-bold text-gray-900">{plant.name}</h3></div><Sprout size={19} className="text-green-700" /></div><p className="mt-3 flex items-center gap-1.5 font-mono text-xs text-gray-600"><MapPin size={14} />X {plant.x.toFixed(1)} m · Y {plant.y.toFixed(1)} m</p><p className="mt-2 text-xs text-gray-500">Last inspection: {plant.lastInspection ? new Date(plant.lastInspection).toLocaleDateString("en-GB") : "Not inspected"}</p><button onClick={() => onSelectPlant(plant.id)} className="mt-4 w-full rounded-lg bg-green-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-green-800">View Plant Profile</button></div></article>)}</div>
      {visiblePlants.length === 0 && <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">No trees match this search and status filter.</div>}
    </div>
  );
}
