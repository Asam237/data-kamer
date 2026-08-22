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
  Building2,
  Search,
  X,
  ChevronRight,
  Globe,
  Sun,
  MapPin,
  Maximize,
  Minimize,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  RefreshCw,
  ChevronLeft,
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
  specialties?: {
    gastronomy: string;
    professions: string;
    entertainment: string;
  };
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
  const [immersiveMode, setImmersiveMode] = useState(false);
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

  const weatherRef = useRef<HTMLDivElement>(null);

  const [isAnimating, setIsAnimating] = useState(false);

  const [showCarousel, setShowCarousel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSite, setSelectedSite] = useState<any>(null);

  const openCarousel = (site: any, index: number = 0) => {
    setSelectedSite(site);
    setCurrentImageIndex(index);
    setShowCarousel(true);
  };

  const nextImage = () => {
    if (selectedSite) {
      const allImages = selectedSite.images || [selectedSite.image];
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevImage = () => {
    if (selectedSite) {
      const allImages = selectedSite.images || [selectedSite.image];
      setCurrentImageIndex(
        (prev) => (prev - 1 + allImages.length) % allImages.length
      );
    }
  };

  // La liste des régions est repliée par défaut sur mobile/tablette
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/cameroon.json");
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();

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
    setZoom(10);
    setDetailsOpen(true);
    setActiveTab("info");
    setSelectedDepartment(null);
    setDepartmentWeatherData(null);
    // Sur mobile/tablette, on referme la liste pour laisser place aux détails
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleDepartmentClick = (dept: string) => {
    setSelectedDepartment(dept);

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

  const toggleImmersiveMode = () => {
    setImmersiveMode(!immersiveMode);
    if (!immersiveMode) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
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
        return "#f59e0b";
      case "Partiellement nuageux":
        return "#60a5fa";
      case "Nuageux":
        return "#6b7280";
      case "Pluvieux":
        return "#3b82f6";
      case "Orageux":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh] bg-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-foreground">
            Chargement des données...
          </p>
          <p className="text-muted-foreground mt-2">
            Préparation de la carte interactive du Cameroun
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh] bg-muted">
        <div className="bg-card border-red-500 border-l-4 shadow-lg rounded-lg p-6 max-w-md">
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
              <h2 className="text-lg font-bold text-foreground mb-1">
                Erreur de chargement
              </h2>
              <p className="text-muted-foreground">{error}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Assurez-vous que le fichier JSON est correctement placé dans le
                dossier{" "}
                <code className="bg-muted px-2 py-1 rounded text-sm">
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
      <div className="flex items-center justify-center h-full min-h-[60vh] bg-muted">
        <div className="text-center">
          <p className="text-xl font-semibold text-foreground">
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
    <div className="flex flex-col h-full bg-muted text-foreground transition-colors duration-300">
      <div className="bg-card border-border border-b px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center gap-2 shadow-sm transition-colors duration-300">
        <div className="flex items-center min-w-0">
          <button
            className="mr-2 sm:mr-3 p-2 rounded-full hover:bg-muted transition-colors flex-shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Afficher/masquer la liste des régions"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base sm:text-xl font-bold flex items-center min-w-0">
            <Globe className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-600 flex-shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Carte du Cameroun</span>
              <span className="hidden sm:inline">
                Carte Interactive du Cameroun
              </span>
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button
            className="p-1.5 sm:p-2 rounded-full bg-muted hover:bg-muted/70 transition-colors"
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
            className="p-1.5 sm:p-2 rounded-full bg-muted hover:bg-muted/70 transition-colors"
            onClick={toggleMapStyle}
            title={mapStyle === "default" ? "Vue satellite" : "Vue carte"}
          >
            <Layers className="h-5 w-5" />
          </button>
          <button
            className="p-1.5 sm:p-2 rounded-full bg-muted hover:bg-muted/70 transition-colors"
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

      <div className="flex flex-1 overflow-hidden relative">
        {/* Overlay mobile pour la liste des régions */}
        {sidebarOpen && !immersiveMode && (
          <div
            className="absolute inset-0 bg-black/40 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {sidebarOpen && !immersiveMode && (
          <div className="absolute lg:relative inset-y-0 left-0 z-30 lg:z-10 w-80 max-w-[85vw] bg-card border-border border-r shadow-lg overflow-hidden flex flex-col transition-all duration-300">
            <div className="bg-muted border-b p-4">
              <h2 className="font-bold text-foreground flex items-center">
                <MapIcon className="h-5 w-5 mr-2 text-green-600" />
                Régions du Cameroun ({cameroonData.regions.length})
              </h2>

              <div className="mt-3 relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher une région..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-card border-border text-foreground placeholder-gray-500"
                  />
                  {searchTerm ? (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <Search className="absolute right-3 top-2.5 text-muted-foreground h-4 w-4" />
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
                  className="text-sm font-medium text-foreground"
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
                  className="text-sm font-medium text-foreground"
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
                      className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border ${
                        selectedRegion?.id === region.id
                          ? "border-green-500 shadow-md"
                          : "border-border hover:border-border hover:shadow-sm"
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
                          <div className="font-medium text-foreground">
                            {region.name}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Home className="h-3 w-3 mr-1" />
                            {region.capital}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-2">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    Aucune région trouvée
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Essayez avec un autre terme de recherche
                  </p>
                  {searchTerm && (
                    <button
                      className="mt-4 px-4 py-2 bg-muted text-foreground hover:bg-muted/70 rounded transition-colors text-sm"
                      onClick={() => setSearchTerm("")}
                    >
                      Effacer la recherche
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="bg-muted border-border border-t p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Aperçu du Cameroun
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-card p-2 rounded border border-border hover:shadow-md transition-shadow duration-200">
                  <div className="text-xs text-muted-foreground">Population</div>
                  <div className="font-medium text-foreground">
                    {formatNumber(cameroonData.overview.totalPopulation)}
                  </div>
                </div>
                <div className="bg-card p-2 rounded border border-border hover:shadow-md transition-shadow duration-200">
                  <div className="text-xs text-muted-foreground">Superficie</div>
                  <div className="font-medium text-foreground">
                    {formatNumber(cameroonData.overview.totalArea)} km²
                  </div>
                </div>
                <div className="bg-card p-2 rounded border border-border hover:shadow-md transition-shadow duration-200">
                  <div className="text-xs text-muted-foreground">Capitale</div>
                  <div className="font-medium text-foreground">
                    {cameroonData.overview.capital}
                  </div>
                </div>
                <div className="bg-card p-2 rounded border border-border hover:shadow-md transition-shadow duration-200">
                  <div className="text-xs text-muted-foreground">Monnaie</div>
                  <div className="font-medium text-foreground">
                    {cameroonData.overview.currency}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </>
        )}

        <div className="flex-1 flex overflow-hidden relative">
          <div
            className={`w-full ${
              detailsOpen && !immersiveMode ? "lg:w-3/5" : ""
            } transition-all duration-300 relative`}
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
                        <div className="flex items-center justify-center w-full h-full"></div>
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
                  <div className="px-3 py-1.5 rounded shadow-lg text-sm font-medium border pointer-events-none bg-card text-foreground border-border">
                    {tooltipRegion.name} - {tooltipRegion.capital}
                  </div>
                </Overlay>
              )}

              {showWeather &&
                selectedRegion &&
                selectedDepartment &&
                weatherData[selectedDepartment] && (
                  <Overlay
                    anchor={weatherData[selectedDepartment].coordinates}
                    offset={[0, -20]}
                  >
                    <div className="px-3 py-2 rounded-lg shadow-lg text-sm font-medium border bg-card text-foreground border-border">
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

            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col space-y-2">
              <button
                className="rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-opacity-90 transition-colors bg-card text-foreground hover:bg-muted"
                onClick={handleZoomIn}
                title="Zoom avant"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                className="rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-opacity-90 transition-colors bg-card text-foreground hover:bg-muted"
                onClick={handleZoomOut}
                title="Zoom arrière"
              >
                <Minus className="h-5 w-5" />
              </button>
              <button
                className="rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-opacity-90 transition-colors bg-card text-foreground hover:bg-muted"
                onClick={resetView}
                title="Vue d'ensemble"
              >
                <Layers className="h-5 w-5" />
              </button>
              <button
                className="rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-opacity-90 transition-colors bg-card text-foreground hover:bg-muted"
                onClick={toggleMapStyle}
                title={mapStyle === "default" ? "Vue satellite" : "Vue carte"}
              >
                <Globe className="h-5 w-5" />
              </button>
            </div>

            <div className="absolute bottom-14 right-4 p-3 rounded-lg shadow-md border bg-card border-border text-foreground hidden md:block">
              <div className="text-sm font-medium mb-2">Légende</div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-xs text-foreground">Régions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-xs text-foreground">
                    Région sélectionnée
                  </span>
                </div>
                {showWeather && (
                  <>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-xs text-foreground">Ensoleillé</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-400 rounded-full mr-2"></div>
                      <span className="text-xs text-foreground">
                        Nuageux/Pluvieux
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {detailsOpen && selectedRegion && !immersiveMode && (
            <div className="absolute inset-0 z-40 lg:z-auto lg:static w-full lg:w-2/5 overflow-y-auto transition-all duration-300 lg:border-l bg-card border-border shadow-lg">
              <div className="sticky top-0 z-10">
                <div className="p-4 text-white bg-blue-700">
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

                <div className="p-3 border-b bg-green-50 border-border">
                  <div className="flex justify-around text-center">
                    <div>
                      <div className="text-lg font-bold text-foreground">
                        {formatNumber(selectedRegion.population)}
                      </div>
                      <div className="text-xs text-muted-foreground">Habitants</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">
                        {formatNumber(selectedRegion.area)}
                      </div>
                      <div className="text-xs text-muted-foreground">km²</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">
                        {Math.round(
                          selectedRegion.population / selectedRegion.area
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">hab/km²</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">
                        {selectedRegion.departments.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Départements</div>
                    </div>
                  </div>

                  <div className="flex border-b border-border mt-3">
                    <button
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        activeTab === "info"
                          ? "border-b-2 border-green-600 text-green-600"
                          : "text-muted-foreground hover:text-foreground"
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
                          ? "border-b-2 border-green-600 text-green-600"
                          : "text-muted-foreground hover:text-foreground"
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
                          ? "border-b-2 border-green-600 text-green-600"
                          : "text-muted-foreground hover:text-foreground"
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
                          ? "border-b-2 border-green-600 text-green-600"
                          : "text-muted-foreground hover:text-foreground"
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
                          ? "border-b-2 border-green-600 text-green-600"
                          : "text-muted-foreground hover:text-foreground"
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
                      <div className="p-4 rounded-lg bg-muted">
                        <h4 className="text-sm font-semibold mb-2 text-foreground">
                          Position géographique
                        </h4>
                        <p className="text-muted-foreground">
                          La région de {selectedRegion.name} est située au{" "}
                          {getRegionPosition(selectedRegion.name)} du Cameroun.
                          Sa capitale est {selectedRegion.capital}.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-foreground">
                          Départements ({selectedRegion.departments.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedRegion.departments.map((dept, index) => (
                            <div
                              key={index}
                              className="p-2 rounded bg-muted text-foreground flex items-center"
                            >
                              <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
                              <span className="text-sm">{dept}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border bg-card border-border">
                        <h4 className="text-sm font-semibold mb-2 text-foreground flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Démographie
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Population:
                            </span>
                            <span className="font-medium text-foreground">
                              {formatNumber(selectedRegion.population)}{" "}
                              habitants
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Superficie:
                            </span>
                            <span className="font-medium text-foreground">
                              {formatNumber(selectedRegion.area)} km²
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Densité:
                            </span>
                            <span className="font-medium text-foreground">
                              {Math.round(
                                selectedRegion.population / selectedRegion.area
                              )}{" "}
                              hab/km²
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Nombre de départements:
                            </span>
                            <span className="font-medium text-foreground">
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
                          <h3 className="text-xl font-bold text-foreground">
                            Spécialités de la région 🏞️
                          </h3>
                        </div>

                        <div className="p-5 rounded-xl transition-all duration-300 bg-muted hover:bg-card">
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
                            <h4 className="text-lg font-semibold text-foreground">
                              Gastronomie 🍽️
                            </h4>
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {selectedRegion.specialties.gastronomy}
                          </p>
                        </div>

                        <div className="p-5 rounded-xl transition-all duration-300 bg-muted hover:bg-card">
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
                            <h4 className="text-lg font-semibold text-foreground">
                              Métiers et Professions 👨‍🌾
                            </h4>
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {selectedRegion.specialties.professions}
                          </p>
                        </div>

                        <div className="p-5 rounded-xl transition-all duration-300 bg-muted hover:bg-card">
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
                            <h4 className="text-lg font-semibold text-foreground">
                              Divertissement et Culture 🎭
                            </h4>
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {selectedRegion.specialties.entertainment}
                          </p>
                        </div>
                      </div>
                    )}

                  {activeTab === "companies" &&
                    selectedRegion.majorCompanies && (
                      <div className="space-y-4 animate-fadeIn">
                        <h4 className="text-sm font-semibold mb-2 text-foreground">
                          Principales entreprises (
                          {selectedRegion.majorCompanies.length})
                        </h4>
                        <div className="space-y-3">
                          {selectedRegion.majorCompanies.map(
                            (company, index) => (
                              <div
                                key={index}
                                className="p-3 rounded-lg border bg-card border-border hover:shadow-md transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div
                                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white"
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
                                      <div className="font-medium text-foreground">
                                        {company.name}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
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
                        <h3 className="text-xl font-bold text-foreground">
                          Sites touristiques 🗺️
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {selectedRegion.touristSites.map(
                          (site: any, index: any) => (
                            <div
                              key={index}
                              className="relative p-5 rounded-xl transition-all duration-300 bg-muted border"
                            >
                              <div
                                className="relative p-0 overflow-hidden transition-all duration-500 transform bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl hover:shadow-3xl group h-64 sm:h-96 border border-border cursor-pointer"
                                onClick={() => openCarousel(site)}
                              >
                                <div
                                  className="absolute inset-0 z-0 w-full h-full transition-all duration-700 opacity-90 group-hover:opacity-100 group-hover:scale-105"
                                  style={{
                                    backgroundImage: `url(${site.image})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    filter:
                                      "brightness(0.9) saturate(1.3) contrast(1.1)",
                                  }}
                                ></div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-5"></div>

                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-all duration-700 z-10"></div>

                                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                                  <div className="bg-card/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/60 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                                    <h4 className="text-xl font-bold text-foreground mb-2 leading-tight">
                                      {site.name}
                                    </h4>
                                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                                      {site.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "weather" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-foreground">
                          Météo par département
                        </h4>
                        <button
                          onClick={refreshWeather}
                          className="p-2 rounded bg-muted hover:bg-muted/70 text-foreground flex items-center text-xs"
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
                          <p className="ml-3 text-muted-foreground">
                            Chargement des données météo...
                          </p>
                        </div>
                      ) : (
                        <>
                          {selectedDepartment && departmentWeatherData && (
                            <div
                              ref={weatherRef}
                              className="p-4 rounded-lg border mb-6 bg-card border-border"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-foreground">
                                  {selectedDepartment}
                                </h3>
                                <button
                                  onClick={() => {
                                    setSelectedDepartment(null);
                                    setDepartmentWeatherData(null);
                                  }}
                                  className="p-1 rounded-full hover:bg-muted/70"
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
                                  <div className="text-2xl font-bold text-foreground">
                                    {departmentWeatherData.temperature}°C
                                  </div>
                                  <div className="text-muted-foreground">
                                    {departmentWeatherData.condition}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="p-2 rounded bg-muted">
                                  <div className="flex items-center">
                                    <Wind className="h-4 w-4 mr-1 text-blue-400" />
                                    <span className="text-xs text-muted-foreground">
                                      Vent
                                    </span>
                                  </div>
                                  <div className="font-medium text-foreground">
                                    {departmentWeatherData.windSpeed} km/h
                                  </div>
                                </div>
                                <div className="p-2 rounded bg-muted">
                                  <div className="flex items-center">
                                    <Droplets className="h-4 w-4 mr-1 text-blue-400" />
                                    <span className="text-xs text-muted-foreground">
                                      Humidité
                                    </span>
                                  </div>
                                  <div className="font-medium text-foreground">
                                    {departmentWeatherData.humidity}%
                                  </div>
                                </div>
                                <div className="p-2 rounded bg-muted">
                                  <div className="flex items-center">
                                    <CloudRain className="h-4 w-4 mr-1 text-blue-400" />
                                    <span className="text-xs text-muted-foreground">
                                      Précip.
                                    </span>
                                  </div>
                                  <div className="font-medium text-foreground">
                                    {departmentWeatherData.precipitation}%
                                  </div>
                                </div>
                              </div>

                              {departmentWeatherData.forecast && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                                    Prévisions pour les prochains jours
                                  </h4>
                                  <div className="grid grid-cols-3 gap-2">
                                    {departmentWeatherData.forecast.map(
                                      (day, index) => (
                                        <div
                                          key={index}
                                          className="p-2 rounded text-center bg-muted"
                                        >
                                          <div className="text-sm font-medium mb-1 text-foreground">
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
                                          <div className="text-sm">
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

                          <div className="grid grid-cols-1 gap-3">
                            {Object.entries(weatherData).map(([dept, data]) => (
                              <div
                                key={dept}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                  selectedDepartment === dept
                                    ? "bg-blue-50 border-blue-200"
                                    : "bg-card border-border hover:bg-muted"
                                }`}
                                onClick={() => handleDepartmentClick(dept)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white">
                                      {getWeatherIcon(data.condition)}
                                    </div>
                                    <div>
                                      <div
                                        className={`font-medium ${
                                          selectedDepartment === dept
                                            ? "text-blue-800"
                                            : "text-foreground"
                                        }`}
                                      >
                                        {dept}
                                      </div>
                                      <div
                                        className={`text-sm ${
                                          selectedDepartment === dept
                                            ? "text-blue-600"
                                            : "text-muted-foreground"
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
                                          ? "text-blue-800"
                                          : "text-foreground"
                                      }`}
                                    >
                                      {data.temperature}°C
                                    </div>
                                    <ChevronRight
                                      className={`h-5 w-5 ml-2 ${
                                        selectedDepartment === dept
                                          ? "text-blue-500"
                                          : "text-muted-foreground"
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

      {showCarousel && selectedSite && (
        <div
          className="modal-fullscreen flex items-center justify-center bg-black"
          onClick={() => setShowCarousel(false)}
        >
          <button
            onClick={() => setShowCarousel(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 bg-card/5 hover:bg-card/10 rounded-full transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-white/20 hover:scale-110 hover:rotate-90 z-50 group"
          >
            <X
              className="w-5 h-5 sm:w-7 sm:h-7 text-white/80 group-hover:text-white"
              strokeWidth={2}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-2 sm:left-6 p-3 sm:p-5 bg-card/5 hover:bg-card/10 rounded-full transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-white/20 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 z-50 group"
            disabled={!selectedSite.images || selectedSite.images.length <= 1}
          >
            <ChevronLeft
              className="w-6 h-6 sm:w-8 sm:h-8 text-white/80 group-hover:text-white"
              strokeWidth={2.5}
            />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-2 sm:right-6 p-3 sm:p-5 bg-card/5 hover:bg-card/10 rounded-full transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-white/20 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 z-50 group"
            disabled={!selectedSite.images || selectedSite.images.length <= 1}
          >
            <ChevronRight
              className="w-6 h-6 sm:w-8 sm:h-8 text-white/80 group-hover:text-white"
              strokeWidth={2.5}
            />
          </button>

          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={
                (selectedSite.images || [selectedSite.image])[currentImageIndex]
              }
              alt={`${selectedSite.name} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {selectedSite.images && selectedSite.images.length > 1 && (
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3 py-1.5 sm:px-4 sm:py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 z-50">
              <span className="text-white text-sm font-medium">
                {currentImageIndex + 1} / {selectedSite.images.length}
              </span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-20 sm:pt-32 pb-6 sm:pb-8 px-4 sm:px-8 z-40">
            <div className="max-w-4xl mx-auto text-center space-y-3">
              <h3 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                {selectedSite.name}
              </h3>
              <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none">
                {selectedSite.description}
              </p>

              {selectedSite.images && selectedSite.images.length > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                  {selectedSite.images.map((_: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(idx);
                      }}
                      className={`transition-all duration-300 rounded-full ${
                        idx === currentImageIndex
                          ? "bg-card w-10 h-2.5 shadow-lg shadow-white/50"
                          : "bg-card/30 w-2.5 h-2.5 hover:bg-card/50 hover:scale-125"
                      }`}
                      aria-label={`Image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
