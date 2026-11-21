import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleMarker,
  ImageOverlay,
  MapContainer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import {
  Bot, Crosshair, MapPin, Pause, Play, RotateCcw, Sprout, Square, Trash2,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./FieldMap.css";
import { getMapColor } from "../data/plants";
import PlantMapProfilePanel from "../components/PlantMapProfilePanel";
import { handleFieldMapClick, handlePlantMarkerClick } from "./fieldMapInteractions";

const FIELD_BOUNDS = [[0, 0], [200, 200]];
const START = { x: 10, y: 10 };
const icon = (emoji, color) => L.divIcon({
  className: "field-div-icon",
  html: `<span style="background:${color}">${emoji}</span>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});
const robotIcon = icon("🤖", "#14532d");
const waypointIcon = (number) => L.divIcon({
  className: "field-div-icon waypoint-div-icon",
  html: `<span>${number}</span>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function FitField() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(FIELD_BOUNDS, { padding: [14, 14] });
  }, [map]);
  return null;
}

function FieldClicks({ onAdd }) {
  useMapEvents({
    click(event) { handleFieldMapClick(event, onAdd); },
  });
  return null;
}

function FieldGrid() {
  const lines = [];
  for (let centimeter = 0; centimeter <= 200; centimeter += 10) {
    const major = centimeter % 20 === 0;
    lines.push(<Polyline key={`v${centimeter}`} positions={[[0, centimeter], [200, centimeter]]} pathOptions={{ color: "#fff", opacity: major ? 0.42 : 0.24, weight: major ? 1.5 : 1, interactive: false }} />);
    lines.push(<Polyline key={`h${centimeter}`} positions={[[centimeter, 0], [centimeter, 200]]} pathOptions={{ color: "#fff", opacity: major ? 0.42 : 0.24, weight: major ? 1.5 : 1, interactive: false }} />);
  }
  return <>{lines}</>;
}

function CoordinateLabels() {
  const labels = [];
  for (let centimeter = 0; centimeter <= 200; centimeter += 20) {
    labels.push(<Marker key={`x${centimeter}`} position={[4, centimeter]} icon={L.divIcon({ className: "axis-label", html: `${centimeter}`, iconSize: [36, 16], iconAnchor: [18, 8] })} interactive={false} />);
    labels.push(<Marker key={`y${centimeter}`} position={[centimeter, 4]} icon={L.divIcon({ className: "axis-label", html: `${centimeter}`, iconSize: [36, 16], iconAnchor: [18, 8] })} interactive={false} />);
  }
  return <>{labels}</>;
}

function formatPosition(position) {
  return `X ${position.x.toFixed(1)} cm · Y ${position.y.toFixed(1)} cm`;
}

export default function FieldMap({ robotStatus, setRobotStatus, plants, onInspectPlant, onViewFullProfile, onRobotPosition, onMissionChange, onMissionMetrics, initialRobotPosition = START }) {
  const [waypoints, setWaypoints] = useState([]);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [robotPosition, setRobotPosition] = useState(initialRobotPosition);
  const [trail, setTrail] = useState([initialRobotPosition]);
  const [activeTarget, setActiveTarget] = useState(0);
  const [missionInspectionCount, setMissionInspectionCount] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const robotPositionRef = useRef(initialRobotPosition);
  const robotStatusRef = useRef(robotStatus);
  const inspectedThisMission = useRef(new Set());

  useEffect(() => { robotStatusRef.current = robotStatus; }, [robotStatus]);
  useEffect(() => () => {
    if (robotStatusRef.current === "Running") setRobotStatus("Paused");
  }, [setRobotStatus]);

  const route = useMemo(() => [START, ...waypoints], [waypoints]);
  const routeLine = route.map(({ x, y }) => [y, x]);
  const selectedPlant = plants.find((plant) => plant.id === selectedPlantId) || null;

  function selectPlant(plant, event) {
    handlePlantMarkerClick(plant, event, setSelectedPlantId);
  }

  function addWaypoint(point) {
    setWaypoints((points) => [...points, { ...point, id: crypto.randomUUID() }]);
    if (robotStatus === "Completed" || robotStatus === "Stopped") setRobotStatus("Standby");
  }

  useEffect(() => {
    if (robotStatus !== "Running" || waypoints.length === 0) return undefined;
    const timer = window.setInterval(() => {
      const current = robotPositionRef.current;
      const target = route[activeTarget + 1];
      if (!target) {
        setRobotStatus("Completed");
        return;
      }
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const distance = Math.hypot(dx, dy);
      const step = 1.4;
      const next = distance <= step
        ? target
        : { x: current.x + (dx / distance) * step, y: current.y + (dy / distance) * step };
      robotPositionRef.current = next;
      setRobotPosition(next);
      onRobotPosition?.(next);
      setTrail((points) => [...points, next]);

      plants.forEach((plant) => {
        if (!inspectedThisMission.current.has(plant.id) && Math.hypot(plant.x - next.x, plant.y - next.y) <= 3.2) {
          inspectedThisMission.current.add(plant.id);
          setMissionInspectionCount((count) => count + 1);
          onInspectPlant(plant.id);
        }
      });

      if (distance <= step) {
        const nextTargetIndex = activeTarget + 1;
        if (nextTargetIndex >= route.length - 1) setRobotStatus("Completed");
        else setActiveTarget(nextTargetIndex);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [activeTarget, onInspectPlant, onRobotPosition, plants, route, robotStatus, setRobotStatus, waypoints.length]);

  useEffect(() => {
    if (robotStatus !== "Running") return undefined;
    const timer = window.setInterval(() => setDurationSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [robotStatus]);

  function startMission() {
    if (waypoints.length === 0) return;
    onMissionChange?.({ status: "Running", startedAt: new Date().toISOString(), waypoints: waypoints.map(({ x, y }) => ({ x, y })) });
    if (["Standby", "Stopped", "Completed", "Paused"].includes(robotStatus)) {
      setRobotPosition(START);
      robotPositionRef.current = START;
      setTrail([START]);
      setActiveTarget(0);
      inspectedThisMission.current.clear();
      setMissionInspectionCount(0);
      setDurationSeconds(0);
    }
    setRobotStatus("Running");
  }

  function resetMission() {
    setRobotStatus("Standby");
    setRobotPosition(START);
    robotPositionRef.current = START;
    setTrail([START]);
    setActiveTarget(0);
    inspectedThisMission.current.clear();
    setMissionInspectionCount(0);
    setDurationSeconds(0);
    onRobotPosition?.(START);
    onMissionMetrics?.({ progress: 0, distance: 0, inspected: 0, durationSeconds: 0 });
  }

  const progress = useMemo(() => {
    const total = route.slice(1).reduce((sum, point, index) => {
      const previous = route[index];
      return sum + Math.hypot(point.x - previous.x, point.y - previous.y);
    }, 0);
    const completed = trail.slice(1).reduce((sum, point, index) => {
      const previous = trail[index];
      return sum + Math.hypot(point.x - previous.x, point.y - previous.y);
    }, 0);
    return total ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  }, [route, trail]);

  const distanceTraveled = useMemo(() => trail.slice(1).reduce((sum, point, index) => {
    const previous = trail[index];
    return sum + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0), [trail]);

  useEffect(() => {
    if (waypoints.length === 0) return;
    onMissionMetrics?.({ progress, distance: distanceTraveled, inspected: missionInspectionCount, durationSeconds });
  }, [distanceTraveled, durationSeconds, missionInspectionCount, onMissionMetrics, progress, waypoints.length]);

  function moveWaypoint(id, event) {
    const point = {
      x: Math.max(0, Math.min(200, Number(event.target.getLatLng().lng.toFixed(1)))),
      y: Math.max(0, Math.min(200, Number(event.target.getLatLng().lat.toFixed(1)))),
    };
    setWaypoints((items) => items.map((item) => item.id === id ? { ...item, ...point } : item));
  }

  function deleteWaypoint(id) {
    setWaypoints((items) => items.filter((item) => item.id !== id));
    resetMission();
  }

  const currentPosition = formatPosition(robotPosition);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-green-800"><Sprout size={20} /><span className="text-sm font-semibold uppercase tracking-wider">Parcelles de cultures variées</span></div>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Carte du champ</h2>
            <p className="mt-1 text-sm text-gray-500">Champ de 200 × 200 cm (2 m × 2 m) · origine en bas à gauche · cliquez pour ajouter un waypoint</p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${robotStatus === "Running" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{robotStatus}</span>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="relative h-[460px] overflow-hidden rounded-xl border border-green-900/20 bg-[#788c55] md:h-[560px]">
              <MapContainer crs={L.CRS.Simple} center={[100, 100]} zoom={0} minZoom={-1} maxZoom={4} maxBounds={FIELD_BOUNDS} maxBoundsViscosity={1} zoomControl style={{ height: "100%", width: "100%", background: "#788c55" }}>
                <FitField />
                <ImageOverlay url="/fields/mixed-crops.svg" bounds={FIELD_BOUNDS} interactive={false} />
                <FieldClicks onAdd={addWaypoint} />
                <FieldGrid />
                <CoordinateLabels />
                <Polyline positions={[[0, 0], [0, 200]]} pathOptions={{ color: "#fff", weight: 3, opacity: 0.9, interactive: false }} />
                <Polyline positions={[[0, 0], [200, 0]]} pathOptions={{ color: "#fff", weight: 3, opacity: 0.9, interactive: false }} />
                <Marker position={[200, 200]} icon={L.divIcon({ className: "axis-label", html: "(200, 200)", iconSize: [68, 16], iconAnchor: [68, 8] })} interactive={false} />
                {plants.map((plant) => { const selected = plant.id === selectedPlantId; return <CircleMarker key={plant.id} center={[plant.y, plant.x]} radius={selected ? 10 : 6} bubblingMouseEvents={false} pathOptions={{ color: selected ? "#facc15" : "#fff", weight: selected ? 4 : 1.5, fillColor: getMapColor(plant.status), fillOpacity: 0.95, className: selected ? "plant-marker-selected" : "" }} eventHandlers={{ click: (event) => selectPlant(plant, event) }}><Tooltip direction="top"><b>{plant.id}</b> · {plant.cropName} · {plant.name}<br />X {plant.x.toFixed(1)} cm · Y {plant.y.toFixed(1)} cm<br />{plant.status}<br /><span style={{ color: "#166534", fontWeight: 700 }}>Click to view plant profile</span></Tooltip></CircleMarker>; })}
                <Polyline positions={routeLine} interactive={false} pathOptions={{ color: "#fff", weight: 7, opacity: 0.9, lineCap: "round", lineJoin: "round" }} />
                <Polyline positions={routeLine} interactive={false} pathOptions={{ color: "#ef4444", weight: 3, opacity: 0.95, lineCap: "round", lineJoin: "round" }} />
                {trail.length > 1 && <Polyline positions={trail.map(({ x, y }) => [y, x])} interactive={false} pathOptions={{ color: "#fbbf24", weight: 4, opacity: 0.95, lineCap: "round" }} />}
                <CircleMarker center={[START.y, START.x]} radius={10} interactive={false} pathOptions={{ color: "white", weight: 3, fillColor: "#16a34a", fillOpacity: 1 }}><Tooltip permanent direction="top" offset={[0, -8]}>DÉPART</Tooltip></CircleMarker>
                {waypoints.map((point, index) => <Marker key={point.id} position={[point.y, point.x]} icon={waypointIcon(index + 1)} draggable bubblingMouseEvents={false} eventHandlers={{ dragend: (event) => moveWaypoint(point.id, event) }}><Tooltip direction="top">P{index + 1} · {formatPosition(point)}</Tooltip></Marker>)}
                {waypoints.length > 0 && <CircleMarker center={[waypoints[waypoints.length - 1].y, waypoints[waypoints.length - 1].x]} radius={13} interactive={false} pathOptions={{ color: "white", weight: 2, fillColor: "#dc2626", fillOpacity: 0.3 }} />}
                <Marker position={[robotPosition.y, robotPosition.x]} icon={robotIcon} zIndexOffset={1000} bubblingMouseEvents={false}><Tooltip permanent direction="right">RoboCore</Tooltip></Marker>
              </MapContainer>
              <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-gray-700 shadow">Y ↑ (cm) <span className="ml-2 font-normal text-gray-500">Origine (0,0) en bas à gauche · X → (cm)</span></div>
              <div className="absolute bottom-3 right-3 z-[500] rounded-lg bg-gray-950/85 px-3 py-2 font-mono text-xs text-white shadow"><Crosshair className="mr-1 inline" size={13} />{currentPosition}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600">
              <span><i className="mr-1.5 inline-block h-3 w-3 rounded-full bg-green-600 align-middle" />Plante saine</span>
              <span><i className="mr-1.5 inline-block h-3 w-3 rounded-full bg-orange-500 align-middle" />Anomalie potentielle</span>
              <span><i className="mr-1.5 inline-block h-3 w-3 rounded-full bg-gray-500 align-middle" />Inconnu / à vérifier</span>
              <span><i className="mr-1.5 inline-block h-3 w-3 rounded-full bg-green-600 align-middle" />Départ</span>
              <span><i className="mr-1.5 inline-block h-3 w-3 rounded-full bg-red-500 align-middle" />Waypoints</span>
              <span><i className="mr-1.5 inline-block h-1 w-4 bg-red-500 align-middle" />Trajet prévu</span>
              <span><i className="mr-1.5 inline-block h-1 w-4 bg-amber-400 align-middle" />Trace robot</span>
            </div>
          </div>

          <aside className="flex min-h-[260px] flex-col rounded-xl border border-gray-100 bg-gray-50 p-4">
            {selectedPlant && <>
              <button type="button" className="plant-profile-backdrop xl:hidden" onClick={() => setSelectedPlantId(null)} aria-label="Close plant profile drawer" />
              <PlantMapProfilePanel plant={selectedPlant} onClose={() => setSelectedPlantId(null)} onViewFullProfile={onViewFullProfile || (() => {})} />
            </>}
            <div className="flex items-center justify-between">
              <div><h3 className="font-bold text-gray-900">Waypoints</h3><p className="text-xs text-gray-500">{waypoints.length} point{waypoints.length > 1 ? "s" : ""} · glissez pour déplacer</p></div>
              <MapPin size={19} className="text-green-700" />
            </div>
            <div className="mt-3 flex-1 space-y-2 overflow-y-auto xl:max-h-[380px]">
              <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2.5"><div><span className="text-xs font-bold text-green-800">DÉPART</span><p className="font-mono text-xs text-gray-600">{formatPosition(START)}</p></div><span className="h-3 w-3 rounded-full bg-green-600" /></div>
              {waypoints.length === 0 && <p className="rounded-lg border border-dashed border-gray-300 px-3 py-6 text-center text-sm text-gray-500">Cliquez sur le champ pour créer P1.</p>}
              {waypoints.map((point, index) => <div key={point.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-sm"><div className="flex min-w-0 items-center gap-2.5"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">P{index + 1}</span><div className="min-w-0"><p className="font-mono text-xs text-gray-700">{formatPosition(point)}</p></div></div><button className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600" onClick={() => deleteWaypoint(point.id)} aria-label={`Supprimer P${index + 1}`}><Trash2 size={16} /></button></div>)}
            </div>
            <div className="mt-4 rounded-lg bg-white p-3 shadow-sm"><p className="text-xs font-medium text-gray-500">POSITION DU ROBOT</p><p className="mt-1 font-mono text-sm font-semibold text-green-800">{currentPosition}</p><p className="mt-1 text-xs text-gray-400">{progress}% du trajet parcouru</p></div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={startMission} disabled={!waypoints.length || robotStatus === "Running"} className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-45"><Play size={16} />START</button>
              {robotStatus === "Paused" ? <button onClick={() => setRobotStatus("Running")} className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"><Play size={16} />RESUME</button> : <button onClick={() => robotStatus === "Running" && setRobotStatus("Paused")} disabled={robotStatus !== "Running"} className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-45"><Pause size={16} />PAUSE</button>}
              <button onClick={() => { setRobotStatus("Stopped"); }} disabled={robotStatus !== "Running" && robotStatus !== "Paused"} className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-45"><Square size={15} />STOP</button>
              <button onClick={resetMission} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"><RotateCcw size={15} />RESET</button>
            </div>
          </aside>
        </div>
      </section>
      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900"><Bot size={18} className="mt-0.5 shrink-0" /><p>Simulation locale : champ de 200 cm × 200 cm, coordonnées en centimètres. Les lignes de grille sont espacées de 10 cm et les repères sont affichés tous les 20 cm.</p></div>
    </div>
  );
}
