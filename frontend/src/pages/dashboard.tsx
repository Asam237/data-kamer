import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/SideBar";
import Dashboard from "../components/Dashboard";
import RegionsView from "../components/RegionsView";
import UniversitiesView from "../components/UniversitiesView";
import StatsView from "../components/StatsView";
import CompareView from "../components/CompareView";
import cameroonData from "../../data/cameroon.json";
import MapView from "@/components/MapView";
import { Monitor } from "lucide-react";
import EneoOutageView from "@/components/OutageView";
import SettingsView from "@/components/SettingsView";
import Topbar from "@/components/Topbar";
import CommandPalette, { ViewType } from "@/components/CommandPalette";
import FavoritesModal from "@/components/FavoritesModal";

const VIEW_TITLES: Record<ViewType, string> = {
  dashboard: "Tableau de bord",
  regions: "Régions du Cameroun",
  universities: "Universités du Cameroun",
  compare: "Comparateur de régions",
  map: "Carte interactive",
  outages: "Coupures de courant ENEO",
  stats: "Statistiques avancées",
  settings: "Paramètres",
};

const DashboardPage = () => {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [data] = useState(cameroonData);
  const [pendingSearch, setPendingSearch] = useState<string>("");
  const [commandOpen, setCommandOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const handleNavigate = (view: ViewType, search?: string) => {
    setPendingSearch(search ?? "");
    setActiveView(view);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-sm"
        >
          <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Monitor className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Data<span className="text-blue-600">Kamer</span>
            </h1>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Application Desktop uniquement
              </h2>
              <p className="text-gray-600 mb-4">
                Pour une meilleure expérience de visualisation des données,
                veuillez vous connecter depuis un ordinateur.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
                <p className="font-medium mb-1">
                  📊 Tableaux de bord interactifs
                </p>
                <p className="font-medium mb-1">📈 Graphiques détaillés</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const renderView = () => {
    const viewProps = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3 },
    };

    switch (activeView) {
      case "dashboard":
        return (
          <motion.div {...viewProps}>
            <Dashboard data={data.overview} onNavigate={handleNavigate} />
          </motion.div>
        );
      case "regions":
        return (
          <motion.div {...viewProps}>
            <RegionsView initialSearch={pendingSearch} />
          </motion.div>
        );
      case "universities":
        return (
          <motion.div {...viewProps}>
            <UniversitiesView initialSearch={pendingSearch} />
          </motion.div>
        );
      case "compare":
        return (
          <motion.div {...viewProps}>
            <CompareView />
          </motion.div>
        );
      case "stats":
        return (
          <motion.div {...viewProps}>
            <StatsView data={data as any} />
          </motion.div>
        );
      case "outages":
        return (
          <motion.div {...viewProps}>
            <EneoOutageView />
          </motion.div>
        );
      case "map":
        return (
          <motion.div {...viewProps}>
            <MapView />
          </motion.div>
        );
      case "settings":
        return (
          <motion.div {...viewProps}>
            <SettingsView />
          </motion.div>
        );
      default:
        return (
          <motion.div {...viewProps}>
            <Dashboard data={data.overview} onNavigate={handleNavigate} />
          </motion.div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 ml-64 overflow-auto flex flex-col">
        <Topbar
          title={VIEW_TITLES[activeView]}
          onOpenCommandPalette={() => setCommandOpen(true)}
          onOpenFavorites={() => setFavoritesOpen(true)}
        />
        <div className="flex-1">{renderView()}</div>
      </main>

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onNavigate={handleNavigate}
      />
      <FavoritesModal
        open={favoritesOpen}
        onOpenChange={setFavoritesOpen}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default DashboardPage;
