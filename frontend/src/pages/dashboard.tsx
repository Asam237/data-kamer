import React, { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/SideBar";
import Dashboard from "../components/Dashboard";
import RegionsView from "../components/RegionsView";
import UniversitiesView from "../components/UniversitiesView";
import StatsView from "../components/StatsView";
import CompareView from "../components/CompareView";
import cameroonData from "../../data/cameroon.json";
import MapView from "@/components/MapView";
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

// Vues qui occupent toute la hauteur disponible (cartes plein écran)
const FULL_HEIGHT_VIEWS: ViewType[] = ["map", "outages"];

const DashboardPage = () => {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [data] = useState(cameroonData);
  const [pendingSearch, setPendingSearch] = useState<string>("");
  const [commandOpen, setCommandOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = (view: ViewType, search?: string) => {
    setPendingSearch(search ?? "");
    setActiveView(view);
    setSidebarOpen(false);
  };

  const handleSetActiveView = (view: ViewType) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  const isFullHeight = FULL_HEIGHT_VIEWS.includes(activeView);

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
          <motion.div {...viewProps} className="h-full">
            <EneoOutageView />
          </motion.div>
        );
      case "map":
        return (
          <motion.div {...viewProps} className="h-full">
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
    <div className="flex h-app overflow-hidden bg-background">
      <Sidebar
        activeView={activeView}
        setActiveView={handleSetActiveView}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 min-w-0 lg:ml-64 flex flex-col h-full">
        <Topbar
          title={VIEW_TITLES[activeView]}
          onOpenCommandPalette={() => setCommandOpen(true)}
          onOpenFavorites={() => setFavoritesOpen(true)}
          onOpenMenu={() => setSidebarOpen(true)}
        />
        <div
          className={`flex-1 min-h-0 ${
            isFullHeight ? "overflow-hidden" : "overflow-y-auto"
          }`}
        >
          {renderView()}
        </div>
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
