import React, { useState, useEffect, useCallback } from "react";
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
  Target, // Ajouté pour le bouton de centrage
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

// Coordonnées pour le Cameroun
const CAMEROON_CENTER: [number, number] = [5.5, 12.5];
const INITIAL_ZOOM: number = 6;

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
  const [center, setCenter] = useState<[number, number]>(CAMEROON_CENTER);
  const [zoom, setZoom] = useState<number>(INITIAL_ZOOM);
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
  // Nouveaux états pour la géolocalisation
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPrompted, setLocationPrompted] = useState<boolean>(false);

  // --- Fonctions d'aide ---

  const fetchOutagesByRegion = async (
    regionCode: string
  ): Promise<RegionOutage> => {
    // ... (votre fonction fetchOutagesByRegion reste la même)
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
        outages: { status: 1, data: [] },
        error: "Erreur de connexion",
      };
    }
  };

  const geocodeLocation = useCallback(
    async (
      location: string,
      city: string
    ): Promise<[number, number] | null> => {
      const query = `${location}, ${city}, Cameroun`;
      try {
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: query,
              format: "json",
              limit: 1,
              country: "Cameroon", // Pour affiner la recherche
            },
          }
        );

        if (response.data && response.data.length > 0) {
          const lat = parseFloat(response.data[0].lat);
          const lon = parseFloat(response.data[0].lon);
          return [lat, lon];
        }
        return null;
      } catch (error) {
        console.error(
          `Erreur de géocodage pour ${query}:`,
          error as AxiosError
        );
        return null;
      }
    },
    []
  );

  const requestUserLocation = useCallback((): void => {
    if ("geolocation" in navigator) {
      setLocationPrompted(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
          setCenter([position.coords.latitude, position.coords.longitude]);
          setZoom(12); // Zoom plus près de la position de l'utilisateur
          setLocationError(null);
        },
        (err) => {
          console.error("Erreur de géolocalisation:", err.message);
          let errorMessage = "Accès à la localisation refusé ou impossible.";
          if (err.code === err.PERMISSION_DENIED) {
            errorMessage =
              "Veuillez activer la localisation dans les réglages de votre navigateur.";
          }
          setLocationError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError(
        "La géolocalisation n'est pas supportée par votre navigateur."
      );
    }
  }, []);

  // --- useEffects ---

  useEffect(() => {
    const fetchAllOutages = async (): Promise<void> => {
      setLoading(true);
      try {
        // ... (votre logique de fetchAllOutages reste la même)
        const response = await fetch("/api/outages");
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const rawData = await response.json();

        const transformedData = rawData.map((region: any) => {
          if (
            region.outages &&
            typeof region.outages === "object" &&
            "status" in region.outages &&
            "data" in region.outages
          ) {
            return region;
          }

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
    // Demande de localisation au chargement initial, si ce n'est pas déjà fait
    if (!locationPrompted) {
      requestUserLocation();
    }
  }, [locationPrompted, requestUserLocation]);

  // --- Handlers modifiés ---

  const handleMarkerClick = async (region: RegionOutage): Promise<void> => {
    setSelectedRegion(region);
    setCenter(REGION_COORDINATES[region.regionName]);
    setZoom(8);
    setDetailsOpen(true);

    // *Implémentation de la fonctionalité #2: Diriger la carte vers le quartier*
    if (region.outages.data && region.outages.data.length > 0) {
      // Pour cet exemple, prenons le premier quartier/ville de la région sélectionnée
      const firstOutage = region.outages.data[0];
      const locationToSearch = firstOutage.quartier || firstOutage.ville;
      const city = firstOutage.ville || region.regionName;

      if (locationToSearch) {
        console.log(
          `Recherche de coordonnées pour: ${locationToSearch}, ${city}`
        );
        const coords = await geocodeLocation(locationToSearch, city);

        if (coords) {
          setCenter(coords);
          setZoom(14); // Zoom plus proche pour le niveau quartier
          console.log(`Centré sur le quartier: ${locationToSearch}`, coords);
        } else {
          console.log(
            `Coordonnées non trouvées pour ${locationToSearch}. Centrage sur la région.`
          );
          setCenter(REGION_COORDINATES[region.regionName]);
          setZoom(8);
        }
      }
    }
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
    setCenter(CAMEROON_CENTER);
    setZoom(INITIAL_ZOOM);
    setSelectedRegion(null);
    setDetailsOpen(false);
  };

  const closeDetails = (): void => {
    setDetailsOpen(false);
  };

  // Fonction pour centrer sur l'utilisateur
  const centerOnUser = (): void => {
    if (userLocation) {
      setCenter(userLocation);
      setZoom(12);
      setLocationError(null); // Effacer l'erreur si l'utilisateur recentre
    } else {
      // Si la position n'est pas connue, redemander l'accès
      requestUserLocation();
    }
  };

  // ... (votre logique de filtrage et formatage reste la même)
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

  const totalOutages: number = outageData.reduce(
    (total, region) =>
      total + (region.outages.data ? region.outages.data.length : 0),
    0
  );

  if (loading) {
    // ... (votre chargement reste le même)
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
    // ... (votre gestion des erreurs reste la même)
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
      {/* Header */}
      <div className="bg-white border-gray-200 border-b px-4 py-3 flex justify-between items-center shadow-sm transition-colors duration-300">
        {/* ... (votre header reste le même) ... */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold flex items-center">
            <Zap className="h-6 w-6 mr-2 text-green-600" />
            Coupures de courant ENEO
          </h1>
        </div>
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center ${
              viewMode === "map" ? "text-blue-600" : ""
            }`}
            onClick={() => setViewMode("map")}
            title="Vue Carte"
          >
            <MapIcon className="h-4 w-4 mr-1" />
            Carte
          </button>
          <button
            className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center ${
              viewMode === "list" ? "text-blue-600" : ""
            }`}
            onClick={() => setViewMode("list")}
            title="Vue Liste"
          >
            <List className="h-4 w-4 mr-1" />
            Liste
          </button>
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={
              sidebarOpen
                ? "Masquer la barre latérale"
                : "Afficher la barre latérale"
            }
          >
            <Menu className="h-4 w-4 mr-1" />
            {sidebarOpen ? "Masquer" : "Afficher"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          // ... (votre sidebar reste la même) ...
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

        {/* Map / List View */}
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
                {/* Marqueur de la position de l'utilisateur */}
                {userLocation && (
                  <Marker
                    anchor={userLocation}
                    payload={1}
                    width={50}
                    color="#007bff"
                  />
                )}

                {showRegions &&
                  outageData.map((region) => {
                    const outageCount = region.outages.data
                      ? region.outages.data.length
                      : 0;
                    const isSelected =
                      selectedRegion?.regionCode === region.regionCode;
                    return (
                      <Overlay
                        key={region.regionCode}
                        anchor={REGION_COORDINATES[region.regionName]}
                        offset={[0, 0]}
                      >
                        <div
                          className={`cursor-pointer transition-transform ${
                            isSelected ? "scale-110" : "hover:scale-105"
                          }`}
                          onClick={() => handleMarkerClick(region)}
                          onMouseOver={(e) =>
                            handleMarkerHover(region, [e.clientX, e.clientY])
                          }
                          onMouseOut={handleMarkerLeave}
                        >
                          <div className="relative flex flex-col items-center">
                            {/* Badge avec le nombre de coupures */}
                            {outageCount > 0 && (
                              <div className="absolute -top-2 bg-white text-gray-800 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-gray-800 z-10">
                                {outageCount}
                              </div>
                            )}
                            {/* Icône de foudre */}
                            <div
                              className={`rounded-full p-2 shadow-lg ${
                                isSelected ? "ring-4 ring-blue-500" : ""
                              }`}
                              style={{
                                backgroundColor: getRegionColor(region.outages),
                              }}
                            >
                              <Zap className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                      </Overlay>
                    );
                  })}
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

              {/* Message d'erreur/invitation de localisation */}
              {locationError && !userLocation && (
                <div className="absolute top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md z-20">
                  <p className="font-bold">Localisation requise</p>
                  <p className="text-sm mt-1">{locationError}</p>
                  {locationError.includes("refusé") && (
                    <button
                      onClick={requestUserLocation}
                      className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    >
                      Réactiver la localisation
                    </button>
                  )}
                </div>
              )}
              {/* Message d'invitation par défaut si non demandé/refusé et non localisé */}
              {!locationPrompted && !userLocation && (
                <div className="absolute top-4 left-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-md z-20">
                  <p className="font-bold">Localisez-vous !</p>
                  <p className="text-sm mt-1">
                    Cliquez pour voir les coupures proches de chez vous.
                  </p>
                  <button
                    onClick={requestUserLocation}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <Target className="h-4 w-4 mr-1" /> Activer ma localisation
                  </button>
                </div>
              )}

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
                {/* Nouveau bouton de centrage sur l'utilisateur */}
                <button
                  className={`rounded-full w-10 h-10 shadow-md flex items-center justify-center transition-colors ${
                    userLocation
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={centerOnUser}
                  title={
                    userLocation
                      ? "Centrer sur ma position"
                      : "Activer la géolocalisation"
                  }
                >
                  <Target className="h-5 w-5" />
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
            // ... (votre vue liste reste la même) ...
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
