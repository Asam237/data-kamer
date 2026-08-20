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
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 md:ml-64 overflow-auto flex flex-col min-w-0">
        <Topbar
          title={VIEW_TITLES[activeView]}
          onOpenCommandPalette={() => setCommandOpen(true)}
          onOpenFavorites={() => setFavoritesOpen(true)}
          onOpenSidebar={() => setSidebarOpen(true)}
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
