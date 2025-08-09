import React from "react";
import {
  HomeIcon,
  MapIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

type NavigationItem = {
  name: string;
  key: "dashboard" | "regions" | "universities" | "stats" | "settings";
  icon: any;
};

const navigation: NavigationItem[] = [
  { name: "Tableau de bord", key: "dashboard", icon: HomeIcon },
  { name: "Régions", key: "regions", icon: MapIcon },
  { name: "Universités", key: "universities", icon: BuildingLibraryIcon },
  { name: "Statistiques", key: "stats", icon: ChartBarIcon },
  { name: "Paramètres", key: "settings", icon: Cog6ToothIcon },
];

type SidebarProps = {
  activeView: NavigationItem["key"];
  setActiveView: (view: NavigationItem["key"]) => void;
};

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out hover:shadow-xl">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-20 px-4 bg-gradient-to-r from-primary-600 to-primary-500">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            DataKamer
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = activeView === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary-50 text-primary-700 border-r-4 border-primary-500 transform scale-105"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 ${
                    isActive ? "text-primary-500" : "text-gray-500"
                  }`}
                />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} DataKamer. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
