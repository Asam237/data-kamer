import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/SideBar";
import Dashboard from "../components/Dashboard";
import RegionsView from "../components/RegionsView";
import UniversitiesView from "../components/UniversitiesView";
import StatsView from "../components/StatsView";
import SettingsView from "../components/SettingsView";
import { cameroonData } from "../../data/cameroon";

type ViewType = "dashboard" | "regions" | "universities" | "stats" | "settings";

const DashboardPage = () => {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [data, setData] = useState(cameroonData);

  const renderView = () => {
    const viewProps = {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: { duration: 0.3 }
    };

    switch (activeView) {
      case "dashboard":
        return (
          <motion.div {...viewProps}>
            <Dashboard data={data.overview} />
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
            <StatsView data={data} />
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
            <Dashboard data={data.overview} />
          </motion.div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;