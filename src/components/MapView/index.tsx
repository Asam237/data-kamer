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
} from "lucide-react";

// Types pour les données
interface Department {
  id: number;
  name: string;
  capital: string;
  population: number;
  area: number;
  departments: string[];
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
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
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <MapIcon className="mr-2 h-6 w-6" />
              Carte des Régions du Cameroun
            </h1>
            <div className="text-sm mt-1 text-blue-100">
              <span className="inline-flex items-center mr-3">
                <Users className="h-4 w-4 mr-1" />
                {cameroonData.overview.totalPopulation.toLocaleString()}{" "}
                habitants
              </span>
              <span className="inline-flex items-center mr-3">
                <MapIcon className="h-4 w-4 mr-1" />
                {cameroonData.overview.totalArea.toLocaleString()} km²
              </span>
              <span className="inline-flex items-center mr-3">
                <Home className="h-4 w-4 mr-1" />
                Capitale: {cameroonData.overview.capital}
              </span>
            </div>
          </div>

          <button
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md text-sm flex items-center transition-colors"
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
                <MapIcon className="h-5 w-5 mr-2 text-blue-600" />
                Régions ({cameroonData.regions.length})
              </h2>
              <div className="mt-2 text-sm text-gray-500">
                Cliquez sur une région pour voir ses détails
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
              <ul className="space-y-2">
                {cameroonData.regions.map((region) => (
                  <li
                    key={region.id}
                    className={`cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border ${
                      selectedRegion?.id === region.id
                        ? "border-blue-500 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
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
                      <div>
                        <div className="font-medium">{region.name}</div>
                        <div className="text-sm text-gray-500">
                          Capitale: {region.capital}
                        </div>
                      </div>
                    </div>

                    {selectedRegion?.id === region.id && (
                      <div className="bg-gray-50 p-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Population:</span>
                            <div className="font-medium">
                              {region.population.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Superficie:</span>
                            <div className="font-medium">
                              {region.area.toLocaleString()} km²
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">Départements:</span>
                          <div className="font-medium mt-1 text-xs">
                            {region.departments.join(", ")}
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Map container */}
        <div className="flex-1 relative">
          <Map
            height="100%"
            center={center}
            zoom={zoom}
            onBoundsChanged={({ center, zoom }) => {
              setCenter(center);
              setZoom(zoom);
            }}
            attribution={false}
          >
            {showRegions &&
              cameroonData.regions.map((region) => (
                <Marker
                  key={region.id}
                  width={selectedRegion?.id === region.id ? 50 : 40}
                  anchor={REGION_COORDINATES[region.name]}
                  onClick={() => handleMarkerClick(region)}
                  color={
                    selectedRegion?.id === region.id
                      ? "#ff0000"
                      : getRegionColor(region.id)
                  }
                />
              ))}

            {selectedRegion && (
              <Overlay
                anchor={REGION_COORDINATES[selectedRegion.name]}
                offset={[120, 30]}
              >
                <div className="bg-white p-4 rounded-lg shadow-lg w-72 border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-800 border-b pb-2 mb-2">
                    {selectedRegion.name}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Home className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">
                        Capitale: <strong>{selectedRegion.capital}</strong>
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">
                        Population:{" "}
                        <strong>
                          {selectedRegion.population.toLocaleString()}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapIcon className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-700">
                        Superficie:{" "}
                        <strong>
                          {selectedRegion.area.toLocaleString()} km²
                        </strong>
                      </span>
                    </div>
                    <div className="text-sm mt-2">
                      <div className="text-gray-700 font-medium mb-1">
                        Départements ({selectedRegion.departments.length}):
                      </div>
                      <div className="text-xs bg-gray-50 p-2 rounded border border-gray-200 max-h-24 overflow-y-auto">
                        {selectedRegion.departments.map((dept, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-medium text-gray-700 mr-1 mb-1"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
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
      </div>
    </div>
  );
};

export default MapView;
