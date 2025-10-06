import React, { useState, useEffect } from "react";
import { Map, Marker, Overlay, ZoomControl } from "pigeon-maps";
import axios, { AxiosError } from "axios";
import {
  Map as MapIcon,
  Plus,
  Minus,
  Layers,
  Menu,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  Zap,
  Calendar,
  Clock,
  MapPin,
  List,
} from "lucide-react";

interface OutageInfo {
  observations: string;
  prog_date: string;
  prog_heure_debut: string;
  prog_heure_fin: string;
  quartier: string;
  region: string;
  ville: string;
}

// Mise à jour de l'interface pour refléter la structure normalisée
interface OutageResponse {
  status: number;
  data: OutageInfo[];
}

interface RegionOutage {
  regionCode: string;
  regionName: string;
  outages: OutageResponse;
  error?: string;
}

const REGION_COORDINATES: Record<string, [number, number]> = {
  CENTRE: [3.8667, 11.5167],
  LITTORAL: [4.05, 9.7],
  OUEST: [5.4667, 10.4167],
  "SUD-OUEST": [4.1667, 9.2333],
  "NORD-OUEST": [6.0, 10.1667],
  SUD: [2.9333, 11.1333],
  EST: [4.4333, 13.6833],
  ADAMAOUA: [7.3233, 13.5837],
  NORD: [9.3, 13.4],
  "EXTRÊME-NORD": [10.5833, 14.3333],
};

const REGION_MAPPING: Record<string, string> = {
  "X-1": "CENTRE",
  "X-2": "LITTORAL",
  "X-3": "OUEST",
  "X-4": "SUD-OUEST",
  "X-5": "NORD-OUEST",
  "X-6": "SUD",
  "X-7": "EST",
  "X-8": "ADAMAOUA",
  "X-9": "NORD",
  "X-10": "EXTRÊME-NORD",
};

const REGION_CODES: string[] = Object.keys(REGION_MAPPING);

// Mise à jour pour utiliser la nouvelle structure
const getRegionColor = (outages: OutageResponse): string => {
  if (!outages.data || outages.data.length === 0) return "#2ecc71";
  if (outages.data.length < 3) return "#f39c12";
  return "#e74c3c";
};

interface MarkerEvent {
  event: {
    clientX: number;
    clientY: number;
  };
}

interface BoundsChanged {
  center: [number, number];
  zoom: number;
}

const EneoOutageView: React.FC = () => {
  const [outageData, setOutageData] = useState<RegionOutage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([7.3697, 12.3547]); // Centre du Cameroun
  const [zoom, setZoom] = useState<number>(6);
  const [selectedRegion, setSelectedRegion] = useState<RegionOutage | null>(
    null
  );
  const [showRegions, setShowRegions] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [tooltipRegion, setTooltipRegion] = useState<RegionOutage | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<[number, number]>([
    0, 0,
  ]);

  const fetchOutagesByRegion = async (
    regionCode: string
  ): Promise<RegionOutage> => {
    try {
      const response = await axios({
        method: "POST",
        url: "https://alert.eneo.cm/ajaxOutage.php",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Referer: "https://alert.eneo.cm/",
          Origin: "https://alert.eneo.cm",
        },
        data: {
          region: regionCode,
        },
      });

      // Normaliser la structure des données
      let normalizedOutages: OutageResponse;
      if (
        response.data &&
        typeof response.data === "object" &&
        "status" in response.data &&
        "data" in response.data
      ) {
        normalizedOutages = response.data;
      } else {
        normalizedOutages = {
          status: 1,
          data: Array.isArray(response.data) ? response.data : [],
        };
      }

      return {
        regionCode,
        regionName: REGION_MAPPING[regionCode],
        outages: normalizedOutages,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        `Erreur lors de la récupération des coupures pour la région ${regionCode}:`,
        axiosError
      );
      return {
        regionCode,
        regionName: REGION_MAPPING[regionCode],
        outages: { status: 1, data: [] }, // Structure normalisée même en cas d'erreur
        error: "Erreur de connexion",
      };
    }
  };

  useEffect(() => {
    const fetchAllOutages = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await fetch("/api/outages");
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const rawData = await response.json();

        // Uniformiser la structure des données
        const transformedData = rawData.map((region: any) => {
          // Vérifier si outages est déjà au bon format
          if (
            region.outages &&
            typeof region.outages === "object" &&
            "status" in region.outages &&
            "data" in region.outages
          ) {
            return region;
          }

          // Sinon, normaliser la structure
          return {
            regionCode: region.regionCode,
            regionName: region.regionName,
            outages: {
              status: 1,
              data: Array.isArray(region.outages) ? region.outages : [],
            },
            error: region.error,
          };
        });

        // Trouver les régions avec des coupures
        const regionsWithOutages = transformedData.filter(
          (region: RegionOutage) =>
            region.outages.data && region.outages.data.length > 0
        );

        setOutageData(transformedData);

        if (regionsWithOutages.length > 0) {
          setSelectedRegion(regionsWithOutages[0]);
        } else if (transformedData.length > 0) {
          setSelectedRegion(transformedData[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(
          `Erreur lors du chargement des données: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setLoading(false);
      }
    };
    fetchAllOutages();
  }, []);

  const handleMarkerClick = (region: RegionOutage): void => {
    setSelectedRegion(region);
    setCenter(REGION_COORDINATES[region.regionName]);
    setZoom(8);
    setDetailsOpen(true);
  };

  const handleMarkerHover = (
    region: RegionOutage,
    position: [number, number]
  ): void => {
    setTooltipRegion(region);
    setTooltipPosition(position);
    setShowTooltip(true);
  };

  const handleMarkerLeave = (): void => {
    setShowTooltip(false);
  };

  const handleZoomIn = (): void => {
    setZoom(Math.min(zoom + 1, 18));
  };

  const handleZoomOut = (): void => {
    setZoom(Math.max(zoom - 1, 3));
  };

  const resetView = (): void => {
    setCenter([7.3697, 12.3547]);
    setZoom(6);
    setSelectedRegion(null);
    setDetailsOpen(false);
  };

  const closeDetails = (): void => {
    setDetailsOpen(false);
  };

  // Mise à jour pour utiliser la nouvelle structure
  const filteredRegions = outageData.filter(
    (region) =>
      region.regionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (region.outages.data &&
        region.outages.data.some(
          (outage) =>
            outage.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
            outage.quartier.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Mise à jour pour utiliser la nouvelle structure
  const totalOutages: number = outageData.reduce(
    (total, region) =>
      total + (region.outages.data ? region.outages.data.length : 0),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">
            Chargement des données...
          </p>
          <p className="text-gray-500 mt-2">
            Récupération des informations sur les coupures ENEO
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white border-l-4 border-red-500 shadow-lg rounded-lg p-6 max-w-md">
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
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                Erreur de chargement
              </h2>
              <p className="text-gray-600">{error}</p>
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
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800 transition-colors duration-300">
      <div className="bg-white border-gray-200 border-b px-4 py-3 flex justify-between items-center shadow-sm transition-colors duration-300">
        <div className="flex items-center">
          <h1 className="text-xl font-bold flex items-center">
            <Zap className="h-6 w-6 mr-2 text-green-600" />
            Coupures de courant ENEO
          </h1>
        </div>
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center`}
            onClick={() => setViewMode("map")}
          >
            <MapIcon className="h-4 w-4 mr-1" />
            Carte
          </button>
          <button
            className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center`}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4 mr-1" />
            Liste
          </button>
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-4 w-4 mr-1" />
            {sidebarOpen ? "Masquer" : "Afficher"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-white shadow-lg overflow-hidden flex flex-col z-10">
            <div className="bg-gray-50 border-b p-4">
              <h2 className="font-bold text-gray-800 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Régions ({outageData.length})
              </h2>

              <div className="mt-3 relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher une région ou quartier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm ? (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <Search className="absolute right-3 top-2.5 text-gray-400 h-4 w-4" />
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  checked={showRegions}
                  onChange={() => setShowRegions(!showRegions)}
                  id="showRegions"
                  className="mr-2"
                />
                <label
                  htmlFor="showRegions"
                  className="text-sm font-medium text-gray-700"
                >
                  Afficher les marqueurs sur la carte
                </label>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-3">
              {filteredRegions && filteredRegions.length > 0 ? (
                <ul className="space-y-2">
                  {filteredRegions.map((region) => (
                    <li
                      key={region.regionCode}
                      className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border ${
                        selectedRegion?.regionCode === region.regionCode
                          ? "border-blue-500 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                      onClick={() => handleMarkerClick(region)}
                    >
                      <div className="flex items-center p-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white font-bold"
                          style={{
                            backgroundColor: getRegionColor(region.outages),
                          }}
                        >
                          <Zap className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{region.regionName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            {region.outages.data &&
                            region.outages.data.length > 0 ? (
                              <span className="text-red-500 font-medium">
                                {region.outages.data.length} coupure(s)
                              </span>
                            ) : (
                              <span className="text-green-500">
                                Aucune coupure
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    Aucune région trouvée
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Essayez avec un autre terme de recherche
                  </p>
                  {searchTerm && (
                    <button
                      className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm"
                      onClick={() => setSearchTerm("")}
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-3 border-t">
              <div className="text-sm text-gray-500 text-center">
                Total: {totalOutages} coupure(s) programmée(s)
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden relative">
          {viewMode === "map" ? (
            <div
              className={`${
                detailsOpen ? "w-3/5" : "w-full"
              } transition-all duration-300 relative`}
            >
              <Map
                provider={(x, y, z) =>
                  `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
                }
                center={center}
                zoom={zoom}
                onBoundsChanged={({ center, zoom }: BoundsChanged) => {
                  setCenter(center);
                  setZoom(zoom);
                }}
                attribution={false}
                metaWheelZoom={true}
                twoFingerDrag={true}
              >
                {showRegions &&
                  outageData.map((region) => (
                    <Marker
                      key={region.regionCode}
                      width={
                        selectedRegion?.regionCode === region.regionCode
                          ? 50
                          : 40
                      }
                      anchor={REGION_COORDINATES[region.regionName]}
                      onClick={() => handleMarkerClick(region)}
                      onMouseOver={(e: MarkerEvent) =>
                        handleMarkerHover(region, [
                          e.event.clientX,
                          e.event.clientY,
                        ])
                      }
                      onMouseOut={handleMarkerLeave}
                      color={getRegionColor(region.outages)}
                    />
                  ))}

                {showTooltip && tooltipRegion && !detailsOpen && (
                  <Overlay
                    anchor={REGION_COORDINATES[tooltipRegion.regionName]}
                    offset={[0, -20]}
                  >
                    <div className="bg-white px-3 py-1.5 rounded shadow-lg text-sm font-medium border border-gray-200 pointer-events-none">
                      {tooltipRegion.regionName} -{" "}
                      {tooltipRegion.outages.data
                        ? tooltipRegion.outages.data.length
                        : 0}{" "}
                      coupure(s)
                    </div>
                  </Overlay>
                )}

                <ZoomControl />
              </Map>

              {/* Custom map controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <button
                  className="bg-white rounded-full w-10 h-10 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100"
                  onClick={handleZoomIn}
                  title="Zoom avant"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <button
                  className="bg-white rounded-full w-10 h-10 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100"
                  onClick={handleZoomOut}
                  title="Zoom arrière"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <button
                  className="bg-white rounded-full w-10 h-10 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100"
                  onClick={resetView}
                  title="Vue d'ensemble"
                >
                  <Layers className="h-5 w-5" />
                </button>
              </div>

              {/* Legend */}
              <div className="absolute bottom-14 right-4 bg-white p-3 rounded-lg shadow-md border border-gray-200">
                <div className="text-sm font-medium mb-2">Légende</div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-700">
                      Aucune coupure
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-700">1-2 coupures</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-700">3+ coupures</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full p-4 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                Liste des coupures programmées
              </h2>

              {totalOutages === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-green-500 mb-2">
                    <Zap className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-green-800">
                    Aucune coupure programmée
                  </h3>
                  <p className="text-green-600 mt-1">
                    Toutes les régions sont actuellement alimentées
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {outageData
                    .filter(
                      (region) =>
                        region.outages.data && region.outages.data.length > 0
                    )
                    .map((region) => (
                      <div
                        key={region.regionCode}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                      >
                        <div className="bg-blue-700 text-white p-3 flex justify-between items-center">
                          <h3 className="font-bold">{region.regionName}</h3>
                          <span className="bg-white text-blue-700 px-2 py-0.5 rounded-full text-sm font-medium">
                            {region.outages.data.length} coupure(s)
                          </span>
                        </div>
                        <div className="p-4">
                          <div className="divide-y divide-gray-200">
                            {region.outages.data.map((outage, idx) => (
                              <div
                                key={idx}
                                className="py-4 first:pt-0 last:pb-0"
                              >
                                <div className="flex flex-wrap gap-4 mb-2">
                                  <div className="flex items-center text-sm">
                                    <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                                    <span className="font-medium">
                                      {outage.ville}
                                    </span>
                                    <span className="mx-1">-</span>
                                    <span>{outage.quartier}</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                                    <span>{formatDate(outage.prog_date)}</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Clock className="h-4 w-4 text-gray-500 mr-1" />
                                    <span>
                                      {outage.prog_heure_debut} -{" "}
                                      {outage.prog_heure_fin}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm mt-2">
                                  {outage.observations}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Details panel */}
          {viewMode === "map" && detailsOpen && selectedRegion && (
            <div className="w-2/5 bg-white shadow-lg overflow-y-auto transition-all duration-300 border-l border-gray-200">
              <div className="sticky top-0 z-10 bg-white shadow-sm">
                <div className="bg-blue-700 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={closeDetails}
                      className="text-white hover:text-blue-200 transition-colors"
                      title="Fermer"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <h3 className="text-xl font-bold flex-1 text-center">
                      {selectedRegion.regionName}
                    </h3>
                    <div className="w-5"></div> {/* Spacer for alignment */}
                  </div>
                </div>

                {/* Stats bar */}
                <div className="bg-blue-50 p-3 border-b border-gray-200">
                  <div className="flex justify-around text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        {selectedRegion.outages.data
                          ? selectedRegion.outages.data.length
                          : 0}
                      </div>
                      <div className="text-xs text-gray-500">Coupures</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {selectedRegion.outages.data &&
                selectedRegion.outages.data.length > 0 ? (
                  <div className="space-y-4">
                    {selectedRegion.outages.data.map((outage, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                      >
                        <div className="bg-gray-50 p-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-800">
                              {outage.ville} - {outage.quartier}
                            </div>
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              {formatDate(outage.prog_date)}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">
                                Heure de début
                              </span>
                              <span className="font-medium flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-blue-500" />
                                {outage.prog_heure_debut}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">
                                Heure de fin
                              </span>
                              <span className="font-medium flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-blue-500" />
                                {outage.prog_heure_fin}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="text-xs text-gray-500 block mb-1">
                              Raison de la coupure
                            </span>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm">
                              {outage.observations}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="bg-green-100 p-4 rounded-full mb-4">
                      <Zap className="h-12 w-12 text-green-500" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">
                      Aucune coupure programmée
                    </h4>
                    <p className="text-gray-500 text-center max-w-xs">
                      Il n&apos;y a actuellement aucune coupure programmée dans
                      la région {selectedRegion.regionName}.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick navigation between regions */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 flex justify-between">
                <button
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center text-sm transition-colors"
                  onClick={() => {
                    const currentIndex = outageData.findIndex(
                      (r) => r.regionCode === selectedRegion.regionCode
                    );
                    const prevIndex =
                      (currentIndex - 1 + outageData.length) %
                      outageData.length;
                    handleMarkerClick(outageData[prevIndex]);
                  }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Région précédente
                </button>
                <button
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center text-sm transition-colors"
                  onClick={() => {
                    const currentIndex = outageData.findIndex(
                      (r) => r.regionCode === selectedRegion.regionCode
                    );
                    const nextIndex = (currentIndex + 1) % outageData.length;
                    handleMarkerClick(outageData[nextIndex]);
                  }}
                >
                  Région suivante
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EneoOutageView;
