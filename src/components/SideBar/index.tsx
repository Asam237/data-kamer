import React from "react";
import { motion } from "framer-motion";
import {
  Home,
  MapPin,
  GraduationCap,
  BarChart3,
  Settings,
  TrendingUp
} from "lucide-react";

type NavigationItem = {
  name: string;
  key: "dashboard" | "regions" | "universities" | "stats" | "settings";
  icon: any;
  description: string;
};

const navigation: NavigationItem[] = [
  { 
    name: "Tableau de bord", 
    key: "dashboard", 
    icon: Home,
    description: "Vue d'ensemble des données"
  },
  { 
    name: "Régions", 
    key: "regions", 
    icon: MapPin,
    description: "Exploration des régions"
  },
  { 
    name: "Universités", 
    key: "universities", 
    icon: GraduationCap,
    description: "Institutions d'enseignement"
  },
  { 
    name: "Statistiques", 
    key: "stats", 
    icon: BarChart3,
    description: "Analyses avancées"
  },
  { 
    name: "Paramètres", 
    key: "settings", 
    icon: Settings,
    description: "Configuration"
  },
];

type SidebarProps = {
  activeView: NavigationItem["key"];
  setActiveView: (view: NavigationItem["key"]) => void;
};

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-50"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center h-20 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-600/20 animate-pulse"></div>
          <div className="relative flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                DataKamer
              </h2>
              <p className="text-xs text-blue-100 opacity-80">
                Analytics Platform
              </p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item, index) => {
            const isActive = activeView === item.key;
            const Icon = item.icon;
            return (
              <motion.button
                key={item.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveView(item.key)}
                className={`group w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-2"
                }`}
                whileHover={{ scale: isActive ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBackground"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative flex items-center w-full">
                  <Icon
                    className={`w-5 h-5 mr-3 transition-all duration-300 ${
                      isActive 
                        ? "text-white transform rotate-12" 
                        : "text-gray-500 group-hover:text-blue-500"
                    }`}
                  />
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${isActive ? "text-white" : ""}`}>
                      {item.name}
                    </div>
                    <div className={`text-xs opacity-70 ${
                      isActive ? "text-blue-100" : "text-gray-400"
                    }`}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </div>
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50"
        >
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              © {new Date().getFullYear()} DataKamer
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">Système opérationnel</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}