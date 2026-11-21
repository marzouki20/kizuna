import { useMemo } from "react";
import {
  Activity, BatteryFull, Bot, Droplets, MapPinned, ShieldAlert, Sprout,
  CircleHelp, ArrowUpRight, Gauge, ScanSearch, Leaf,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Bar, BarChart,
} from "recharts";
import { cropCatalog, getMapColor } from "../data/plants";

const panelClass = "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6";
const chartColors = ["#16803c", "#f28b35", "#9ca3af"];

function formatDuration(seconds = 0) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes ? `${minutes} min ${remainder} s` : `${remainder} s`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "Non inspectée";
}

function MetricCard({ icon: Icon, title, value, description, percent, accent = "green" }) {
  const themes = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-orange-50 text-orange-700",
  };
  const safePercent = Math.max(0, Math.min(100, percent || 0));
  return <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-gray-500">{title}</p><p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p></div><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${themes[accent]}`}><Icon size={21} /></span></div>
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${accent === "amber" || accent === "red" ? "bg-orange-500" : accent === "blue" ? "bg-blue-600" : "bg-green-600"}`} style={{ width: `${safePercent}%` }} /></div>
    <div className="mt-2 flex items-center justify-between gap-2"><p className="text-xs text-gray-500">{description}</p><span className="text-xs font-semibold text-gray-600">{Math.round(safePercent)}%</span></div>
  </article>;
}

function FarmPreview({ plants, robotPosition, onOpenMap }) {
  return <section className={panelClass}>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-semibold text-green-800"><MapPinned size={17} /> FARM OVERVIEW</div><h2 className="mt-1 text-xl font-bold text-gray-900">Vue de la parcelle</h2><p className="mt-1 text-sm text-gray-500">Position du robot et état des plantes · coordonnées locales</p></div><button type="button" onClick={onOpenMap} className="inline-flex items-center gap-2 rounded-lg border border-green-700 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-50">Ouvrir la carte <ArrowUpRight size={16} /></button></div>
    <div className="relative mt-5 h-64 overflow-hidden rounded-xl border border-green-900/20 bg-[#7b8b5b] sm:h-80">
      <img src="/fields/mixed-crops.svg" alt="Illustration simulée de la parcelle" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-green-950/10" />
      {plants.map((plant) => <button key={plant.id} type="button" title={`${plant.id} · ${plant.cropName} · ${plant.status}`} aria-label={`Plante ${plant.id}, ${plant.status}`} className="absolute z-10 h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white shadow" style={{ left: `${plant.x / 2}%`, bottom: `${plant.y / 2}%`, backgroundColor: getMapColor(plant.status) }} />)}
      <span className="absolute z-20 -translate-x-1/2 translate-y-1/2" style={{ left: `${robotPosition.x / 2}%`, bottom: `${robotPosition.y / 2}%` }}><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-green-950 text-white shadow-lg"><Bot size={17} /></span></span>
      <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1.5 font-mono text-xs font-semibold text-gray-800 shadow">Robot · X {robotPosition.x.toFixed(1)} / Y {robotPosition.y.toFixed(1)} cm</span>
      <span className="absolute bottom-3 right-3 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold tracking-wide text-amber-900">SIMULATION</span>
    </div>
    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600"><span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-green-600" />Saine</span><span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />Anomalie potentielle</span><span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-gray-500" />À vérifier</span><span className="inline-flex items-center gap-1"><Bot size={14} className="text-green-900" />Robot simulé</span></div>
  </section>;
}

function RobotOverview({ robotStatus, robotPosition, mission, metrics, onOpenMap }) {
  const activeMission = Boolean(mission);
  const statusTone = robotStatus === "Running" ? "bg-green-100 text-green-800" : robotStatus === "Paused" ? "bg-amber-100 text-amber-800" : robotStatus === "Stopped" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700";
  const details = [
    ["Position", `X ${robotPosition.x.toFixed(1)} · Y ${robotPosition.y.toFixed(1)} cm`],
    ["Distance parcourue", `${(metrics.distance || 0).toFixed(1)} cm`],
    ["Plantes inspectées", String(metrics.inspected || 0)],
    ["Durée de mission", formatDuration(metrics.durationSeconds || 0)],
  ];
  return <section className={panelClass}>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-semibold text-green-800"><Bot size={17} /> ROBOT CONTROL</div><h2 className="mt-1 text-xl font-bold text-gray-900">État de la mission</h2></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone}`}>{robotStatus}</span></div>
    <div className="mt-5 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-green-50 text-green-700"><Gauge size={22} /></span><div className="min-w-0 flex-1"><div className="flex justify-between text-sm"><span className="font-semibold text-gray-800">Progression</span><span className="font-bold text-green-800">{metrics.progress || 0}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-green-600 transition-[width]" style={{ width: `${Math.max(0, Math.min(100, metrics.progress || 0))}%` }} /></div></div></div>
    <div className="mt-5 grid grid-cols-2 gap-3">{details.map(([label, value]) => <div key={label} className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 truncate text-sm font-bold text-gray-900">{value}</p></div>)}</div>
    <div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs text-gray-500">{activeMission ? "Données de mission simulée." : "Aucune mission lancée dans cette session."}</p><button type="button" onClick={onOpenMap} className="shrink-0 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800">{activeMission ? "Voir la carte" : "Préparer une mission"}</button></div>
  </section>;
}

function RecentInspections({ plants, onOpenPlant }) {
  const recent = useMemo(() => plants.filter((plant) => plant.lastInspection).sort((a, b) => new Date(b.lastInspection) - new Date(a.lastInspection)).slice(0, 5), [plants]);
  return <section className={panelClass}>
    <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-sm font-semibold text-green-800"><ScanSearch size={17} /> RECENT PLANT DETECTIONS</div><h2 className="mt-1 text-xl font-bold text-gray-900">Inspections récentes</h2></div><span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-900">SIMULATION</span></div>
    <div className="mt-4 divide-y divide-gray-100">{recent.map((plant) => <article key={plant.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
      <img src={plant.photo} alt={`Illustration simulée de ${plant.cropName}`} className="h-14 w-16 rounded-lg border border-gray-100 object-cover" />
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-gray-900">{plant.id}</p><span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-800">{plant.cropName}</span></div><p className={`mt-1 truncate text-xs ${plant.status === "Healthy" ? "text-green-700" : "text-amber-800"}`}>{plant.status === "Healthy" ? "Aucune anomalie signalée" : plant.detection?.issueName || "Inconnu / à vérifier"}</p><p className="mt-1 text-[11px] text-gray-500">X {plant.x.toFixed(1)} · Y {plant.y.toFixed(1)} cm · {formatDate(plant.lastInspection)}</p></div>
      <div className="flex items-center gap-3"><span className="text-right"><span className="block text-[10px] text-gray-500">Confiance simulée</span><strong className="text-xs text-gray-800">{plant.detection?.confidence == null ? "Inconnue" : `${plant.detection.confidence}%`}</strong></span><button type="button" onClick={() => onOpenPlant(plant.id)} className="rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-semibold text-green-800 hover:bg-green-50">Profil</button></div>
    </article>)}{recent.length === 0 && <p className="py-6 text-center text-sm text-gray-500">Aucune inspection enregistrée pour ce filtre.</p>}</div>
  </section>;
}

function Analytics({ plants }) {
  const healthData = useMemo(() => [
    { name: "Saines", value: plants.filter((plant) => plant.status === "Healthy").length },
    { name: "Anomalies potentielles", value: plants.filter((plant) => plant.status === "Potential Anomaly").length },
    { name: "À vérifier", value: plants.filter((plant) => plant.status === "Unknown / Verify").length },
  ], [plants]);
  const cropData = useMemo(() => cropCatalog.map((crop) => ({ name: crop.name, count: plants.filter((plant) => plant.cropType === crop.key).length })).filter((crop) => crop.count > 0), [plants]);
  const anomalyData = useMemo(() => cropCatalog.map((crop) => ({ name: crop.name, anomalies: plants.filter((plant) => plant.cropType === crop.key && plant.status === "Potential Anomaly").length })).filter((crop) => plants.some((plant) => plant.cropType === crop.key)), [plants]);
  const inspectionData = useMemo(() => {
    const grouped = new Map();
    plants.forEach((plant) => (plant.history || []).forEach((entry) => {
      if (!entry.date) return;
      const day = new Date(entry.date);
      if (Number.isNaN(day.getTime())) return;
      const key = day.toISOString().slice(0, 10);
      grouped.set(key, (grouped.get(key) || 0) + 1);
    }));
    return [...grouped.entries()].sort(([first], [second]) => first.localeCompare(second)).slice(-8).map(([key, inspections]) => ({ date: new Date(`${key}T12:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), inspections }));
  }, [plants]);
  const pie = [{ data: healthData, label: "État des plantes" }, { data: cropData, label: "Cultures surveillées" }];
  return <section>
    <div className="mb-4"><div className="flex items-center gap-2 text-sm font-semibold text-green-800"><Activity size={17} /> ANALYTICS</div><h2 className="mt-1 text-xl font-bold text-gray-900">Indicateurs de surveillance</h2><p className="mt-1 text-sm text-gray-500">Synthèse des inspections et cultures enregistrées · données simulées</p></div>
    <div className="grid gap-4 xl:grid-cols-2">
      {pie.map(({ data, label }, index) => <article key={label} className={panelClass}><h3 className="font-bold text-gray-900">{label}</h3><div className="mt-3 grid grid-cols-[minmax(130px,.8fr)_1fr] items-center gap-2"><div className="h-44 min-w-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey={index === 0 ? "value" : "count"} nameKey="name" innerRadius={45} outerRadius={68} paddingAngle={3}>{data.map((item, itemIndex) => <Cell key={item.name} fill={index === 0 ? chartColors[itemIndex % chartColors.length] : ["#166534", "#22c55e", "#84cc16", "#a3e635", "#4d7c0f"][itemIndex % 5]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="space-y-2">{data.map((item, itemIndex) => <div key={item.name} className="flex items-center justify-between gap-2 text-xs"><span className="flex min-w-0 items-center gap-2 text-gray-600"><i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: index === 0 ? chartColors[itemIndex % chartColors.length] : ["#166534", "#22c55e", "#84cc16", "#a3e635", "#4d7c0f"][itemIndex % 5] }} />{item.name}</span><strong className="text-gray-900">{item.value ?? item.count}</strong></div>)}</div></div></article>)}
      <article className={panelClass}><h3 className="font-bold text-gray-900">Inspections dans le temps</h3><p className="mt-1 text-xs text-gray-500">Nombre d’entrées d’historique par date</p><div className="mt-3 h-52"><ResponsiveContainer width="100%" height="100%"><AreaChart data={inspectionData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}><defs><linearGradient id="inspectionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16a34a" stopOpacity={0.28} /><stop offset="100%" stopColor="#16a34a" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} /><Tooltip /><Area type="monotone" dataKey="inspections" name="Inspections" stroke="#16803c" fill="url(#inspectionFill)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></article>
      <article className={panelClass}><h3 className="font-bold text-gray-900">Anomalies potentielles par culture</h3><p className="mt-1 text-xs text-gray-500">Les cas « à vérifier » restent distincts</p><div className="mt-3 h-52"><ResponsiveContainer width="100%" height="100%"><BarChart data={anomalyData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="anomalies" name="Anomalies potentielles" fill="#f28b35" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></article>
    </div>
  </section>;
}

export default function Dashboard({ plants, robotStatus, robotPosition, mission, missionMetrics, onOpenMap, onOpenPlant }) {
  const total = plants.length;
  const inspected = plants.filter((plant) => plant.lastInspection).length;
  const healthy = plants.filter((plant) => plant.status === "Healthy").length;
  const potentialAnomalies = plants.filter((plant) => plant.status === "Potential Anomaly").length;
  const verify = plants.filter((plant) => plant.status === "Unknown / Verify").length;
  const cropCount = new Set(plants.map((plant) => plant.cropType)).size;
  const stats = [
    { title: "Battery Level", value: "95%", description: "Charge simulée du robot", percent: 95, icon: BatteryFull, accent: "green" },
    { title: "Reservoir Level", value: "80%", description: "Niveau simulé", percent: 80, icon: Droplets, accent: "blue" },
    { title: "Plants Inspected", value: `${inspected} / ${total}`, description: "Plantes avec une date d’inspection", percent: total ? inspected / total * 100 : 0, icon: Sprout, accent: "green" },
    { title: "Healthy Plants", value: String(healthy), description: `${total ? Math.round(healthy / total * 100) : 0}% de la sélection`, percent: total ? healthy / total * 100 : 0, icon: Leaf, accent: "green" },
    { title: "Potential Anomalies / To Verify", value: String(potentialAnomalies + verify), description: `${potentialAnomalies} potentielles · ${verify} à vérifier`, percent: total ? (potentialAnomalies + verify) / total * 100 : 0, icon: ShieldAlert, accent: "amber" },
    { title: "Crop Types Monitored", value: String(cropCount), description: `Sur ${cropCatalog.length} types disponibles`, percent: cropCatalog.length ? cropCount / cropCatalog.length * 100 : 0, icon: Activity, accent: "blue" },
  ];
  return <div className="space-y-7">
    <section className="rounded-2xl bg-gradient-to-r from-green-950 via-green-800 to-green-700 p-6 text-white shadow-sm md:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-green-200">RoboCore · Smart agriculture</p><h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Farm monitoring dashboard</h1><p className="mt-2 max-w-2xl text-sm text-green-100">Vue d’ensemble multi-cultures, état du robot et inspections récentes.</p></div><span className="rounded-full border border-amber-200/40 bg-amber-100/15 px-3 py-1.5 text-xs font-bold text-amber-100">MODE SIMULATION · ROBOT VIRTUEL</span></div></section>
    <section><div className="mb-4 flex items-end justify-between gap-3"><div><h2 className="text-xl font-bold text-gray-900">Farm statistics</h2><p className="mt-1 text-sm text-gray-500">La sélection suit le filtre de cultures actif.</p></div><span className="text-xs font-medium text-gray-500">{total} plantes</span></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stats.map((stat) => <MetricCard key={stat.title} {...stat} />)}</div></section>
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]"><FarmPreview plants={plants} robotPosition={robotPosition} onOpenMap={onOpenMap} /><RobotOverview robotStatus={robotStatus} robotPosition={robotPosition} mission={mission} metrics={missionMetrics || {}} onOpenMap={onOpenMap} /></div>
    <RecentInspections plants={plants} onOpenPlant={onOpenPlant} />
    <Analytics plants={plants} />
    <p className="flex items-center gap-2 text-xs text-gray-500"><CircleHelp size={14} />Les niveaux de batterie et de réservoir, la carte, les inspections et les résultats affichés sont simulés.</p>
  </div>;
}
