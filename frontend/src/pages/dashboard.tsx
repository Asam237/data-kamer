import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/SideBar";
import Dashboard from "../components/Dashboard";
import RegionsView from "../components/RegionsView";
import UniversitiesView from "../components/UniversitiesView";
import StatsView from "../components/StatsView";
import SettingsView from "../components/SettingsView";
import { useOverview } from "@/hooks/useOverview";
import { useRegions } from "@/hooks/useRegions";
import { useUniversities } from "@/hooks/useUniversities";
import MapView from "@/components/MapView";
import { Monitor } from "lucide-react";
import EneoOutageView from "@/components/OutageView";

type ViewType =
  | "dashboard"
  | "regions"
  | "universities"
  | "stats"
  | "settings"
  | "outages"
  | "map";

const DashboardPage = () => {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const { overview } = useOverview();
  const { regions } = useRegions();
  const { universities } = useUniversities();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    let timer: any;

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScreenSize);
    };
  }, [isMobile]);

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

  // Créer un objet de données compatible avec StatsView
  const statsData =
    overview && regions && universities
      ? {
          regions,
          universities,
          overview,
        }
      : null;
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
            <Dashboard />
          </motion.div>
        );
      case "regions":
        return (
          <motion.div {...viewProps}>
            <RegionsView />
          </motion.div>
        );
      case "universities":
        return (
          <motion.div {...viewProps}>
            <UniversitiesView />
          </motion.div>
        );
      case "stats":
        return (
          <motion.div {...viewProps}>
            <StatsView />
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
      default:
        return (
          <motion.div {...viewProps}>
            <Dashboard />
          </motion.div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 ml-64 overflow-auto">
        <div>{renderView()}</div>
      </main>
    </div>
  );
};

export default DashboardPage;
