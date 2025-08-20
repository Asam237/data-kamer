import React, { useState, useEffect, useRef } from "react";
import { Map, Marker, Overlay, ZoomControl } from "pigeon-maps";
import {
  Users,
  Home,
  Map as MapIcon,
  Plus,
  Minus,
  Layers,
  Menu,
  Info,
  ChevronDown,
  Building2,
  Briefcase,
  UtensilsCrossed,
  Landmark,
  Music,
  Search,
  X,
  ChevronRight,
  Camera,
  Compass,
  Mountain,
  PalmtreeIcon,
  Globe,
  Sun,
  Heart,
  Share2,
  Star,
  MapPin,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
} from "lucide-react";

interface Department {
  id: number;
  name: string;
  capital: string;
  population: number;
  area: number;
  departments: string[];
  majorCompanies?: { name: string; sector: string }[];
  jobDemand?: string[];
  specialties?: {
    gastronomy: string;
    professions: string;
    entertainment: string;
  };
  touristSites?: TouristSite[];
  mainImage?: string;
}

interface Overview {
  totalPopulation: number;
  totalArea: number;
  totalRegions: number;
  totalDepartments: number;
  capital: string;
  officialLanguages: string[];
  currency: string;
}

interface CameroonData {
  regions: Department[];
  overview: Overview;
}

interface TouristSite {
  name: string;
  description: string;
  location?: string;
  image?: string;
  type?: string;
  rating?: number;
  coordinates?: [number, number];
}

const REGION_COORDINATES: Record<string, [number, number]> = {
  Adamaoua: [7.3233, 13.5837],
  Centre: [3.8667, 11.5167],
  Est: [4.4333, 13.6833],
  "Extrême-Nord": [10.5833, 14.3333],
  Littoral: [4.05, 9.7],
  Nord: [9.3, 13.4],
  "Nord-Ouest": [6.0, 10.1667],
  Ouest: [5.4667, 10.4167],
  Sud: [2.9333, 11.1333],
  "Sud-Ouest": [4.1667, 9.2333],
};

const getRegionColor = (id: number): string => {
  const colors = [
    "#3498db",
    "#2ecc71",
    "#e74c3c",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
    "#d35400",
    "#34495e",
    "#16a085",
    "#c0392b",
  ];
  return colors[(id - 1) % colors.length];
};

const getTouristSiteIcon = (type: string) => {
  switch (type) {
    case "nature":
      return <PalmtreeIcon className="h-5 w-5 text-green-600" />;
    case "culture":
      return <Landmark className="h-5 w-5 text-purple-600" />;
    case "montagne":
      return <Mountain className="h-5 w-5 text-gray-700" />;
    case "plage":
      return <Sun className="h-5 w-5 text-yellow-500" />;
    case "historique":
      return <Globe className="h-5 w-5 text-blue-600" />;
    case "urbain":
      return <Building2 className="h-5 w-5 text-gray-600" />;
    default:
      return <Compass className="h-5 w-5 text-blue-500" />;
  }
};

const getTouristSiteColor = (type: string): string => {
  switch (type) {
    case "nature":
      return "#10b981";
    case "culture":
      return "#8b5cf6";
    case "montagne":
      return "#6b7280";
    case "plage":
      return "#f59e0b";
    case "historique":
      return "#3b82f6";
    case "urbain":
      return "#64748b";
    default:
      return "#3b82f6";
  }
};

const MapView: React.FC = () => {
  const [cameroonData, setCameroonData] = useState<CameroonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([7.3697, 12.3547]);
  const [zoom, setZoom] = useState(6);
  const [selectedRegion, setSelectedRegion] = useState<Department | null>(null);
  const [showRegions, setShowRegions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "info" | "companies" | "jobs" | "specialties" | "tourism"
  >("info");
  const [mapStyle, setMapStyle] = useState<"default" | "satellite">("default");
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipRegion, setTooltipRegion] = useState<Department | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<[number, number]>([
    0, 0,
  ]);
  const [darkMode, setDarkMode] = useState(false);
  const [showTouristSites, setShowTouristSites] = useState(false);
  const [selectedTouristSite, setSelectedTouristSite] =
    useState<TouristSite | null>(null);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showPopulation, setShowPopulation] = useState(true);
  const [showArea, setShowArea] = useState(true);
  const [showDepartments, setShowDepartments] = useState(true);
  const [showCompanies, setShowCompanies] = useState(true);

  const mapRef = useRef<HTMLDivElement>(null);
  const touristSiteRef = useRef<HTMLDivElement>(null);

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/cameroon.json");
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();

        const filteredData = {
          regions: data.regions,
          overview: {
            ...data.overview,
            totalUniversities: undefined,
          },
        };

        setCameroonData(filteredData);
        setLoading(false);
      } catch (err) {
        setError(
          `Erreur lors du chargement des données: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTouristSite && touristSiteRef.current) {
      touristSiteRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTouristSite]);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const handleMarkerClick = (region: Department) => {
    setIsAnimating(true);
    setSelectedRegion(region);
    setCenter(REGION_COORDINATES[region.name]);
    setZoom(8);
    setDetailsOpen(true);
    setActiveTab("info");
    setSelectedTouristSite(null);
  };

  const handleTouristSiteClick = (site: TouristSite, regionName: string) => {
    setSelectedTouristSite(site);
    if (site.coordinates) {
      setCenter(site.coordinates);
      setZoom(10);
    } else {
      setCenter(REGION_COORDINATES[regionName]);
      setZoom(8);
    }
  };

  const handleMarkerHover = (
    region: Department,
    position: [number, number]
  ) => {
    setTooltipRegion(region);
    setTooltipPosition(position);
    setShowTooltip(true);
  };

  const handleMarkerLeave = () => {
    setShowTooltip(false);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 1, 18));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 1, 3));
  };

  const resetView = () => {
    setCenter([7.3697, 12.3547]);
    setZoom(6);
    setSelectedRegion(null);
    setDetailsOpen(false);
    setSelectedTouristSite(null);
    setImmersiveMode(false);
  };

  const toggleMapStyle = () => {
    setMapStyle(mapStyle === "default" ? "satellite" : "default");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleImmersiveMode = () => {
    setImmersiveMode(!immersiveMode);
    if (!immersiveMode) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  };

  const toggleFavorite = (siteName: string) => {
    if (favorites.includes(siteName)) {
      setFavorites(favorites.filter((name) => name !== siteName));
    } else {
      setFavorites([...favorites, siteName]);
    }
  };

  const filteredRegions = cameroonData?.regions.filter(
    (region) =>
      region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.capital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      region.departments.some((dept) =>
        dept.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedTouristSite(null);
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const mapTiler = (x: number, y: number, z: number, dpr?: number) => {
    return mapStyle === "default"
      ? `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
      : `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
  };

  const getRegionPosition = (regionName: string): string => {
    switch (regionName) {
      case "Adamaoua":
        return "centre";
      case "Centre":
        return "centre";
      case "Est":
        return "est";
      case "Extrême-Nord":
        return "nord";
      case "Littoral":
        return "sud-ouest";
      case "Nord":
        return "nord";
      case "Nord-Ouest":
        return "nord-ouest";
      case "Ouest":
        return "ouest";
      case "Sud":
        return "sud";
      case "Sud-Ouest":
        return "sud-ouest";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div
            className={`animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 ${
              darkMode ? "border-green-400" : "border-green-600"
            } mx-auto mb-6`}
          ></div>
          <p
            className={`text-xl font-semibold ${
              darkMode ? "text-gray-100" : "text-gray-700"
            }`}
          >
            Chargement des données...
          </p>
          <p className={`${darkMode ? "text-gray-300" : "text-gray-500"} mt-2`}>
            Préparation de la carte interactive du Cameroun
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div
          className={`${
            darkMode ? "bg-gray-800 border-red-400" : "bg-white border-red-500"
          } border-l-4 shadow-lg rounded-lg p-6 max-w-md`}
        >
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
              <h2
                className={`text-lg font-bold ${
                  darkMode ? "text-gray-100" : "text-gray-800"
                } mb-1`}
              >
                Erreur de chargement
              </h2>
              <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {error}
              </p>
              <p
                className={`mt-4 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Assurez-vous que le fichier JSON est correctement placé dans le
                dossier{" "}
                <code
                  className={`${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  } px-2 py-1 rounded text-sm`}
                >
                  public/data/cameroon.json
                </code>
              </p>
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

  if (!cameroonData) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <p
            className={`text-xl font-semibold ${
              darkMode ? "text-gray-100" : "text-gray-700"
            }`}
          >
            Aucune donnée disponible
          </p>
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"
      } transition-colors duration-300`}
    >
      <div
        className={`${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } border-b px-4 py-3 flex justify-between items-center shadow-sm transition-colors duration-300`}
      >
        <div className="flex items-center">
          <button
            className={`mr-3 p-2 rounded-full ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            } transition-colors`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold flex items-center">
            <Globe
              className={`h-6 w-6 mr-2 ${
                darkMode ? "text-green-400" : "text-green-600"
              }`}
            />
            Carte Interactive du Cameroun
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className={`p-2 rounded-full ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
            } transition-colors`}
            onClick={() => setShowTouristSites(!showTouristSites)}
            title={
              showTouristSites
                ? "Masquer les sites touristiques"
                : "Afficher les sites touristiques"
            }
          >
            {showTouristSites ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
          <button
            className={`p-2 rounded-full ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
            } transition-colors`}
            onClick={toggleMapStyle}
            title={mapStyle === "default" ? "Vue satellite" : "Vue carte"}
          >
            <Layers className="h-5 w-5" />
          </button>
          <button
            className={`p-2 rounded-full ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
            } transition-colors`}
            onClick={toggleImmersiveMode}
            title={immersiveMode ? "Mode normal" : "Mode immersif"}
          >
            {immersiveMode ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </button>
          <button
            className={`p-2 rounded-full ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
            } transition-colors`}
            onClick={toggleDarkMode}
            title={darkMode ? "Mode clair" : "Mode sombre"}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && !immersiveMode && (
          <div
            className={`w-80 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border-r shadow-lg overflow-hidden flex flex-col z-10 transition-all duration-300`}
          >
            <div
              className={`${
                darkMode ? "bg-gray-700" : "bg-gray-50"
              } border-b p-4`}
            >
              <h2
                className={`font-bold ${
                  darkMode ? "text-gray-100" : "text-gray-800"
                } flex items-center`}
              >
                <MapIcon
                  className={`h-5 w-5 mr-2 ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                />
                Régions du Cameroun ({cameroonData.regions.length})
              </h2>

              <div className="mt-3 relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher une région..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                    }`}
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
                  className={`text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Afficher les marqueurs sur la carte
                </label>
              </div>

              {showTouristSites && (
                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    checked={showTouristSites}
                    onChange={() => setShowTouristSites(!showTouristSites)}
                    id="showTouristSites"
                    className="mr-2"
                  />
                  <label
                    htmlFor="showTouristSites"
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Afficher les sites touristiques
                  </label>
                </div>
              )}
            </div>

            <div className="overflow-y-auto flex-1 p-3">
              {filteredRegions && filteredRegions.length > 0 ? (
                <ul className="space-y-2">
                  {filteredRegions.map((region) => (
                    <li
                      key={region.id}
                      className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                        darkMode
                          ? `border ${
                              selectedRegion?.id === region.id
                                ? "border-green-500 bg-gray-700"
                                : "border-gray-700 hover:border-gray-600 bg-gray-800 hover:bg-gray-700"
                            }`
                          : `border ${
                              selectedRegion?.id === region.id
                                ? "border-green-500 shadow-md"
                                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                            }`
                      }`}
                      onClick={() => handleMarkerClick(region)}
                    >
                      <div className="flex items-center p-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white font-bold"
                          style={{
                            backgroundColor: getRegionColor(region.id),
                          }}
                        >
                          {region.id}
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-medium ${
                              darkMode ? "text-gray-100" : "text-gray-800"
                            }`}
                          >
                            {region.name}
                          </div>
                          <div
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            } flex items-center`}
                          >
                            <Home className="h-3 w-3 mr-1" />
                            {region.capital}
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 ${
                            darkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <div
                    className={`${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    } mb-2`}
                  >
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <p
                    className={`${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    } font-medium`}
                  >
                    Aucune région trouvée
                  </p>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    } text-sm mt-1`}
                  >
                    Essayez avec un autre terme de recherche
                  </p>
                  {searchTerm && (
                    <button
                      className={`mt-4 px-4 py-2 ${
                        darkMode
                          ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      } rounded transition-colors text-sm`}
                      onClick={() => setSearchTerm("")}
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              )}
            </div>

            <div
              className={`${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-gray-50 border-gray-200"
              } border-t p-4`}
            >
              <h3
                className={`text-sm font-semibold ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                } mb-2`}
              >
                Aperçu du Cameroun
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } p-2 rounded border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } hover:shadow-md transition-shadow duration-200`}
                >
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Population
                  </div>
                  <div
                    className={`font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {formatNumber(cameroonData.overview.totalPopulation)}
                  </div>
                </div>
                <div
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } p-2 rounded border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } hover:shadow-md transition-shadow duration-200`}
                >
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Superficie
                  </div>
                  <div
                    className={`font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {formatNumber(cameroonData.overview.totalArea)} km²
                  </div>
                </div>
                <div
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } p-2 rounded border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } hover:shadow-md transition-shadow duration-200`}
                >
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Capitale
                  </div>
                  <div
                    className={`font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {cameroonData.overview.capital}
                  </div>
                </div>
                <div
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } p-2 rounded border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } hover:shadow-md transition-shadow duration-200`}
                >
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Monnaie
                  </div>
                  <div
                    className={`font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {cameroonData.overview.currency}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden relative">
          <div
            className={`${
              detailsOpen && !immersiveMode ? "w-3/5" : "w-full"
            } transition-all duration-300 relative`}
            ref={mapRef}
          >
            <Map
              provider={mapTiler}
              center={center}
              zoom={zoom}
              onBoundsChanged={({ center, zoom }) => {
                setCenter(center);
                setZoom(zoom);
              }}
              attribution={false}
              metaWheelZoom={true}
              twoFingerDrag={true}
            >
              {showRegions &&
                cameroonData.regions.map((region) => (
                  <Marker
                    key={region.id}
                    width={selectedRegion?.id === region.id ? 50 : 40}
                    anchor={REGION_COORDINATES[region.name]}
                    onClick={() => handleMarkerClick(region)}
                    onMouseOver={(e) =>
                      handleMarkerHover(region, [
                        e.event.clientX,
                        e.event.clientY,
                      ])
                    }
                    onMouseOut={handleMarkerLeave}
                    color={
                      selectedRegion?.id === region.id
                        ? "#ff0000"
                        : getRegionColor(region.id)
                    }
                  />
                ))}

              {showTouristSites &&
                selectedRegion &&
                selectedRegion.touristSites &&
                selectedRegion.touristSites.map(
                  (site, index) =>
                    site.coordinates && (
                      <Marker
                        key={`tourist-site-${index}`}
                        width={30}
                        anchor={site.coordinates}
                        onClick={() =>
                          handleTouristSiteClick(site, selectedRegion.name)
                        }
                        color={getTouristSiteColor(site.type || "default")}
                      />
                    )
                )}

              {showTooltip && tooltipRegion && !detailsOpen && (
                <Overlay
                  anchor={REGION_COORDINATES[tooltipRegion.name]}
                  offset={[0, -20]}
                >
                  <div
                    className={`px-3 py-1.5 rounded shadow-lg text-sm font-medium border pointer-events-none ${
                      darkMode
                        ? "bg-gray-800 text-gray-100 border-gray-700"
                        : "bg-white text-gray-800 border-gray-200"
                    }`}
                  >
                    {tooltipRegion.name} - {tooltipRegion.capital}
                  </div>
                </Overlay>
              )}

              {showTouristSites &&
                selectedTouristSite &&
                selectedTouristSite.coordinates && (
                  <Overlay
                    anchor={selectedTouristSite.coordinates}
                    offset={[0, -20]}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg shadow-lg text-sm font-medium border ${
                        darkMode
                          ? "bg-gray-800 text-gray-100 border-gray-700"
                          : "bg-white text-gray-800 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center">
                        {getTouristSiteIcon(
                          selectedTouristSite.type || "default"
                        )}
                        <span className="ml-1">{selectedTouristSite.name}</span>
                      </div>
                    </div>
                  </Overlay>
                )}

              <ZoomControl />
            </Map>

            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <button
                className={`rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-opacity-90 transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-gray-200"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                onClick={handleZoomIn}
                title="Zoom avant"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                className={`rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-opacity-90 transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-gray-200"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                onClick={handleZoomOut}
                title="Zoom arrière"
              >
                <Minus className="h-5 w-5" />
              </button>
              <button
                className={`rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-opacity-90 transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-gray-200"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                onClick={resetView}
                title="Vue d'ensemble"
              >
                <Layers className="h-5 w-5" />
              </button>
              <button
                className={`rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-opacity-90 transition-colors ${
                  darkMode
                    ? "bg-gray-800 text-gray-200"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                onClick={toggleMapStyle}
                title={mapStyle === "default" ? "Vue satellite" : "Vue carte"}
              >
                <Globe className="h-5 w-5" />
              </button>
            </div>

            <div
              className={`absolute bottom-14 right-4 p-3 rounded-lg shadow-md border ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-gray-200"
                  : "bg-white border-gray-200 text-gray-800"
              }`}
            >
              <div className="text-sm font-medium mb-2">Légende</div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                  <span
                    className={`text-xs ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Régions
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span
                    className={`text-xs ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Région sélectionnée
                  </span>
                </div>
                {showTouristSites && (
                  <>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span
                        className={`text-xs ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Sites naturels
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>
                      <span
                        className={`text-xs ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Sites culturels
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {detailsOpen && selectedRegion && !immersiveMode && (
            <div
              className={`w-2/5 overflow-y-auto transition-all duration-300 border-l ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } shadow-lg`}
            >
              <div className="sticky top-0 z-10">
                <div
                  className={`p-4 text-white ${
                    darkMode ? "bg-blue-800" : "bg-blue-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={closeDetails}
                      className="text-white hover:text-green-200 transition-colors"
                      title="Fermer"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <h3 className="text-xl font-bold flex-1 text-center">
                      {selectedRegion.name}
                    </h3>
                    <div className="w-5"></div>
                  </div>
                  <div className="mt-2 text-center text-green-100">
                    Capitale: {selectedRegion.capital}
                  </div>
                </div>

                <div
                  className={`p-3 border-b ${
                    darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-green-50 border-gray-200"
                  }`}
                >
                  <div className="flex justify-around text-center">
                    <div>
                      <div
                        className={`text-lg font-bold ${
                          darkMode ? "text-gray-100" : "text-gray-800"
                        }`}
                      >
                        {formatNumber(selectedRegion.population)}
                      </div>
                      <div
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Habitants
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-lg font-bold ${
                          darkMode ? "text-gray-100" : "text-gray-800"
                        }`}
                      >
                        {formatNumber(selectedRegion.area)}
                      </div>
                      <div
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        km²
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-lg font-bold ${
                          darkMode ? "text-gray-100" : "text-gray-800"
                        }`}
                      >
                        {Math.round(
                          selectedRegion.population / selectedRegion.area
                        )}
                      </div>
                      <div
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        hab/km²
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-lg font-bold ${
                          darkMode ? "text-gray-100" : "text-gray-800"
                        }`}
                      >
                        {selectedRegion.departments.length}
                      </div>
                      <div
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Départements
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`flex border-b z-50 ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <button
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === "info"
                        ? darkMode
                          ? "border-b-2 border-green-400 text-green-400"
                          : "border-b-2 border-green-600 text-green-600"
                        : darkMode
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("info")}
                  >
                    <div className="flex items-center justify-center">
                      <Info className="h-4 w-4 mr-1" />
                      Infos
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === "companies"
                        ? darkMode
                          ? "border-b-2 border-green-400 text-green-400"
                          : "border-b-2 border-green-600 text-green-600"
                        : darkMode
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("companies")}
                  >
                    <div className="flex items-center justify-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      Entreprises
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === "jobs"
                        ? darkMode
                          ? "border-b-2 border-green-400 text-green-400"
                          : "border-b-2 border-green-600 text-green-600"
                        : darkMode
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("jobs")}
                  >
                    <div className="flex items-center justify-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      Emplois
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === "specialties"
                        ? darkMode
                          ? "border-b-2 border-green-400 text-green-400"
                          : "border-b-2 border-green-600 text-green-600"
                        : darkMode
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("specialties")}
                  >
                    <div className="flex items-center justify-center">
                      <UtensilsCrossed className="h-4 w-4 mr-1" />
                      Spécialités
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === "tourism"
                        ? darkMode
                          ? "border-b-2 border-green-400 text-green-400"
                          : "border-b-2 border-green-600 text-green-600"
                        : darkMode
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("tourism")}
                  >
                    <div className="flex items-center justify-center">
                      <Camera className="h-4 w-4 mr-1" />
                      Tourisme
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-4">
                {activeTab === "info" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div
                      className={`p-4 rounded-lg ${
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <h4
                        className={`text-sm font-semibold mb-2 ${
                          darkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Position géographique
                      </h4>
                      <p
                        className={`${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        La région de {selectedRegion.name} est située au{" "}
                        {getRegionPosition(selectedRegion.name)} du Cameroun. Sa
                        capitale est {selectedRegion.capital}.
                      </p>
                    </div>

                    <div>
                      <h4
                        className={`text-sm font-semibold mb-2 ${
                          darkMode ? "text-gray-200" : "text-gray-700"
                        }`}
                      >
                        Départements ({selectedRegion.departments.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedRegion.departments.map((dept, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded ${
                              darkMode
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-50 text-gray-700"
                            } flex items-center`}
                          >
                            <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="text-sm">{dept}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <h4
                        className={`text-sm font-semibold mb-2 ${
                          darkMode ? "text-gray-200" : "text-gray-700"
                        } flex items-center`}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Démographie
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Population:
                          </span>
                          <span
                            className={`font-medium ${
                              darkMode ? "text-gray-200" : "text-gray-800"
                            }`}
                          >
                            {formatNumber(selectedRegion.population)} habitants
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Superficie:
                          </span>
                          <span
                            className={`font-medium ${
                              darkMode ? "text-gray-200" : "text-gray-800"
                            }`}
                          >
                            {formatNumber(selectedRegion.area)} km²
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Densité:
                          </span>
                          <span
                            className={`font-medium ${
                              darkMode ? "text-gray-200" : "text-gray-800"
                            }`}
                          >
                            {Math.round(
                              selectedRegion.population / selectedRegion.area
                            )}{" "}
                            hab/km²
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Nombre de départements:
                          </span>
                          <span
                            className={`font-medium ${
                              darkMode ? "text-gray-200" : "text-gray-800"
                            }`}
                          >
                            {selectedRegion.departments.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "companies" && selectedRegion.majorCompanies && (
                  <div className="space-y-4 animate-fadeIn">
                    <h4
                      className={`text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Principales entreprises (
                      {selectedRegion.majorCompanies.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedRegion.majorCompanies.map((company, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 hover:bg-gray-650"
                              : "bg-white border-gray-200 hover:shadow-md"
                          } transition-all`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white`}
                                style={{
                                  backgroundColor: [
                                    "#3498db",
                                    "#2ecc71",
                                    "#e74c3c",
                                    "#f39c12",
                                    "#9b59b6",
                                    "#1abc9c",
                                    "#d35400",
                                    "#34495e",
                                  ][index % 8],
                                }}
                              >
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div>
                                <div
                                  className={`font-medium ${
                                    darkMode ? "text-gray-200" : "text-gray-800"
                                  }`}
                                >
                                  {company.name}
                                </div>
                                <div
                                  className={`text-sm ${
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  }`}
                                >
                                  {company.sector}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "jobs" && selectedRegion.jobDemand && (
                  <div className="space-y-4 animate-fadeIn">
                    <h4
                      className={`text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Secteurs d&apos;emploi en demande
                    </h4>
                    <div className="space-y-2">
                      {selectedRegion.jobDemand.map((job, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            darkMode
                              ? "bg-gray-700 border-gray-600"
                              : "bg-white border-gray-200"
                          } flex items-center`}
                        >
                          <div
                            className="w-2 h-10 rounded-full mr-3"
                            style={{
                              backgroundColor: [
                                "#0088FE",
                                "#00C49F",
                                "#FFBB28",
                                "#FF8042",
                                "#8884d8",
                                "#82ca9d",
                                "#ffc658",
                                "#8dd1e1",
                              ][index % 8],
                            }}
                          ></div>
                          <div className="flex-1">
                            <div
                              className={`font-medium ${
                                darkMode ? "text-gray-200" : "text-gray-800"
                              }`}
                            >
                              {job}
                            </div>
                          </div>
                          <div
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {Math.floor(Math.random() * 30) + 10}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "specialties" && selectedRegion.specialties && (
                  <div className="space-y-4 animate-fadeIn">
                    <div
                      className={`p-4 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <h4
                        className={`text-sm font-semibold mb-3 ${
                          darkMode ? "text-gray-200" : "text-gray-700"
                        } flex items-center`}
                      >
                        <UtensilsCrossed className="h-4 w-4 mr-1" />
                        Gastronomie
                      </h4>
                      <p
                        className={`${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {selectedRegion.specialties.gastronomy}
                      </p>
                    </div>

                    <div
                      className={`p-4 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <h4
                        className={`text-sm font-semibold mb-3 ${
                          darkMode ? "text-gray-200" : "text-gray-700"
                        } flex items-center`}
                      >
                        <Briefcase className="h-4 w-4 mr-1" />
                        Professions traditionnelles
                      </h4>
                      <p
                        className={`${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {selectedRegion.specialties.professions}
                      </p>
                    </div>

                    <div
                      className={`p-4 rounded-lg border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <h4
                        className={`text-sm font-semibold mb-3 ${
                          darkMode ? "text-gray-200" : "text-gray-700"
                        } flex items-center`}
                      >
                        <Music className="h-4 w-4 mr-1" />
                        Divertissement et culture
                      </h4>
                      <p
                        className={`${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {selectedRegion.specialties.entertainment}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "tourism" && selectedRegion.touristSites && (
                  <div className="space-y-4 animate-fadeIn">
                    <h4
                      className={`text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Sites touristiques ({selectedRegion.touristSites.length})
                    </h4>

                    {selectedRegion.touristSites.map((site, index) => (
                      <div
                        key={index}
                        ref={
                          selectedTouristSite?.name === site.name
                            ? touristSiteRef
                            : null
                        }
                        className={`rounded-lg border overflow-hidden transition-all duration-300 ${
                          darkMode
                            ? "bg-gray-700 border-gray-600"
                            : "bg-white border-gray-200"
                        } ${
                          selectedTouristSite?.name === site.name
                            ? darkMode
                              ? "ring-2 ring-green-400"
                              : "ring-2 ring-green-500"
                            : ""
                        }`}
                      >
                        <div
                          className={`p-3 flex justify-between items-center cursor-pointer ${
                            darkMode ? "hover:bg-gray-650" : "hover:bg-gray-50"
                          }`}
                          onClick={() =>
                            handleTouristSiteClick(site, selectedRegion.name)
                          }
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white`}
                            >
                              {getTouristSiteIcon(site.type || "default")}
                            </div>
                            <div>
                              <div
                                className={`font-medium ${
                                  darkMode ? "text-gray-200" : "text-gray-800"
                                }`}
                              >
                                {site.name}
                              </div>
                              {site.location && (
                                <div
                                  className={`text-sm ${
                                    darkMode ? "text-gray-400" : "text-gray-500"
                                  } flex items-center`}
                                >
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {site.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <ChevronDown
                              className={`h-5 w-5 ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              } transition-transform ${
                                selectedTouristSite?.name === site.name
                                  ? "transform rotate-180"
                                  : ""
                              }`}
                            />
                          </div>
                        </div>

                        {selectedTouristSite?.name === site.name && (
                          <div
                            className={`p-4 border-t ${
                              darkMode
                                ? "border-gray-600 bg-gray-750"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            {site.image && (
                              <div className="mb-4 rounded-lg overflow-hidden">
                                <div
                                  className="h-48 bg-cover bg-center rounded-lg"
                                  style={{
                                    backgroundImage: `url(${site.image})`,
                                  }}
                                ></div>
                              </div>
                            )}
                            <div
                              className={`${
                                darkMode ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {site.description}
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                              {site.rating && (
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, index) => (
                                    <Star
                                      key={index}
                                      className={`h-4 w-4 ${
                                        index < Math.floor(site.rating || 0)
                                          ? "text-yellow-400 fill-yellow-400"
                                          : darkMode
                                          ? "text-gray-600"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                  <span
                                    className={`ml-1 text-sm ${
                                      darkMode
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {site.rating}/5
                                  </span>
                                </div>
                              )}
                              <button
                                className={`px-3 py-1 rounded text-sm ${
                                  darkMode
                                    ? "bg-gray-600 hover:bg-gray-500 text-gray-200"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                } transition-colors`}
                                onClick={() => {
                                  // Ouvrir dans Google Maps
                                  window.open(
                                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                      site.name +
                                        " " +
                                        selectedRegion.name +
                                        " Cameroun"
                                    )}`,
                                    "_blank"
                                  );
                                }}
                              >
                                Voir sur Google Maps
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .dark-map {
          filter: brightness(0.8) contrast(1.2);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MapView;
