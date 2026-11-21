import { cropCatalog } from "../data/plants";

export default function CropReport({ plants }) {
  return <section className="space-y-5">
    <div className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold">Rapport de surveillance</h2><p className="mt-1 text-sm text-gray-500">Synthèse par culture des résultats de démonstration.</p><span className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">SIMULATION</span></div>
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Culture</th><th className="px-5 py-3">Plantes</th><th className="px-5 py-3">Saines</th><th className="px-5 py-3">Anomalies potentielles</th><th className="px-5 py-3">Inconnues / à vérifier</th></tr></thead><tbody className="divide-y divide-gray-100">{cropCatalog.map((crop) => { const group = plants.filter((plant) => plant.cropType === crop.key); if (!group.length) return null; return <tr key={crop.key}><td className="px-5 py-3 font-semibold text-gray-800">{crop.name}</td><td className="px-5 py-3">{group.length}</td><td className="px-5 py-3">{group.filter((plant) => plant.status === "Healthy").length}</td><td className="px-5 py-3">{group.filter((plant) => plant.status === "Potential Anomaly").length}</td><td className="px-5 py-3">{group.filter((plant) => plant.status === "Unknown / Verify").length}</td></tr>; })}</tbody></table></div>
  </section>;
}
