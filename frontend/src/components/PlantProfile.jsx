import { ArrowLeft, CalendarDays, Camera, CheckCircle2, Clock3, MapPin, ShieldAlert } from "lucide-react";
import { formatDate, statusStyle } from "./plantProfileUtils";

export function PlantProfile({ plant, onBack, onOpenFieldMap }) {
  const detection = plant.detection || {};
  const treatment = plant.treatment || {};

  return <div className="space-y-5">
    <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 hover:text-green-950"><ArrowLeft size={17} />Retour aux plantes</button>
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm"><div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
      <div className="relative min-h-64 bg-gray-100 lg:min-h-[350px]"><img src={plant.photo} alt={`Illustration simulée de ${plant.cropName} — ${plant.name}`} className="absolute inset-0 h-full w-full object-cover" /><span className="absolute left-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">SIMULATION</span></div>
      <div className="p-6 md:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold text-green-800">{plant.id} · {plant.cropName}</p><h2 className="mt-1 text-3xl font-bold text-gray-900">{plant.name}</h2></div><span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${statusStyle(plant.status)}`}>{plant.status}</span></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-green-50 p-4"><div className="flex items-center gap-2 text-sm text-gray-500"><MapPin size={16} />Position du champ</div><p className="mt-2 font-mono font-bold text-green-900">X {plant.x.toFixed(1)} m · Y {plant.y.toFixed(1)} m</p></div><div className="rounded-xl bg-gray-50 p-4"><div className="flex items-center gap-2 text-sm text-gray-500"><CalendarDays size={16} />Dernière inspection</div><p className="mt-2 font-semibold text-gray-800">{formatDate(plant.lastInspection, true)}</p></div></div>
        <button onClick={onOpenFieldMap} className="mt-5 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800">Voir sur la carte</button>
      </div>
    </div></section>

    <section className="grid gap-5 xl:grid-cols-2">
      <article className="rounded-2xl bg-white p-5 shadow-sm md:p-6"><div className="flex items-center gap-2"><Camera className="text-green-700" size={20} /><h3 className="text-lg font-bold">Résultat de détection</h3></div>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800"><ShieldAlert size={14} />SIMULATION · {detection.model || "Aucun modèle connecté"}</p>
        <p className="mt-2 text-sm font-semibold text-amber-800">Diagnostic IA non confirmé – Vérification agronomique nécessaire.</p>
        <div className="mt-4 grid grid-cols-[120px_1fr] gap-4"><img src={detection.analyzedPhoto || plant.photo} alt="Illustration analysée en simulation" className="h-28 w-full rounded-lg object-cover" /><div><p className="text-xs font-medium uppercase text-gray-500">Résultat / anomalie potentielle</p><p className="mt-1 font-semibold text-gray-900">{detection.issueName || "Inconnu / à vérifier"}</p><p className="mt-2 text-sm leading-5 text-gray-600">{detection.symptoms || "Aucun symptôme consigné."}</p><p className="mt-2 text-sm text-gray-600">Maladie : {detection.diseaseName || "Non identifiée — modèle non connecté"}</p></div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Confiance culture (simulée)</p><p className="mt-1 text-xl font-bold text-gray-900">{detection.cropConfidence == null ? "Indisponible" : `${detection.cropConfidence}%`}</p></div><div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Confiance résultat (simulée)</p><p className="mt-1 text-xl font-bold text-gray-900">{detection.confidence == null ? "Inconnue" : `${detection.confidence}%`}</p></div><div className="rounded-lg bg-gray-50 p-3"><p className="text-xs text-gray-500">Date d’inspection</p><p className="mt-1 text-sm font-semibold text-gray-800">{formatDate(detection.detectedAt, true)}</p></div></div>
        <p className="mt-4 text-sm text-gray-600"><b>Prévention :</b> {treatment.preventiveMeasures || "Surveillance régulière."}</p>
      </article>

      <article className="rounded-2xl bg-white p-5 shadow-sm md:p-6"><div className="flex items-center justify-between gap-3"><h3 className="text-lg font-bold">Recommandations agricoles</h3><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">À vérifier</span></div>
        <p className="mt-4 text-sm text-gray-500">Problème suspecté</p><p className="font-semibold text-gray-900">{treatment.suspectedProblem || "Inconnu / à vérifier"}</p>
        <p className="mt-4 text-sm leading-5 text-gray-700"><b>Prévention :</b> {treatment.preventiveMeasures || "Surveiller régulièrement et consigner les changements."}</p>
        <p className="mt-3 text-sm leading-5 text-gray-700"><b>Action recommandée :</b> {treatment.recommendedActions || "Refaire une observation nette et vérifier plusieurs plantes voisines."}</p>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="font-semibold text-amber-950">Produit : {treatment.product || "Aucun produit vérifié"}</p><p className="mt-1 text-sm text-amber-900">Substance active : {treatment.activeSubstance || "Non vérifiée"}</p><p className="mt-1 text-sm text-amber-900">Usage autorisé sur {plant.cropName} : {treatment.authorizedUse || "Non vérifié"}</p><p className="mt-2 text-sm leading-5 text-amber-900">{treatment.precautions || "Vérifier l’étiquette officielle et l’autorisation locale avant toute utilisation."}</p></div>
        <p className="mt-3 text-xs text-gray-500">Aucun produit ni dosage n’est recommandé sans vérification pour la culture et la région.</p>
      </article>
    </section>

    <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6"><div className="flex items-center gap-2"><Clock3 size={20} className="text-green-700" /><h3 className="text-lg font-bold">Historique d’inspection</h3><span className="text-sm text-gray-400">({plant.history?.length || 0})</span></div>
      {plant.history?.length ? <div className="mt-4 divide-y divide-gray-100">{[...plant.history].reverse().map((entry) => <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-green-600" /><div><p className="font-semibold text-gray-800">{entry.summary}</p><p className="text-xs text-gray-500">{formatDate(entry.date, true)} · {entry.simulated ? "Inspection simulée" : "Inspection"}</p></div></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(entry.status)}`}>{entry.status} · {entry.confidence == null ? "Confiance inconnue" : `${entry.confidence}%`}</span></div>)}</div> : <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">Aucun historique d’inspection.</p>}
    </section>
  </div>;
}
