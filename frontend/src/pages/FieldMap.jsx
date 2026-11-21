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

const FIELD_BOUNDS = [[0, 0], [100, 100]];
const START = { x: 5, y: 5 };
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
    click(event) {
      const { lat, lng } = event.latlng;
      onAdd({ x: Number(lng.toFixed(1)), y: Number(lat.toFixed(1)) });
    },
  });
  return null;
}

function FieldGrid() {
  const lines = [];
  for (let meter = 0; meter <= 100; meter += 10) {
    lines.push(<Polyline key={`v${meter}`} positions={[[0, meter], [100, meter]]} pathOptions={{ color: "#fff", opacity: meter % 20 === 0 ? 0.29 : 0.15, weight: 1, interactive: false }} />);
    lines.push(<Polyline key={`h${meter}`} positions={[[meter, 0], [meter, 100]]} pathOptions={{ color: "#fff", opacity: meter % 20 === 0 ? 0.29 : 0.15, weight: 1, interactive: false }} />);
  }
  return <>{lines}</>;
}

function CoordinateLabels() {
  const labels = [];
  for (let meter = 0; meter <= 100; meter += 20) {
    labels.push(<Marker key={`x${meter}`} position={[3, meter]} icon={L.divIcon({ className: "axis-label", html: `${meter} m`, iconSize: [36, 16], iconAnchor: [18, 8] })} interactive={false} />);
    labels.push(<Marker key={`y${meter}`} position={[meter, 3]} icon={L.divIcon({ className: "axis-label", html: `${meter} m`, iconSize: [36, 16], iconAnchor: [18, 8] })} interactive={false} />);
  }
  return <>{labels}</>;
}

function formatPosition(position) {
  return `X ${position.x.toFixed(1)} m · Y ${position.y.toFixed(1)} m`;
}

export default function FieldMap({ robotStatus, setRobotStatus, plants, onInspectPlant, onSelectPlant }) {
  const [waypoints, setWaypoints] = useState([]);
  const [robotPosition, setRobotPosition] = useState(START);
  const [trail, setTrail] = useState([START]);
  const [activeTarget, setActiveTarget] = useState(0);
  const robotPositionRef = useRef(START);
  const inspectedThisMission = useRef(new Set());

  const route = useMemo(() => [START, ...waypoints], [waypoints]);
  const routeLine = route.map(({ x, y }) => [y, x]);

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
      const step = 0.7;
      const next = distance <= step
        ? target
        : { x: current.x + (dx / distance) * step, y: current.y + (dy / distance) * step };
      robotPositionRef.current = next;
      setRobotPosition(next);
      setTrail((points) => [...points, next]);

      plants.forEach((plant) => {
        if (!inspectedThisMission.current.has(plant.id) && Math.hypot(plant.x - next.x, plant.y - next.y) <= 1.6) {
          inspectedThisMission.current.add(plant.id);
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
  }, [activeTarget, onInspectPlant, plants, route, robotStatus, setRobotStatus, waypoints.length]);

  function startMission() {
    if (waypoints.length === 0) return;
    if (["Standby", "Stopped", "Completed"].includes(robotStatus)) {
      setRobotPosition(START);
      robotPositionRef.current = START;
      setTrail([START]);
      setActiveTarget(0);
      inspectedThisMission.current.clear();
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

  function moveWaypoint(id, event) {
    const point = { x: Number(event.target.getLatLng().lng.toFixed(1)), y: Number(event.target.getLatLng().lat.toFixed(1)) };
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
            <p className="mt-1 text-sm text-gray-500">Champ de 100 × 100 m · coordonnées locales X/Y · cliquez pour ajouter un waypoint</p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${robotStatus === "Running" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{robotStatus}</span>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="relative h-[460px] overflow-hidden rounded-xl border border-green-900/20 bg-[#788c55] md:h-[560px]">
              <MapContainer crs={L.CRS.Simple} center={[50, 50]} zoom={0} minZoom={-1} maxZoom={3} zoomControl style={{ height: "100%", width: "100%", background: "#788c55" }}>
                <FitField />
                <ImageOverlay url="/fields/mixed-crops.svg" bounds={FIELD_BOUNDS} interactive={false} />
                <FieldClicks onAdd={addWaypoint} />
                <FieldGrid />
                <CoordinateLabels />
                {plants.map((plant) => <CircleMarker key={plant.id} center={[plant.y, plant.x]} radius={6} pathOptions={{ color: "#fff", weight: 1.5, fillColor: getMapColor(plant.status), fillOpacity: 0.95 }} eventHandlers={{ click: () => onSelectPlant(plant.id) }}><Tooltip direction="top"><b>{plant.id}</b> · {plant.cropName} · {plant.name}<br />X {plant.x.toFixed(1)} m · Y {plant.y.toFixed(1)} m<br />{plant.status}<br /><span style={{ color: "#166534", fontWeight: 700 }}>View Plant Profile →</span></Tooltip></CircleMarker>)}
                <Polyline positions={routeLine} pathOptions={{ color: "#fff", weight: 7, opacity: 0.9, lineCap: "round", lineJoin: "round" }} />
                <Polyline positions={routeLine} pathOptions={{ color: "#ef4444", weight: 3, opacity: 0.95, lineCap: "round", lineJoin: "round" }} />
                {trail.length > 1 && <Polyline positions={trail.map(({ x, y }) => [y, x])} pathOptions={{ color: "#fbbf24", weight: 4, opacity: 0.95, lineCap: "round" }} />}
                <CircleMarker center={[START.y, START.x]} radius={10} pathOptions={{ color: "white", weight: 3, fillColor: "#16a34a", fillOpacity: 1 }}><Tooltip permanent direction="top" offset={[0, -8]}>DÉPART</Tooltip></CircleMarker>
                {waypoints.map((point, index) => <Marker key={point.id} position={[point.y, point.x]} icon={waypointIcon(index + 1)} draggable eventHandlers={{ dragend: (event) => moveWaypoint(point.id, event) }}><Tooltip direction="top">P{index + 1} · {formatPosition(point)}</Tooltip></Marker>)}
                {waypoints.length > 0 && <CircleMarker center={[waypoints[waypoints.length - 1].y, waypoints[waypoints.length - 1].x]} radius={13} pathOptions={{ color: "white", weight: 2, fillColor: "#dc2626", fillOpacity: 0.3 }} />}
                <Marker position={[robotPosition.y, robotPosition.x]} icon={robotIcon} zIndexOffset={1000}><Tooltip permanent direction="right">RoboCore</Tooltip></Marker>
              </MapContainer>
              <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-gray-700 shadow">Nord ↑ <span className="ml-2 font-normal text-gray-500">Échelle locale en mètres</span></div>
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
      <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900"><Bot size={18} className="mt-0.5 shrink-0" /><p>Simulation locale : chaque clic est converti directement en mètres dans le repère du champ. Zoom et déplacement de la carte ne changent pas les coordonnées enregistrées.</p></div>
    </div>
  );
}
