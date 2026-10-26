import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Map as MapIcon, List, Menu, Zap } from "lucide-react";
import SourceBadge from "@/components/ui/SourceBadge";
import { useEneoOutages } from "@/hooks/useEneoOutages";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useGeocode } from "@/hooks/useGeocode";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { BoundsChanged, OutageInfo, OutageMatch, RegionOutage } from "./types";
import { CAMEROON_CENTER, INITIAL_ZOOM, REGION_COORDINATES, getOutageKey } from "./constants";
import Sidebar from "./Sidebar";
import MapPanel from "./MapPanel";
import ListPanel from "./ListPanel";
import DetailsPanel from "./DetailsPanel";

const EneoOutageView: React.FC = () => {
  const { outageData, loading, error } = useEneoOutages();
  const { geocodeLocation } = useGeocode();

  const [center, setCenter] = useState<[number, number]>(CAMEROON_CENTER);
  const [zoom, setZoom] = useState<number>(INITIAL_ZOOM);
  const [selectedRegion, setSelectedRegion] = useState<RegionOutage | null>(null);
  const [showRegions, setShowRegions] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [tooltipRegion, setTooltipRegion] = useState<RegionOutage | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const { userLocation, locationError, locationPrompted, requestUserLocation, clearLocationError } =
    useUserLocation({
      onLocated: (coords) => {
        setCenter(coords);
        setZoom(12);
      },
    });

  // La liste des régions est repliée par défaut sur mobile/tablette
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  // Sélection initiale: une région avec coupures si possible, sinon la première.
  useEffect(() => {
    if (selectedRegion || outageData.length === 0) return;
    const withOutages = outageData.find(
      (region) => region.outages.data && region.outages.data.length > 0
    );
    setSelectedRegion(withOutages ?? outageData[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outageData]);

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 250);
  const trimmedSearch = debouncedSearchTerm.trim().toLowerCase();

  // Recherche par ville/quartier: on liste directement les coupures qui
  // correspondent (plutôt que la région entière) pour pouvoir centrer la
  // carte précisément sur le lieu recherché, triées par pertinence.
  const matches: OutageMatch[] = useMemo(() => {
    if (!trimmedSearch) return [];

    const rank = (outage: OutageInfo, regionNameOnlyMatch: boolean): number => {
      const ville = outage.ville.toLowerCase();
      const quartier = outage.quartier.toLowerCase();
      if (ville === trimmedSearch || quartier === trimmedSearch) return 0;
      if (ville.startsWith(trimmedSearch) || quartier.startsWith(trimmedSearch)) return 1;
      if (ville.includes(trimmedSearch) || quartier.includes(trimmedSearch)) return 2;
      return regionNameOnlyMatch ? 3 : 4;
    };

    const results = outageData.flatMap((region) => {
      const regionNameMatches = region.regionName.toLowerCase().includes(trimmedSearch);
      return (region.outages.data || [])
        .filter(
          (outage) =>
            regionNameMatches ||
            outage.ville.toLowerCase().includes(trimmedSearch) ||
            outage.quartier.toLowerCase().includes(trimmedSearch)
        )
        .map((outage) => ({ region, outage, rank: rank(outage, regionNameMatches) }));
    });

    results.sort(
      (a, b) => a.rank - b.rank || a.outage.ville.localeCompare(b.outage.ville)
    );

    return results.map(({ region, outage }) => ({ region, outage }));
  }, [outageData, trimmedSearch]);

  const totalOutages = useMemo(
    () =>
      outageData.reduce(
        (total, region) => total + (region.outages.data ? region.outages.data.length : 0),
        0
      ),
    [outageData]
  );

  // Centre la carte sur une coupure précise (ville/quartier) d'une région,
  // ou sur la première coupure de la région si aucune n'est précisée.
  const handleOutageClick = useCallback(
    async (region: RegionOutage, outage?: OutageInfo): Promise<void> => {
      setSelectedRegion(region);
      setDetailsOpen(true);
      // Sur mobile/tablette, on referme la liste pour laisser place aux détails
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }

      const targetOutage = outage ?? region.outages.data?.[0];

      if (targetOutage) {
        const key = getOutageKey(region.regionCode, targetOutage);
        setPendingKey(key);
        try {
          const locationToSearch = targetOutage.quartier || targetOutage.ville;
          const city = targetOutage.ville || region.regionName;
          if (locationToSearch) {
            const coords = await geocodeLocation(locationToSearch, city);
            if (coords) {
              setCenter(coords);
              setZoom(14); // Zoom plus proche pour le niveau quartier
              return;
            }
          }
        } finally {
          setPendingKey((current) => (current === key ? null : current));
        }
      }

      // Repli: centrage sur la région si pas de coupure précise ou géocodage infructueux
      setCenter(REGION_COORDINATES[region.regionName]);
      setZoom(8);
    },
    [geocodeLocation]
  );

  const handleMarkerClick = useCallback(
    (region: RegionOutage) => {
      handleOutageClick(region);
    },
    [handleOutageClick]
  );

  const goToRegion = useCallback(
    (offset: number) => {
      if (!selectedRegion || outageData.length === 0) return;
      const currentIndex = outageData.findIndex(
        (r) => r.regionCode === selectedRegion.regionCode
      );
      const nextIndex = (currentIndex + offset + outageData.length) % outageData.length;
      handleOutageClick(outageData[nextIndex]);
    },
    [selectedRegion, outageData, handleOutageClick]
  );

  const handleMarkerHover = useCallback((region: RegionOutage): void => {
    setTooltipRegion(region);
    setShowTooltip(true);
  }, []);

  const handleMarkerLeave = useCallback((): void => {
    setShowTooltip(false);
  }, []);

  const handleZoomIn = useCallback((): void => {
    setZoom((z) => Math.min(z + 1, 18));
  }, []);

  const handleZoomOut = useCallback((): void => {
    setZoom((z) => Math.max(z - 1, 3));
  }, []);

  const resetView = useCallback((): void => {
    setCenter(CAMEROON_CENTER);
    setZoom(INITIAL_ZOOM);
    setSelectedRegion(null);
    setDetailsOpen(false);
  }, []);

  const centerOnUser = useCallback((): void => {
    if (userLocation) {
      setCenter(userLocation);
      setZoom(12);
      clearLocationError();
    } else {
      requestUserLocation();
    }
  }, [userLocation, clearLocationError, requestUserLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh] bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-foreground">Chargement des données...</p>
          <p className="text-muted-foreground mt-2">
            Récupération des informations sur les coupures ENEO
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh] bg-muted">
        <div className="bg-card border-l-4 border-red-500 shadow-lg rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-red-500">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-bold text-foreground mb-1">Erreur de chargement</h2>
              <p className="text-muted-foreground">{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-muted text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="bg-card border-border border-b px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center gap-2 shadow-sm transition-colors duration-300">
        <div className="flex items-center min-w-0 gap-2">
          <h1 className="text-base sm:text-xl font-bold flex items-center min-w-0">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-600 flex-shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Coupures ENEO</span>
              <span className="hidden sm:inline">Coupures de courant ENEO</span>
            </span>
          </h1>
          <SourceBadge source="outages" align="left" iconOnly />
        </div>
        <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            className={`p-2 rounded-full bg-muted hover:bg-muted/70 transition-colors flex items-center ${
              viewMode === "map" ? "text-blue-600" : ""
            }`}
            onClick={() => setViewMode("map")}
            title="Vue Carte"
          >
            <MapIcon className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Carte</span>
          </button>
          <button
            className={`p-2 rounded-full bg-muted hover:bg-muted/70 transition-colors flex items-center ${
              viewMode === "list" ? "text-blue-600" : ""
            }`}
            onClick={() => setViewMode("list")}
            title="Vue Liste"
          >
            <List className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Liste</span>
          </button>
          <button
            className="p-2 rounded-full bg-muted hover:bg-muted/70 transition-colors flex items-center"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Masquer la barre latérale" : "Afficher la barre latérale"}
          >
            <Menu className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">{sidebarOpen ? "Masquer" : "Afficher"}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Overlay mobile pour la liste des régions */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-black/40 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {sidebarOpen && (
          <Sidebar
            outageData={outageData}
            selectedRegion={selectedRegion}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            matches={matches}
            showRegions={showRegions}
            onToggleShowRegions={() => setShowRegions((v) => !v)}
            totalOutages={totalOutages}
            pendingKey={pendingKey}
            onSelectRegion={handleMarkerClick}
            onSelectMatch={(match) => handleOutageClick(match.region, match.outage)}
          />
        )}

        {/* Map / List View */}
        <div className="flex-1 flex overflow-hidden relative">
          {viewMode === "map" ? (
            <MapPanel
              outageData={outageData}
              center={center}
              zoom={zoom}
              onBoundsChanged={({ center, zoom }: BoundsChanged) => {
                setCenter(center);
                setZoom(zoom);
              }}
              selectedRegion={selectedRegion}
              showRegions={showRegions}
              onMarkerClick={handleMarkerClick}
              tooltipRegion={tooltipRegion}
              showTooltip={showTooltip}
              detailsOpen={detailsOpen}
              onMarkerHover={handleMarkerHover}
              onMarkerLeave={handleMarkerLeave}
              userLocation={userLocation}
              locationError={locationError}
              locationPrompted={locationPrompted}
              onRequestUserLocation={requestUserLocation}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetView={resetView}
              onCenterOnUser={centerOnUser}
            />
          ) : (
            <ListPanel outageData={outageData} totalOutages={totalOutages} />
          )}

          {viewMode === "map" && detailsOpen && selectedRegion && (
            <DetailsPanel
              selectedRegion={selectedRegion}
              onClose={() => setDetailsOpen(false)}
              onPrevRegion={() => goToRegion(-1)}
              onNextRegion={() => goToRegion(1)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EneoOutageView;
