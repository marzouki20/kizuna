
import { useCallback, useEffect, useState } from "react";
import FieldMap from "./pages/FieldMap";
import PlantProfiles from "./pages/PlantProfiles";
import { formatDate, statusStyle } from "./components/plantProfileUtils";
import { initialPlants, inspectPlant } from "./data/plants";

import {
  LayoutDashboard,
  Map,
  Bot,
  ScanSearch,
  Droplets,
  BarChart3,
  BatteryFull,
  Sprout,
  ShieldAlert,
  Activity,
  Play,
  Pause,
  Square,
  Bell,
  Menu,
  X,
  Wifi,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Field Map", icon: Map },
  { name: "Robot Control", icon: Bot },
  { name: "AI Plant Detection", icon: ScanSearch },
  { name: "Plant Profiles", icon: Sprout },
  { name: "Treatments", icon: Droplets },
  { name: "Reports", icon: BarChart3 },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [robotStatus, setRobotStatus] = useState("Standby");
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [plants, setPlants] = useState(() => {
    try {
      const saved = localStorage.getItem("robocore.plants.v1");
      return saved ? JSON.parse(saved) : initialPlants;
    } catch {
      return initialPlants;
    }
  });

  useEffect(() => {
    localStorage.setItem("robocore.plants.v1", JSON.stringify(plants));
  }, [plants]);

  const inspectTree = useCallback((plantId) => {
    setPlants((currentPlants) => currentPlants.map((plant) =>
      plant.id === plantId ? inspectPlant(plant) : plant,
    ));
  }, []);

  const openPlantProfile = (plantId) => {
    setSelectedPlantId(plantId);
    setActivePage("Plant Profiles");
  };

  const inspectedCount = plants.filter((plant) => plant.lastInspection).length;
  const healthyCount = plants.filter((plant) => plant.status === "Healthy").length;
  const flaggedCount = plants.filter((plant) => ["Anomaly Detected", "Disease Suspected"].includes(plant.status)).length;
  const stats = { battery: 95, reservoir: 80, inspected: inspectedCount, healthy: healthyCount, diseased: flaggedCount, treatments: 0 };

  const cards = [
    {
      name: "Battery Level",
      value: `${stats.battery}%`,
      icon: BatteryFull,
    },
    {
      name: "Reservoir Level",
      value: `${stats.reservoir}%`,
      icon: Droplets,
    },
    {
      name: "Plants Inspected",
      value: stats.inspected,
      icon: Sprout,
    },
    {
      name: "Healthy Plants",
      value: stats.healthy,
      icon: Activity,
    },
    {
      name: "Detected Anomalies",
      value: stats.diseased,
      icon: ShieldAlert,
    },
    {
      name: "Treatments Done",
      value: stats.treatments,
      icon: Droplets,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-30 inset-y-0 left-0 w-64
        bg-green-950 text-white p-5 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Bot size={32} className="text-green-400" />

            <div>
              <h1 className="text-2xl font-bold">
                RoboCore
              </h1>
              <p className="text-xs text-green-300">
                Smart Agriculture
              </p>
            </div>
          </div>

          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => {
                  setActivePage(item.name);
                  setSidebarOpen(false);
                  if (item.name === "Plant Profiles") setSelectedPlantId(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3
                rounded-xl text-left transition ${
                  activePage === item.name
                    ? "bg-green-700 text-white"
                    : "text-green-100 hover:bg-green-900"
                }`}
              >
                <Icon size={20} />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-green-800 pt-4 text-sm text-green-300">
          RoboCore v1.0
          <p className="text-xs mt-1">
            Simulation Mode
          </p>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-700"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </button>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {activePage}
              </h2>

              <p className="text-sm text-gray-500">
                Agricultural Robot Monitoring System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-2 text-sm text-green-700">
              <Wifi size={17} />
              Demo Mode
            </span>

            <Bell className="text-gray-600" size={21} />
          </div>
        </header>

        <main className="p-5 md:p-8 max-w-7xl mx-auto space-y-7">
          {activePage === "Dashboard" ? (
            <>
              {/* Welcome */}
              <div className="bg-gradient-to-r from-green-900 to-green-700 text-white p-7 rounded-2xl">
                <h2 className="text-3xl font-bold">
                  Welcome to RoboCore
                </h2>

                <p className="mt-2 text-green-100">
                  Intelligent crop monitoring and autonomous
                  robot control.
                </p>

                <p className="mt-3 text-xs text-green-200">
                  Demonstration data — no physical robot connected.
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {cards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.name}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-500 text-sm">
                            {card.name}
                          </p>

                          <h3 className="text-3xl font-bold text-gray-800 mt-3">
                            {card.value}
                          </h3>
                        </div>

                        <div className="p-3 rounded-xl bg-green-50">
                          <Icon
                            size={24}
                            className="text-green-700"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Robot Control */}
              <section className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-bold text-gray-800">
                    Robot Control
                  </h3>

                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                    {robotStatus}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setRobotStatus("Running")}
                    className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-xl"
                  >
                    <Play size={18} />
                    Start Mission
                  </button>

                  <button
                    onClick={() => {
                      if (robotStatus === "Running") {
                        setRobotStatus("Paused");
                      }
                    }}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl"
                  >
                    <Pause size={18} />
                    Pause
                  </button>

                  <button
                    onClick={() => setRobotStatus("Stopped")}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl"
                  >
                    <Square size={18} />
                    Stop Robot
                  </button>
                </div>

                <p className="text-sm text-gray-400 mt-4">
                  Simulation only. No physical robot connected.
                </p>
              </section>

              {/* System Overview */}
              <section className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold mb-4">
                  System Overview
                </h3>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <Wifi className="text-green-700 mb-2" />
                    <p className="font-semibold">Connection</p>
                    <p className="text-sm text-gray-500">
                      Simulation active
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4">
                    <ScanSearch className="text-green-700 mb-2" />
                    <p className="font-semibold">AI Detection</p>
                    <p className="text-sm text-gray-500">
                      Mock AI service
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4">
                    <Bot className="text-green-700 mb-2" />
                    <p className="font-semibold">Robot</p>
                    <p className="text-sm text-gray-500">
                      Virtual robot
                    </p>
                  </div>
                </div>
              </section>
            </>
          ) : activePage === "Field Map" ? (
            <FieldMap
              robotStatus={robotStatus}
              setRobotStatus={setRobotStatus}
              plants={plants}
              onInspectPlant={inspectTree}
              onSelectPlant={openPlantProfile}
            />
          ) : activePage === "Plant Profiles" ? (
            <PlantProfiles
              plants={plants}
              selectedPlantId={selectedPlantId}
              onSelectPlant={setSelectedPlantId}
              onClearSelection={() => setSelectedPlantId(null)}
              onOpenFieldMap={() => { setSelectedPlantId(null); setActivePage("Field Map"); }}
            />
          ) : activePage === "AI Plant Detection" ? (
            <section className="space-y-5">
              <div className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><ScanSearch className="text-green-700" /><div><h2 className="text-2xl font-bold">AI Plant Detection</h2><p className="mt-1 text-sm text-gray-500">Simulated visual flags from the shared olive profiles. These are not confirmed diagnoses.</p></div></div><div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">All classifications and confidence scores in this demo are simulated and require qualified agronomic review.</div></div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{plants.filter((plant) => plant.status !== "Healthy").map((plant) => <article key={plant.id} className="overflow-hidden rounded-xl bg-white shadow-sm"><img src={plant.detection.analyzedPhoto} alt={`Simulated canopy scan for ${plant.id}`} className="h-36 w-full object-cover" /><div className="p-4"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-bold text-green-800">{plant.id}</p><h3 className="font-bold">{plant.name}</h3></div><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyle(plant.status)}`}>{plant.status}</span></div><p className="mt-2 text-sm text-gray-600">{plant.detection.issueName}</p><p className="mt-2 text-xs text-gray-500">Confidence {plant.detection.confidence}% · {formatDate(plant.detection.detectedAt, true)}</p><button onClick={() => openPlantProfile(plant.id)} className="mt-4 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800">View Plant Profile</button></div></article>)}</div>
            </section>
          ) : activePage === "Treatments" ? (
            <section className="space-y-5">
              <div className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Droplets className="text-green-700" /><div><h2 className="text-2xl font-bold">Treatment Recommendations</h2><p className="mt-1 text-sm text-gray-500">Review is required before any real world use.</p></div></div><div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">Products and active substances have not been verified against official labels. No dosage or application advice is provided. Treatment actions are simulated.</div></div>
              <div className="space-y-3">{plants.filter((plant) => plant.status !== "Healthy").map((plant) => <article key={plant.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><img src={plant.photo} alt="Olive tree" className="h-16 w-20 rounded-lg object-cover" /><div><p className="text-xs font-bold text-green-800">{plant.id} · {plant.name}</p><p className="mt-1 font-semibold text-gray-900">{plant.treatment.suspectedProblem}</p><p className="mt-1 text-sm text-gray-500">{plant.treatment.product} · {plant.treatment.status}</p></div></div><button onClick={() => openPlantProfile(plant.id)} className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-50">Review recommendation</button></article>)}</div>
            </section>
          ) : (
            <section className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-3">
                {activePage}
              </h2>

              <p className="text-gray-500">
                This module will be implemented in the next
                development step.
              </p>
            </section>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
    </div>
  );
}

export default App;
