import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { motion } from "framer-motion";
import Sidebar from "../components/SideBar";
import Topbar from "@/components/Topbar";
import CommandPalette, { ViewType } from "@/components/CommandPalette";
import FavoritesModal from "@/components/FavoritesModal";
import { getDataset } from "@/lib/dataset";

// Chaque vue est chargée à la demande : recharts, pigeon-maps, etc. ne sont
// téléchargés que lorsque la vue qui les utilise est ouverte.
const ViewLoading = () => (
  <div className="flex items-center justify-center min-h-[50vh]" role="status">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    <span className="ml-3 text-muted-foreground">Chargement de la vue…</span>
  </div>
);
// Les appels `dynamic(() => import("..."))` doivent rester écrits tels quels
// (pas de fonction utilitaire) : Next.js les analyse à la compilation pour
// précharger avant hydratation le chunk de la vue rendue côté serveur. Sinon
// le client hydrate avec l'état de chargement → erreur d'hydratation.
const Dashboard = dynamic(() => import("../components/Dashboard"), {
  loading: ViewLoading,
});
const RegionsView = dynamic(() => import("../components/RegionsView"), {
  loading: ViewLoading,
});
const UniversitiesView = dynamic(
  () => import("../components/UniversitiesView"),
  { loading: ViewLoading }
);
const StatsView = dynamic(() => import("../components/StatsView"), {
  loading: ViewLoading,
});
const CompareView = dynamic(() => import("../components/CompareView"), {
  loading: ViewLoading,
});
const DataView = dynamic(() => import("@/components/DataView"), {
  loading: ViewLoading,
});
const SettingsView = dynamic(() => import("@/components/SettingsView"), {
  loading: ViewLoading,
});
// Les cartes dépendent de window : rendu client uniquement
const MapView = dynamic(() => import("@/components/MapView"), {
  loading: ViewLoading,
  ssr: false,
});
const EneoOutageView = dynamic(() => import("@/components/OutageView"), {
  loading: ViewLoading,
  ssr: false,
});

const VIEW_TITLES: Record<ViewType, string> = {
  dashboard: "Tableau de bord",
  regions: "Régions du Cameroun",
  universities: "Universités du Cameroun",
  compare: "Comparateur de régions",
  map: "Carte interactive",
  outages: "Coupures de courant ENEO",
  stats: "Statistiques avancées",
  data: "Données & sources",
  settings: "Paramètres",
};

const isViewType = (value: string): value is ViewType =>
  Object.prototype.hasOwnProperty.call(VIEW_TITLES, value);

const viewFromHash = (): ViewType | null => {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  return isViewType(hash) ? hash : null;
};

// Vues qui occupent toute la hauteur disponible (cartes plein écran)
const FULL_HEIGHT_VIEWS: ViewType[] = ["map", "outages"];

const dataset = getDataset();

const DashboardPage = () => {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [pendingSearch, setPendingSearch] = useState<string>("");
  const [commandOpen, setCommandOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // L'URL reflète la vue active (#regions, #map, ...) : liens partageables et
  // boutons précédent/suivant du navigateur fonctionnels.
  useEffect(() => {
    const syncFromHash = () => setActiveView(viewFromHash() ?? "dashboard");
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const goTo = useCallback((view: ViewType) => {
    setActiveView(view);
    setSidebarOpen(false);
    if (window.location.hash !== `#${view}`) {
      window.history.pushState(null, "", `#${view}`);
    }
  }, []);

  const handleNavigate = useCallback(
    (view: ViewType, search?: string) => {
      setPendingSearch(search ?? "");
      goTo(view);
    },
    [goTo]
  );

  const isFullHeight = FULL_HEIGHT_VIEWS.includes(activeView);

  const renderView = () => {
    switch (activeView) {
      case "regions":
        return <RegionsView initialSearch={pendingSearch} />;
      case "universities":
        return <UniversitiesView initialSearch={pendingSearch} />;
      case "compare":
        return <CompareView />;
      case "stats":
        return <StatsView data={dataset} />;
      case "outages":
        return <EneoOutageView />;
      case "map":
        return <MapView />;
      case "data":
        return <DataView />;
      case "settings":
        return <SettingsView />;
      case "dashboard":
      default:
        return <Dashboard data={dataset.overview} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-app overflow-hidden bg-background">
      <Head>
        <title>{`${VIEW_TITLES[activeView]} · Data Kamer`}</title>
      </Head>
      <Sidebar
        activeView={activeView}
        setActiveView={goTo}
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
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={isFullHeight ? "h-full" : undefined}
          >
            {renderView()}
          </motion.div>
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
