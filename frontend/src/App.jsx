
import { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Navigate, useLocation, useNavigate } from "react-router-dom";
import FieldMap from "./pages/FieldMap";
import PlantProfiles from "./pages/PlantProfiles";
import Login from "./pages/Login";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { useAuth } from "./auth/useAuth";
import DetectionResults from "./pages/DetectionResults";
import TreatmentRecommendations from "./pages/TreatmentRecommendations";
import CropReport from "./pages/CropReport";
import { cropCatalog, getCropConfig, initialPlants, inspectPlant } from "./data/plants";
import CropFilter from "./components/CropFilter";

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
  LogOut,
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

const pagePaths = {
  Dashboard: "/dashboard",
  "Field Map": "/field-map",
  "Robot Control": "/robot-control",
  "AI Plant Detection": "/ai-plant-detection",
  "Plant Profiles": "/plant-profiles",
  Treatments: "/treatments",
  Reports: "/reports",
};

function Workspace() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = Object.keys(pagePaths).find((page) => pagePaths[page] === location.pathname);
  const [cropFilter, setCropFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [robotStatus, setRobotStatus] = useState("Standby");
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [plants, setPlants] = useState(() => {
    try {
      const saved = localStorage.getItem("robocore.plants.v1");
      if (!saved) return initialPlants;
      const restored = JSON.parse(saved);
      if (!Array.isArray(restored)) return initialPlants;
      const codeToCrop = Object.fromEntries(cropCatalog.map((crop) => [crop.code, crop]));
      const migrated = restored.map((plant) => {
        const config = plant.cropType ? getCropConfig(plant.cropType) : codeToCrop[plant.id?.split("-")[0]] || cropCatalog[0];
        const status = ["Disease Suspected", "Anomaly Detected"].includes(plant.status) ? "Potential Anomaly" : plant.status === "Needs Verification" ? "Unknown / Verify" : plant.status;
        return {
          ...plant,
          cropType: config.key,
          cropName: config.name,
          status,
          detection: { ...plant.detection, cropType: config.key, cropName: config.name, model: plant.detection?.model || config.model, diseaseName: null, issueName: status === "Healthy" ? "Aucune anomalie visuelle signalée" : status === "Unknown / Verify" ? "Inconnu / à vérifier" : "Anomalie visuelle à vérifier", result: status, confidence: status === "Unknown / Verify" ? null : plant.detection?.confidence ?? null },
          treatment: { ...plant.treatment, product: null, activeSubstance: null, authorizedUse: "Non vérifié — aucun produit indiqué.", suspectedProblem: status === "Healthy" ? "Aucun problème suspecté" : "Anomalie visuelle à vérifier" },
        };
      });
      const ids = new Set(migrated.map((plant) => plant.id));
      return [...migrated, ...initialPlants.filter((plant) => !ids.has(plant.id))];
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
    navigate(pagePaths["Plant Profiles"]);
  };

  const visiblePlants = cropFilter === "all" ? plants : plants.filter((plant) => plant.cropType === cropFilter);

  if (loading) return <div className="auth-loading"><span className="login-spinner" /> Restoring your secure session…</div>;
  if (!user) return location.pathname === "/login" ? <Login /> : <Navigate to="/login" replace state={{ from: location }} />;
  if (location.pathname === "/login" || location.pathname === "/") return <Navigate to={pagePaths.Dashboard} replace />;
  if (!activePage) return <Navigate to={pagePaths.Dashboard} replace />;

  const inspectedCount = visiblePlants.filter((plant) => plant.lastInspection).length;
  const healthyCount = visiblePlants.filter((plant) => plant.status === "Healthy").length;
  const flaggedCount = visiblePlants.filter((plant) => plant.status !== "Healthy").length;
  const stats = { battery: 95, reservoir: 80, inspected: inspectedCount, healthy: healthyCount, anomalies: flaggedCount };

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
      name: "Potential Anomalies / To Verify",
      value: stats.anomalies,
      icon: ShieldAlert,
    },
    {
      name: "Crop Types Monitored",
      value: new Set(visiblePlants.map((plant) => plant.cropType)).size,
      icon: Sprout,
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
                  navigate(pagePaths[item.name]);
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
          <div className="mt-5 border-t border-green-800 pt-4">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-green-300">{user.email}</p>
            <button onClick={async () => { await signOut(); navigate("/login", { replace: true }); }} className="mt-4 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-green-100 hover:bg-green-900" type="button">
              <LogOut size={17} /> Sign Out
            </button>
          </div>
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
          {activePage !== "Robot Control" && <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-gray-500">Consultation filtrée par culture</p><CropFilter value={cropFilter} onChange={setCropFilter} /></div>}
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
              plants={visiblePlants}
              onInspectPlant={inspectTree}
              onSelectPlant={openPlantProfile}
            />
          ) : activePage === "Plant Profiles" ? (
            <PlantProfiles
              plants={visiblePlants}
              selectedPlantId={selectedPlantId}
              onSelectPlant={setSelectedPlantId}
              onClearSelection={() => setSelectedPlantId(null)}
              onOpenFieldMap={() => { setSelectedPlantId(null); navigate(pagePaths["Field Map"]); }}
            />
          ) : activePage === "AI Plant Detection" ? (
            <DetectionResults plants={visiblePlants} onOpenPlant={openPlantProfile} />
          ) : activePage === "Treatments" ? (
            <TreatmentRecommendations plants={visiblePlants} onOpenPlant={openPlantProfile} />
          ) : activePage === "Reports" ? (
            <CropReport plants={visiblePlants} />
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

export default function App() {
  return <BrowserRouter><AuthProvider><Workspace /></AuthProvider></BrowserRouter>;
}
