import React from "react";
import { motion } from "framer-motion";
import {
  Home,
  MapPin,
  GraduationCap,
  BarChart3,
  Settings,
  TrendingUp,
  Map,
  Zap,
} from "lucide-react";

type NavigationItem = {
  name: string;
  key:
    | "dashboard"
    | "regions"
    | "universities"
    | "stats"
    | "settings"
    | "map"
    | "outages";
  icon: any;
  description: string;
};

const navigation: NavigationItem[] = [
  {
    name: "Tableau de bord",
    key: "dashboard",
    icon: Home,
    description: "Vue d'ensemble des données",
  },
  // {
  //   name: "Régions",
  //   key: "regions",
  //   icon: MapPin,
  //   description: "Exploration des régions",
  // },
  // {
  //   name: "Universités",
  //   key: "universities",
  //   icon: GraduationCap,
  //   description: "Institutions d'enseignement",
  // },
  {
    name: "Carte",
    key: "map",
    icon: Map,
    description: "Données géographiques",
  },
  {
    name: "Coupures",
    key: "outages",
    icon: Zap,
    description: "Coupures de courant ENEO",
  },
  {
    name: "Statistiques",
    key: "stats",
    icon: BarChart3,
    description: "Analyses avancées",
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
                    <div
                      className={`font-medium ${isActive ? "text-white" : ""}`}
                    >
                      {item.name}
                    </div>
                    <div
                      className={`text-xs opacity-70 ${
                        isActive ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
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
            <p className="text-xs text-gray-500 mb-3">
              © {new Date().getFullYear()} DataKamer
            </p>

            {/* Social Networks */}
            <div className="flex items-center justify-center space-x-4 mb-3">
              <a
                href="https://github.com/Asam237/data-kamer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title="GitHub"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://x.com/asam_237"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
                title="X (Twitter)"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/in/abba-sali-aboubakar-mamate/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                title="LinkedIn"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
