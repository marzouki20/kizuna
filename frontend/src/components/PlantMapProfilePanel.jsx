import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, X } from "lucide-react";
import { formatDate, statusStyle } from "./plantProfileUtils";

export default function PlantMapProfilePanel({ plant, onClose, onViewFullProfile }) {
  const detection = plant.detection || {};
  const treatment = plant.treatment || {};
  const healthy = plant.status === "Healthy";
  const anomaly = plant.status === "Potential Anomaly";

  return <section className="plant-map-profile-panel" aria-label={`Plant profile ${plant.id}`}>
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-green-800">Plant profile</p><h3 className="mt-1 text-lg font-bold text-gray-900">{plant.id}</h3><p className="text-sm text-gray-600">{plant.cropName} · {plant.name}</p></div>
      <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900" aria-label="Close plant profile"><X size={19} /></button>
    </div>

    <div className="relative mt-3 h-32 overflow-hidden rounded-xl bg-gray-100">
      {plant.photo ? <img src={plant.photo} alt={`Illustration simulée de ${plant.cropName}`} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm text-gray-500">Photo non disponible</div>}
      <span className="absolute bottom-2 right-2 rounded-full bg-amber-100 px-2 py-1 text-[9px] font-bold text-amber-900">IMAGE SIMULÉE</span>
    </div>

    <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle(plant.status)}`}>{healthy ? "Healthy" : anomaly ? "Potential anomaly" : "Inspection required"}</span><span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{plant.status === "Unknown / Verify" ? "Unknown / To verify" : plant.status}</span></div>

    <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-gray-50 p-2.5"><span className="block text-gray-500">X coordinate</span><strong className="mt-1 block font-mono text-gray-900">{Number(plant.x).toFixed(1)} cm</strong></div><div className="rounded-lg bg-gray-50 p-2.5"><span className="block text-gray-500">Y coordinate</span><strong className="mt-1 block font-mono text-gray-900">{Number(plant.y).toFixed(1)} cm</strong></div></div>

    <div className="mt-3 rounded-lg border border-gray-100 p-3"><p className="flex items-center gap-2 text-[11px] font-semibold text-gray-500"><CalendarDays size={14} />Last inspection</p><p className="mt-1 text-sm font-semibold text-gray-900">{formatDate(plant.lastInspection, true)}</p></div>

    {anomaly && <div className="mt-3 space-y-2 rounded-xl border border-orange-200 bg-orange-50 p-3">
      <p className="text-xs font-bold text-orange-950">Suspected anomaly · diagnosis not confirmed</p>
      <p className="text-sm font-semibold text-gray-900">{detection.issueName || treatment.suspectedProblem || "Anomaly to verify"}</p>
      {detection.confidence != null && <p className="text-xs text-gray-700">AI confidence (simulated): <strong>{detection.confidence}%</strong></p>}
      <p className="text-xs leading-5 text-gray-700"><strong>Observed symptoms:</strong> {detection.symptoms || "No symptoms recorded."}</p>
      <p className="text-xs leading-5 text-gray-700"><strong>Recommended next steps:</strong> {treatment.recommendedActions || "Take a clear follow-up image and check nearby plants. Ask an agronomist to verify uncertain findings."}</p>
    </div>}

    {plant.status === "Unknown / Verify" && <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3"><p className="text-xs font-bold text-gray-800">Inspection required</p><p className="mt-1 text-xs leading-5 text-gray-600">{detection.symptoms || "There is not enough recorded information to classify this plant."}</p></div>}
    {healthy && <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3"><p className="flex items-center gap-2 text-xs font-bold text-green-900"><CheckCircle2 size={15} />Healthy status</p><p className="mt-1 text-xs text-green-800">Last inspection: {formatDate(plant.lastInspection, true)}</p></div>}

    <div className="mt-4 border-t border-gray-100 pt-3"><h4 className="flex items-center gap-2 text-xs font-bold text-gray-800"><Clock3 size={14} />Inspection history <span className="font-normal text-gray-400">({plant.history?.length || 0})</span></h4>
      {plant.history?.length ? <div className="mt-2 space-y-2">{[...plant.history].reverse().map((entry) => <div key={entry.id} className="rounded-lg bg-gray-50 p-2.5"><p className="text-xs font-semibold text-gray-800">{entry.summary || entry.status}</p><p className="mt-1 text-[10px] text-gray-500">{formatDate(entry.date, true)} · {entry.simulated ? "Simulation" : "Inspection"}</p></div>)}</div> : <p className="mt-2 text-xs text-gray-500">No inspection history recorded.</p>}
    </div>

    <button type="button" onClick={() => onViewFullProfile(plant.id)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-green-800">View full profile <ArrowUpRight size={16} /></button>
  </section>;
}
