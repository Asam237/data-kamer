import React, { useState, useEffect } from "react";
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
  ChevronUp,
  Building2,
  Briefcase,
  UtensilsCrossed,
  Landmark,
  Music,
  Search,
  X,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// Types pour les données
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

// Coordonnées approximatives des capitales régionales du Cameroun
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

// Fonction pour générer une couleur basée sur l'ID
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

const MapView: React.FC = () => {
  const [cameroonData, setCameroonData] = useState<CameroonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([7.3697, 12.3547]); // Centre du Cameroun
  const [zoom, setZoom] = useState(6);
  const [selectedRegion, setSelectedRegion] = useState<Department | null>(null);
  const [showRegions, setShowRegions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "info" | "companies" | "jobs" | "specialties"
  >("info");
  const [mapStyle, setMapStyle] = useState<"default" | "satellite">("default");
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipRegion, setTooltipRegion] = useState<Department | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<[number, number]>([
    0, 0,
  ]);

  // Charger les données depuis le fichier JSON
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/cameroon.json");
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();

        // Nous gardons seulement les régions et l'aperçu général
        const filteredData = {
          regions: data.regions,
          overview: {
            ...data.overview,
            totalUniversities: undefined, // Suppression de cette propriété
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

  const handleMarkerClick = (region: Department) => {
    setSelectedRegion(region);
    setCenter(REGION_COORDINATES[region.name]);
    setZoom(8);
    setDetailsOpen(true);
    setActiveTab("info");
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
  };

  const toggleMapStyle = () => {
    setMapStyle(mapStyle === "default" ? "satellite" : "default");
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
  };

  // Fonction pour formater les nombres avec séparateur de milliers
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Fonction pour le provider de carte
  const mapTiler = (x: number, y: number, z: number, dpr?: number) => {
    return mapStyle === "default"
      ? `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
      : `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">
            Chargement des données...
          </p>
          <p className="text-gray-500 mt-2">
            Préparation de la carte interactive du Cameroun
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
              <p className="mt-4 text-sm text-gray-500">
                Assurez-vous que le fichier JSON est correctement placé dans le
                dossier{" "}
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700">
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
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-white shadow-lg overflow-hidden flex flex-col z-10">
            <div className="bg-gray-50 border-b p-4">
              <h2 className="font-bold text-gray-800 flex items-center">
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
                    className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      key={region.id}
                      className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border ${
                        selectedRegion?.id === region.id
                          ? "border-green-500 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
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
                          <div className="font-medium">{region.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Home className="h-3 w-3 mr-1" />
                            {region.capital}
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
          </div>
        )}

        {/* Main content area with map and details panel */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Map container */}
          <div
            className={`${
              detailsOpen ? "w-3/5" : "w-full"
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

              {showTooltip && tooltipRegion && !detailsOpen && (
                <Overlay
                  anchor={REGION_COORDINATES[tooltipRegion.name]}
                  offset={[0, -20]}
                >
                  <div className="bg-white px-3 py-1.5 rounded shadow-lg text-sm font-medium border border-gray-200 pointer-events-none">
                    {tooltipRegion.name} - {tooltipRegion.capital}
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
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-700">Régions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-700">
                    Région sélectionnée
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details panel */}
          {detailsOpen && selectedRegion && (
            <div className="w-2/5 bg-white shadow-lg overflow-y-auto transition-all duration-300 border-l border-gray-200">
              <div className="sticky top-0 z-10 bg-white shadow-sm">
                <div className="bg-blue-700 p-4 text-white ">
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
                    <div className="w-5"></div> {/* Spacer for alignment */}
                  </div>
                  <div className="mt-2 text-center text-green-100">
                    Capitale: {selectedRegion.capital}
                  </div>
                </div>

                {/* Stats bar */}
                <div className="bg-green-50 p-3 border-b border-gray-200">
                  <div className="flex justify-around text-center">
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        {formatNumber(selectedRegion.population)}
                      </div>
                      <div className="text-xs text-gray-500">Population</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        {formatNumber(selectedRegion.area)} km²
                      </div>
                      <div className="text-xs text-gray-500">Superficie</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        {selectedRegion.departments.length}
                      </div>
                      <div className="text-xs text-gray-500">Départements</div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                      activeTab === "info"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    } transition-colors`}
                    onClick={() => setActiveTab("info")}
                  >
                    <div className="flex items-center justify-center">
                      <Info className="h-4 w-4 mr-1" />
                      Infos
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                      activeTab === "companies"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    } transition-colors`}
                    onClick={() => setActiveTab("companies")}
                  >
                    <div className="flex items-center justify-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      Entreprises
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                      activeTab === "jobs"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    } transition-colors`}
                    onClick={() => setActiveTab("jobs")}
                  >
                    <div className="flex items-center justify-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      Emploi
                    </div>
                  </button>
                  <button
                    className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                      activeTab === "specialties"
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    } transition-colors`}
                    onClick={() => setActiveTab("specialties")}
                  >
                    <div className="flex items-center justify-center">
                      <UtensilsCrossed className="h-4 w-4 mr-1" />
                      Spécialités
                    </div>
                  </button>
                </div>
              </div>

              {/* Tab content */}
              <div className="p-4">
                {activeTab === "info" && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-3">
                        À propos de la région
                      </h4>
                      <p className="text-gray-600 text-sm">
                        La région {selectedRegion.name} est située au{" "}
                        {getRegionPosition(selectedRegion.name)} du Cameroun
                        avec une superficie de{" "}
                        {formatNumber(selectedRegion.area)} km². Sa capitale est{" "}
                        {selectedRegion.capital} et elle compte environ{" "}
                        {formatNumber(selectedRegion.population)} habitants,
                        soit
                        {(
                          (selectedRegion.population /
                            cameroonData.overview.totalPopulation) *
                          100
                        ).toFixed(1)}
                        % de la population totale du pays.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        Départements ({selectedRegion.departments.length})
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedRegion.departments.map((dept, index) => (
                          <span
                            key={index}
                            className="inline-block bg-white rounded-full px-3 py-1 text-sm font-medium text-gray-700 border border-gray-200 shadow-sm"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "companies" && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">
                      Principales entreprises
                    </h4>

                    {selectedRegion.majorCompanies &&
                    selectedRegion.majorCompanies.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRegion.majorCompanies.map((company, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm flex items-center"
                          >
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                              <Building2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {company.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  {company.sector}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Info className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              Aucune information disponible sur les entreprises
                              de cette région.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "jobs" && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">
                      Secteurs d&apos;emploi demandés
                    </h4>

                    {selectedRegion.jobDemand &&
                    selectedRegion.jobDemand.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRegion.jobDemand.map((job, index) => (
                          <div
                            key={index}
                            className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <Briefcase className="h-5 w-5 text-blue-600" />
                            </div>
                            <span className="text-gray-800">{job}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Info className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              Aucune information disponible sur les secteurs
                              d&apos;emploi de cette région.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "specialties" && (
                  <div className="space-y-4">
                    {selectedRegion.specialties ? (
                      <>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                            <UtensilsCrossed className="h-5 w-5 mr-2 text-amber-600" />
                            Gastronomie
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {selectedRegion.specialties.gastronomy}
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                            <Landmark className="h-5 w-5 mr-2 text-indigo-600" />
                            Professions traditionnelles
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {selectedRegion.specialties.professions}
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                            <Music className="h-5 w-5 mr-2 text-purple-600" />
                            Divertissement et culture
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {selectedRegion.specialties.entertainment}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Info className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              Aucune information disponible sur les spécialités
                              de cette région.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick navigation between regions */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 flex justify-between">
                <button
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center text-sm transition-colors"
                  onClick={() => {
                    const currentIndex = cameroonData.regions.findIndex(
                      (r) => r.id === selectedRegion.id
                    );
                    const prevIndex =
                      (currentIndex - 1 + cameroonData.regions.length) %
                      cameroonData.regions.length;
                    handleMarkerClick(cameroonData.regions[prevIndex]);
                  }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Région précédente
                </button>
                <button
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center text-sm transition-colors"
                  onClick={() => {
                    const currentIndex = cameroonData.regions.findIndex(
                      (r) => r.id === selectedRegion.id
                    );
                    const nextIndex =
                      (currentIndex + 1) % cameroonData.regions.length;
                    handleMarkerClick(cameroonData.regions[nextIndex]);
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

const getRegionPosition = (regionName: string): string => {
  const positions: Record<string, string> = {
    Adamaoua: "centre-nord",
    Centre: "centre",
    Est: "est",
    "Extrême-Nord": "extrême-nord",
    Littoral: "sud-ouest",
    Nord: "nord",
    "Nord-Ouest": "nord-ouest",
    Ouest: "ouest",
    Sud: "sud",
    "Sud-Ouest": "sud-ouest",
  };

  return positions[regionName] || "centre";
};

export default MapView;
