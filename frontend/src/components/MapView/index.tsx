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
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Thermometer,
  Wind,
  Droplets,
  RefreshCw,
} from "lucide-react";

interface Department {
  id: number;
  name: string;
  capital: string;
  population: number;
  area: number;
  departments: string[];
  majorCompanies?: { name: string; sector: string }[];
  touristSites?: any;
  jobDemand?: string[];
  specialties?: {
    gastronomy: string;
    professions: string;
    entertainment: string;
  };
  mainImage?: string;
  departmentCoordinates?: Record<string, [number, number]>;
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

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  coordinates: [number, number];
  forecast?: {
    day: string;
    condition: string;
    maxTemp: number;
    minTemp: number;
    icon: string;
  }[];
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

const DEPARTMENT_COORDINATES: Record<
  string,
  Record<string, [number, number]>
> = {
  Adamaoua: {
    Vina: [7.3385, 13.5898],
    Mbéré: [6.53, 14.37],
    Djerem: [6.465, 12.6284],
    "Mayo-Banyo": [6.7497, 11.8037],
    "Faro-et-Déo": [7.3722, 12.6536],
  },
  Centre: {
    Mfoundi: [3.867, 11.517],
    Lekié: [4.267, 11.2],
    "Nyong-et-Kellé": [3.65, 10.7667],
    "Nyong-et-Mfoumou": [3.767, 12.25],
    "Nyong-et-So'o": [3.517, 11.5],
    "Haute-Sanaga": [4.6708, 12.3731],
    "Mbam-et-Inoubou": [4.75, 11.2167],
    "Mbam-et-Kim": [4.45, 11.6333],
    "Méfou-et-Afamba": [3.96, 11.93],
    "Méfou-et-Akono": [3.5939, 11.3062],
  },
  Est: {
    "Lom-et-Djérem": [4.5833, 13.6833],
    Kadey: [4.4333, 14.3667],
    "Boumba-et-Ngoko": [3.5167, 15.05],
    "Haut-Nyong": [3.9833, 13.1833],
  },
  "Extrême-Nord": {
    Diamaré: [10.5956, 14.3247],
    "Mayo-Danay": [10.34, 15.23],
    "Mayo-Kani": [10.1096, 14.45],
    "Mayo-Sava": [11.0464, 14.1403],
    "Mayo-Tsanaga": [10.7403, 13.8027],
    "Logone-et-Chari": [12.0769, 15.0306],
  },
  Littoral: {
    Wouri: [4.0511, 9.7679],
    Nkam: [4.4569, 9.9735],
    "Sanaga-Maritime": [3.8, 10.1333],
    Moungo: [4.9547, 9.9404],
  },
  Nord: {
    Bénoué: [9.3, 13.4],
    "Mayo-Louti": [9.9312, 13.9476],
    "Mayo-Rey": [8.4037, 14.1666],
    Faro: [8.4833, 13.25],
  },
  "Nord-Ouest": {
    Mezam: [5.9631, 10.1591],
    Boyo: [6.25, 10.2667],
    Bui: [6.2, 10.6667],
    "Donga-Mantung": [6.4667, 10.6333],
    Menchum: [6.3833, 10.0667],
    Momo: [5.853, 10.0],
    "Ngo-Ketunjia": [5.9667, 10.3667],
  },
  Ouest: {
    Mifi: [5.4667, 10.4167],
    Bamboutos: [5.6253, 10.254],
    "Haut-Nkam": [5.157, 10.1788],
    "Hauts-Plateaux": [5.4303, 10.3773],
    "Koung-Khi": [5.3576, 10.4178],
    Menoua: [5.45, 10.0667],
    Ndé: [5.1408, 10.5186],
    Noun: [5.729, 10.9016],
  },
  Sud: {
    "Dja-et-Lobo": [2.9333, 11.9833],
    Mvila: [2.9167, 11.15],
    Océan: [2.95, 9.9167],
    "Vallée-du-Ntem": [2.3833, 11.2833],
  },
  "Sud-Ouest": {
    Fako: [4.0174, 9.2145],
    "Koupé-Manengouba": [4.8448, 9.9321],
    Lebialem: [5.5983, 9.8681],
    Manyu: [5.75, 9.2833],
    Meme: [4.6363, 9.4469],
    Ndian: [4.9578, 8.8712],
  },
};

const fetchWeatherData = async (
  location: string,
  coordinates: [number, number]
): Promise<WeatherData> => {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 300));
  const conditions = [
    "Ensoleillé",
    "Partiellement nuageux",
    "Nuageux",
    "Pluvieux",
    "Orageux",
  ];
  const icons = ["sun", "cloud-sun", "cloud", "cloud-rain", "cloud-lightning"];
  const randomConditionIndex = Math.floor(Math.random() * conditions.length);

  let baseTemp = 25;
  if (coordinates[0] > 8) baseTemp += 5;
  if (coordinates[0] < 5) baseTemp -= 2;

  const temperature = baseTemp + Math.floor(Math.random() * 10) - 5;

  const forecast = [];
  const days = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];
  const today = new Date().getDay();

  for (let i = 0; i <= 2; i++) {
    const dayIndex = (today + i) % 7;
    const condIndex = Math.floor(Math.random() * conditions.length);
    forecast.push({
      day: days[dayIndex],
      condition: conditions[condIndex],
      maxTemp: temperature + Math.floor(Math.random() * 5),
      minTemp: temperature - Math.floor(Math.random() * 5),
      icon: icons[condIndex],
    });
  }

  return {
    location,
    temperature,
    condition: conditions[randomConditionIndex],
    icon: icons[randomConditionIndex],
    humidity: 50 + Math.floor(Math.random() * 40),
    windSpeed: 5 + Math.floor(Math.random() * 20),
    precipitation: Math.floor(Math.random() * 100),
    coordinates,
    forecast,
  };
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

const getWeatherIcon = (condition: string) => {
  switch (condition) {
    case "Ensoleillé":
      return <Sun className="h-6 w-6 text-orange-500" />;
    case "Partiellement nuageux":
      return (
        <div className="relative">
          <Cloud className="h-6 w-6 text-blue-500" />
          <Sun className="h-4 w-4 text-orange-500 absolute -top-1 -right-1" />
        </div>
      );
    case "Nuageux":
      return <Cloud className="h-6 w-6 text-blue-500" />;
    case "Pluvieux":
      return <CloudRain className="h-6 w-6 text-blue-500" />;
    case "Orageux":
      return <CloudLightning className="h-6 w-6 text-blue-500" />;
    case "Neigeux":
      return <CloudSnow className="h-6 w-6 text-blue-500" />;
    default:
      return <Cloud className="h-6 w-6 text-orange-500" />;
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
    "info" | "companies" | "tourist" | "specialties" | "weather"
  >("info");
  const [mapStyle, setMapStyle] = useState<"default" | "satellite">("default");
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipRegion, setTooltipRegion] = useState<Department | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<[number, number]>([
    0, 0,
  ]);
  const [darkMode, setDarkMode] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showPopulation, setShowPopulation] = useState(true);
  const [showArea, setShowArea] = useState(true);
  const [showDepartments, setShowDepartments] = useState(true);
  const [showCompanies, setShowCompanies] = useState(true);
  const [showWeather, setShowWeather] = useState(true);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData>>(
    {}
  );
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [departmentWeatherData, setDepartmentWeatherData] =
    useState<WeatherData | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const weatherRef = useRef<HTMLDivElement>(null);

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/cameroon.json");
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();

        // Ajouter les coordonnées des départements
        const enhancedData = {
          ...data,
          regions: data.regions.map((region: Department) => ({
            ...region,
            departmentCoordinates: DEPARTMENT_COORDINATES[region.name] || {},
          })),
        };

        setCameroonData(enhancedData);
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
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  // Charger les données météo pour tous les départements d'une région
  useEffect(() => {
    const loadRegionWeather = async () => {
      if (selectedRegion && activeTab === "weather" && showWeather) {
        setLoadingWeather(true);

        const weatherPromises = selectedRegion.departments.map(async (dept) => {
          const coordinates =
            selectedRegion.departmentCoordinates?.[dept] ||
            DEPARTMENT_COORDINATES[selectedRegion.name]?.[dept] ||
            REGION_COORDINATES[selectedRegion.name];

          const data = await fetchWeatherData(dept, coordinates);
          return [dept, data];
        });

        const weatherResults = await Promise.all(weatherPromises);
        const newWeatherData: Record<string, WeatherData> = {};

        weatherResults.forEach(([dept, data]) => {
          newWeatherData[dept as string] = data as WeatherData;
        });

        setWeatherData(newWeatherData);
        setLoadingWeather(false);
      }
    };

    loadRegionWeather();
  }, [selectedRegion, activeTab, showWeather]);

  // Charger les données météo pour un département spécifique
  useEffect(() => {
    const loadDepartmentWeather = async () => {
      if (
        selectedRegion &&
        selectedDepartment &&
        weatherData[selectedDepartment]
      ) {
        setDepartmentWeatherData(weatherData[selectedDepartment]);

        if (weatherRef.current) {
          weatherRef.current.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        setDepartmentWeatherData(null);
      }
    };

    loadDepartmentWeather();
  }, [selectedDepartment, weatherData, selectedRegion]);

  const handleMarkerClick = (region: Department) => {
    setIsAnimating(true);
    setSelectedRegion(region);
    setCenter(REGION_COORDINATES[region.name]);
    setZoom(8);
    setDetailsOpen(true);
    setActiveTab("info");
    setSelectedDepartment(null);
    setDepartmentWeatherData(null);
  };

  const handleDepartmentClick = (dept: string) => {
    setSelectedDepartment(dept);

    // Si on a des coordonnées pour ce département, centrer la carte dessus
    const deptCoordinates =
      selectedRegion?.departmentCoordinates?.[dept] ||
      DEPARTMENT_COORDINATES[selectedRegion?.name || ""]?.[dept];

    if (deptCoordinates) {
      setCenter(deptCoordinates);
      setZoom(9);
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
    setImmersiveMode(false);
    setSelectedDepartment(null);
    setDepartmentWeatherData(null);
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

  const refreshWeather = async () => {
    if (selectedRegion) {
      setLoadingWeather(true);

      const weatherPromises = selectedRegion.departments.map(async (dept) => {
        const coordinates =
          selectedRegion.departmentCoordinates?.[dept] ||
          DEPARTMENT_COORDINATES[selectedRegion.name]?.[dept] ||
          REGION_COORDINATES[selectedRegion.name];

        const data = await fetchWeatherData(dept, coordinates);
        return [dept, data];
      });

      const weatherResults = await Promise.all(weatherPromises);
      const newWeatherData: Record<string, WeatherData> = {};

      weatherResults.forEach(([dept, data]) => {
        newWeatherData[dept as string] = data as WeatherData;
      });

      setWeatherData(newWeatherData);

      if (selectedDepartment) {
        setDepartmentWeatherData(newWeatherData[selectedDepartment]);
      }

      setLoadingWeather(false);
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
    setSelectedDepartment(null);
    setDepartmentWeatherData(null);
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

  const getWeatherConditionColor = (condition: string): string => {
    switch (condition) {
      case "Ensoleillé":
        return "#f59e0b"; // yellow-500
      case "Partiellement nuageux":
        return "#60a5fa"; // blue-400
      case "Nuageux":
        return "#6b7280"; // gray-500
      case "Pluvieux":
        return "#3b82f6"; // blue-500
      case "Orageux":
        return "#8b5cf6"; // purple-500
      default:
        return "#6b7280"; // gray-500
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
            onClick={() => setShowWeather(!showWeather)}
            title={showWeather ? "Masquer la météo" : "Afficher la météo"}
          >
            {showWeather ? (
              <Cloud className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
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

              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  checked={showWeather}
                  onChange={() => setShowWeather(!showWeather)}
                  id="showWeather"
                  className="mr-2"
                />
                <label
                  htmlFor="showWeather"
                  className={`text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Afficher la météo
                </label>
              </div>
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

              {/* Affichage des marqueurs météo pour les départements */}
              {showWeather &&
                selectedRegion &&
                Object.entries(weatherData).map(([dept, data]) => {
                  const deptCoordinates =
                    selectedRegion.departmentCoordinates?.[dept] ||
                    DEPARTMENT_COORDINATES[selectedRegion.name]?.[dept];

                  if (deptCoordinates) {
                    return (
                      <Marker
                        key={`weather-${dept}`}
                        width={30}
                        anchor={deptCoordinates}
                        onClick={() => handleDepartmentClick(dept)}
                        color={getWeatherConditionColor(data.condition)}
                      >
                        <div className="flex items-center justify-center w-full h-full">
                          {/* {getWeatherIcon(data.condition)} */}
                        </div>
                      </Marker>
                    );
                  }
                  return null;
                })}

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

              {/* Affichage des tooltips météo pour les départements */}
              {showWeather &&
                selectedRegion &&
                selectedDepartment &&
                weatherData[selectedDepartment] && (
                  <Overlay
                    anchor={weatherData[selectedDepartment].coordinates}
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
                        {getWeatherIcon(
                          weatherData[selectedDepartment].condition
                        )}
                        <span className="ml-1">
                          {selectedDepartment}:{" "}
                          {weatherData[selectedDepartment].temperature}°C
                        </span>
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
                {showWeather && (
                  <>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                      <span
                        className={`text-xs ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Ensoleillé
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-400 rounded-full mr-2"></div>
                      <span
                        className={`text-xs ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Nuageux/Pluvieux
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
                      <b>Superficie</b>
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
                        Entr.
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
                        <Building2 className="h-4 w-4 mr-1" />
                        Spéc.
                      </div>
                    </button>
                    <button
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        activeTab === "tourist"
                          ? darkMode
                            ? "border-b-2 border-green-400 text-green-400"
                            : "border-b-2 border-green-600 text-green-600"
                          : darkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("tourist")}
                    >
                      <div className="flex items-center justify-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        Tours.
                      </div>
                    </button>
                    <button
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        activeTab === "weather"
                          ? darkMode
                            ? "border-b-2 border-green-400 text-green-400"
                            : "border-b-2 border-green-600 text-green-600"
                          : darkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => setActiveTab("weather")}
                    >
                      <div className="flex items-center justify-center">
                        <Cloud className="h-4 w-4 mr-1" />
                        Météo
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
                          {getRegionPosition(selectedRegion.name)} du Cameroun.
                          Sa capitale est {selectedRegion.capital}.
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
                              {formatNumber(selectedRegion.population)}{" "}
                              habitants
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

                  {activeTab === "specialties" &&
                    selectedRegion.specialties && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="flex justify-between items-center mb-4">
                          <h3
                            className={`text-xl font-bold ${
                              darkMode ? "text-gray-100" : "text-gray-800"
                            }`}
                          >
                            Spécialités de la région 🏞️
                          </h3>
                        </div>

                        {/* Section Gastronomie */}
                        <div
                          className={`p-5 rounded-xl transition-all duration-300 ${
                            darkMode
                              ? "bg-gray-800"
                              : "bg-gray-50 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center mb-3">
                            <div className="bg-red-500 p-2 rounded-full mr-3 text-white">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-1.5l-4.25 4.25a1 1 0 01-.707.293H12a1 1 0 01-1-1v-1.293a1 1 0 01.293-.707l4.25-4.25a2 2 0 112.828 2.828z"
                                />
                              </svg>
                            </div>
                            <h4
                              className={`text-lg font-semibold ${
                                darkMode ? "text-gray-200" : "text-gray-700"
                              }`}
                            >
                              Gastronomie 🍽️
                            </h4>
                          </div>
                          <p
                            className={`text-sm leading-relaxed ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {selectedRegion.specialties.gastronomy}
                          </p>
                        </div>

                        {/* Section Professions */}
                        <div
                          className={`p-5 rounded-xl transition-all duration-300 ${
                            darkMode
                              ? "bg-gray-800"
                              : "bg-gray-50 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center mb-3">
                            <div className="bg-blue-500 p-2 rounded-full mr-3 text-white">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-1.282-8.45-3.525m16.9 0c.305.772.455 1.58.45 2.395a10 10 0 11-10-10c.815-.005 1.623.145 2.395.45"
                                />
                              </svg>
                            </div>
                            <h4
                              className={`text-lg font-semibold ${
                                darkMode ? "text-gray-200" : "text-gray-700"
                              }`}
                            >
                              Métiers et Professions 👨‍🌾
                            </h4>
                          </div>
                          <p
                            className={`text-sm leading-relaxed ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {selectedRegion.specialties.professions}
                          </p>
                        </div>

                        {/* Section Divertissement */}
                        <div
                          className={`p-5 rounded-xl transition-all duration-300 ${
                            darkMode
                              ? "bg-gray-800"
                              : "bg-gray-50 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center mb-3">
                            <div className="bg-green-500 p-2 rounded-full mr-3 text-white">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14.752 11.125l3.248-3.25m0 0l-3.248-3.25m3.248 3.25H9.752M6.752 20.125l-3.248-3.25m0 0l3.248-3.25m-3.248 3.25h9.25"
                                />
                              </svg>
                            </div>
                            <h4
                              className={`text-lg font-semibold ${
                                darkMode ? "text-gray-200" : "text-gray-700"
                              }`}
                            >
                              Divertissement et Culture 🎭
                            </h4>
                          </div>
                          <p
                            className={`text-sm leading-relaxed ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {selectedRegion.specialties.entertainment}
                          </p>
                        </div>
                      </div>
                    )}

                  {activeTab === "companies" &&
                    selectedRegion.majorCompanies && (
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
                          {selectedRegion.majorCompanies.map(
                            (company, index) => (
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
                                          darkMode
                                            ? "text-gray-200"
                                            : "text-gray-800"
                                        }`}
                                      >
                                        {company.name}
                                      </div>
                                      <div
                                        className={`text-sm ${
                                          darkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {company.sector}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {activeTab === "tourist" && selectedRegion.touristSites && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center mb-4">
                        <h3
                          className={`text-xl font-bold ${
                            darkMode ? "text-gray-100" : "text-gray-800"
                          }`}
                        >
                          Sites touristiques 🗺️
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {selectedRegion.touristSites.map(
                          (site: any, index: any) => (
                            <div
                              key={index}
                              className={`relative p-5 rounded-xl transition-all duration-300 bg-gray-50 border}
          `}
                            >
                              {/* Contenu de la carte */}
                              <div className="relative z-20">
                                <div className="flex items-center mb-3">
                                  <h4
                                    className={`text-lg font-semibold ${
                                      darkMode
                                        ? "text-gray-200"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {site.name}
                                  </h4>
                                </div>
                                <p
                                  className={`text-sm leading-relaxed ${
                                    darkMode ? "text-gray-400" : "text-gray-600"
                                  } mb-4`}
                                >
                                  {site.description}
                                </p>
                                <div
                                  className={`mt-2 text-xs flex items-center ${
                                    darkMode ? "text-gray-500" : "text-gray-500"
                                  }`}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1 text-indigo-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.057 5.188a8 8 0 1011.386 0L15.343 4.5A8 8 0 005.057 5.188zM10 12a2 2 0 100-4 2 2 0 000 4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span>{site.location}</span>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Nouvel onglet Météo */}
                  {activeTab === "weather" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between mb-4">
                        <h4
                          className={`text-sm font-semibold ${
                            darkMode ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          Météo par département
                        </h4>
                        <button
                          onClick={refreshWeather}
                          className={`p-2 rounded ${
                            darkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          } flex items-center text-xs`}
                          disabled={loadingWeather}
                        >
                          {loadingWeather ? (
                            <div className="animate-spin h-4 w-4 border-2 border-t-transparent border-blue-500 rounded-full mr-1"></div>
                          ) : (
                            <RefreshCw className="h-3 w-3 mr-1" />
                          )}
                          Actualiser
                        </button>
                      </div>

                      {loadingWeather ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
                          <p
                            className={`ml-3 ${
                              darkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            Chargement des données météo...
                          </p>
                        </div>
                      ) : (
                        <>
                          {selectedDepartment && departmentWeatherData && (
                            <div
                              ref={weatherRef}
                              className={`p-4 rounded-lg border mb-6 ${
                                darkMode
                                  ? "bg-gray-700 border-gray-600"
                                  : "bg-white border-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h3
                                  className={`font-semibold ${
                                    darkMode ? "text-gray-100" : "text-gray-800"
                                  }`}
                                >
                                  {selectedDepartment}
                                </h3>
                                <button
                                  onClick={() => {
                                    setSelectedDepartment(null);
                                    setDepartmentWeatherData(null);
                                  }}
                                  className={`p-1 rounded-full ${
                                    darkMode
                                      ? "hover:bg-gray-600"
                                      : "hover:bg-gray-200"
                                  }`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="flex items-center mb-4">
                                <div className="mr-4">
                                  {getWeatherIcon(
                                    departmentWeatherData.condition
                                  )}
                                </div>
                                <div>
                                  <div
                                    className={`text-2xl font-bold ${
                                      darkMode
                                        ? "text-gray-100"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {departmentWeatherData.temperature}°C
                                  </div>
                                  <div
                                    className={`${
                                      darkMode
                                        ? "text-gray-300"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {departmentWeatherData.condition}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3 mb-4">
                                <div
                                  className={`p-2 rounded ${
                                    darkMode ? "bg-gray-800" : "bg-gray-50"
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <Wind className="h-4 w-4 mr-1 text-blue-400" />
                                    <span
                                      className={`text-xs ${
                                        darkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Vent
                                    </span>
                                  </div>
                                  <div
                                    className={`font-medium ${
                                      darkMode
                                        ? "text-gray-200"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {departmentWeatherData.windSpeed} km/h
                                  </div>
                                </div>
                                <div
                                  className={`p-2 rounded ${
                                    darkMode ? "bg-gray-800" : "bg-gray-50"
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <Droplets className="h-4 w-4 mr-1 text-blue-400" />
                                    <span
                                      className={`text-xs ${
                                        darkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Humidité
                                    </span>
                                  </div>
                                  <div
                                    className={`font-medium ${
                                      darkMode
                                        ? "text-gray-200"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {departmentWeatherData.humidity}%
                                  </div>
                                </div>
                                <div
                                  className={`p-2 rounded ${
                                    darkMode ? "bg-gray-800" : "bg-gray-50"
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <CloudRain className="h-4 w-4 mr-1 text-blue-400" />
                                    <span
                                      className={`text-xs ${
                                        darkMode
                                          ? "text-gray-400"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      Précip.
                                    </span>
                                  </div>
                                  <div
                                    className={`font-medium ${
                                      darkMode
                                        ? "text-gray-200"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {departmentWeatherData.precipitation}%
                                  </div>
                                </div>
                              </div>

                              {departmentWeatherData.forecast && (
                                <div>
                                  <h4
                                    className={`text-sm font-medium mb-2 ${
                                      darkMode
                                        ? "text-gray-300"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    Prévisions pour les prochains jours
                                  </h4>
                                  <div className="grid grid-cols-3 gap-2">
                                    {departmentWeatherData.forecast.map(
                                      (day, index) => (
                                        <div
                                          key={index}
                                          className={`p-2 rounded text-center ${
                                            darkMode
                                              ? "bg-gray-800"
                                              : "bg-gray-50"
                                          }`}
                                        >
                                          <div
                                            className={`text-sm font-medium mb-1text-gray-700}`}
                                          >
                                            {day.day}
                                          </div>
                                          <div className="flex justify-center mb-1">
                                            {day.icon === "sun" && (
                                              <Sun className="h-5 w-5 text-orange-500" />
                                            )}
                                            {day.icon === "cloud-sun" && (
                                              <div className="relative">
                                                <Cloud className="h-5 w-5 text-blue-500" />
                                                <Sun className="h-3 w-3 text-orange-500 absolute -top-1 -right-1" />
                                              </div>
                                            )}
                                            {day.icon === "cloud" && (
                                              <Cloud className="h-5 w-5 text-blue-500" />
                                            )}
                                            {day.icon === "cloud-rain" && (
                                              <CloudRain className="h-5 w-5 text-orange-500" />
                                            )}
                                            {day.icon === "cloud-lightning" && (
                                              <CloudLightning className="h-5 w-5 text-blue-500" />
                                            )}
                                          </div>
                                          <div className={`text-sm`}>
                                            {day.maxTemp}° / {day.minTemp}°
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Liste des départements avec leur météo */}
                          <div className="grid grid-cols-1 gap-3">
                            {Object.entries(weatherData).map(([dept, data]) => (
                              <div
                                key={dept}
                                className={`p-3 rounded-lg border cursor-pointer ${
                                  selectedDepartment === dept
                                    ? darkMode
                                      ? "bg-blue-900 border-blue-700"
                                      : "bg-blue-50 border-blue-200"
                                    : darkMode
                                    ? "bg-gray-700 border-gray-600 hover:bg-gray-650"
                                    : "bg-white border-gray-200 hover:bg-gray-50"
                                } transition-all`}
                                onClick={() => handleDepartmentClick(dept)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white`}
                                    >
                                      {getWeatherIcon(data.condition)}
                                    </div>
                                    <div>
                                      <div
                                        className={`font-medium ${
                                          selectedDepartment === dept
                                            ? darkMode
                                              ? "text-blue-100"
                                              : "text-blue-800"
                                            : darkMode
                                            ? "text-gray-200"
                                            : "text-gray-800"
                                        }`}
                                      >
                                        {dept}
                                      </div>
                                      <div
                                        className={`text-sm ${
                                          selectedDepartment === dept
                                            ? darkMode
                                              ? "text-blue-200"
                                              : "text-blue-600"
                                            : darkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {data.condition}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <div
                                      className={`text-2xl font-bold ${
                                        selectedDepartment === dept
                                          ? darkMode
                                            ? "text-blue-100"
                                            : "text-blue-800"
                                          : darkMode
                                          ? "text-gray-200"
                                          : "text-gray-800"
                                      }`}
                                    >
                                      {data.temperature}°C
                                    </div>
                                    <ChevronRight
                                      className={`h-5 w-5 ml-2 ${
                                        selectedDepartment === dept
                                          ? darkMode
                                            ? "text-blue-300"
                                            : "text-blue-500"
                                          : darkMode
                                          ? "text-gray-500"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
