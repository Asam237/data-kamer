import { useState, useEffect, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  FunnelIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { University } from "../../../types";

interface UniversitiesViewProps {}

interface FilterState {
  region: string;
  foundedAfter: number;
  type: string;
}

const UniversitiesView: React.FC<UniversitiesViewProps> = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<
    University[]
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    region: "",
    foundedAfter: 0,
    type: "",
  });

  // Fetch universities data
  useEffect(() => {
    fetchUniversities();
  }, []);

  // Apply filters and search
  useEffect(() => {
    applyFiltersAndSearch();
  }, [universities, searchTerm, filters]);

  const fetchUniversities = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/universities");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des universités");
      }

      const data: University[] = await response.json();
      setUniversities(data);
      setFilteredUniversities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      console.error("Erreur lors du chargement des universités:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = (): void => {
    let filtered = universities.filter((university) => {
      const matchesSearch =
        university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        university.region.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegion =
        !filters.region || university.region === filters.region;
      const matchesFoundedAfter =
        !filters.foundedAfter || university.founded >= filters.foundedAfter;
      const matchesType = !filters.type || university.type === filters.type;

      return (
        matchesSearch && matchesRegion && matchesFoundedAfter && matchesType
      );
    });

    setFilteredUniversities(filtered);
  };

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | number
  ): void => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = (): void => {
    setFilters({
      region: "",
      foundedAfter: 0,
      type: "",
    });
    setSearchTerm("");
  };

  const uniqueRegions = useMemo(() => {
    return Array.from(new Set(universities.map((uni) => uni.region))).sort();
  }, [universities]);

  const stats = useMemo(() => {
    return {
      total: universities.length,
      public: universities.filter((uni) => uni.type === "Public").length,
      private: universities.filter((uni) => uni.type === "Privé").length,
      averageAge:
        universities.length > 0
          ? Math.round(
              new Date().getFullYear() -
                universities.reduce((sum, uni) => sum + uni.founded, 0) /
                  universities.length
            )
          : 0,
    };
  }, [universities]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <span className="ml-3 text-gray-600">
          Chargement des universités...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Erreur : {error}</p>
        <button
          onClick={fetchUniversities}
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Universités du Cameroun
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? "bg-primary-100 text-primary-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filtres
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <BuildingLibraryIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <UsersIcon className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Publiques</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats.public}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <BuildingLibraryIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Privées</p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.private}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <CalendarIcon className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Âge moyen</p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats.averageAge} ans
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une université ou une région..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Région
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange("region", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Toutes les régions</option>
                {uniqueRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fondée après
              </label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="Année"
                value={filters.foundedAfter || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "foundedAfter",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                <option value="Public">Public</option>
                <option value="Privé">Privé</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Effacer les filtres
            </button>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {filteredUniversities.length} université
          {filteredUniversities.length !== 1 ? "s" : ""} trouvée
          {filteredUniversities.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Universities grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUniversities.map((university) => (
          <UniversityCard
            key={university.id}
            university={university}
            onViewDetails={setSelectedUniversity}
          />
        ))}
      </div>

      {/* No results */}
      {filteredUniversities.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <BuildingLibraryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucune université trouvée</p>
          <p className="text-gray-400 text-sm mt-2">
            Essayez de modifier vos critères de recherche ou vos filtres
          </p>
        </div>
      )}

      {/* University details modal */}
      {selectedUniversity && (
        <UniversityModal
          university={selectedUniversity}
          onClose={() => setSelectedUniversity(null)}
        />
      )}
    </div>
  );
};

// University Card Component
interface UniversityCardProps {
  university: University;
  onViewDetails: (university: University) => void;
}

const UniversityCard: React.FC<UniversityCardProps> = ({
  university,
  onViewDetails,
}) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - university.founded;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {university.name}
          </h3>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPinIcon className="w-4 h-4 mr-1" />
            {university.region}
          </div>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            university.type === "Public"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {university.type || "Public"}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>
            Fondée en {university.founded} ({age} ans)
          </span>
        </div>

        {university.students && (
          <div className="flex items-center text-sm text-gray-600">
            <UsersIcon className="w-4 h-4 mr-2" />
            <span>{university.students.toLocaleString()} étudiants</span>
          </div>
        )}

        {university.faculties && university.faculties.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Facultés ({university.faculties.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {university.faculties.slice(0, 2).map((faculty, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                >
                  {faculty}
                </span>
              ))}
              {university.faculties.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  +{university.faculties.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => onViewDetails(university)}
          className="w-full flex items-center justify-center px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <EyeIcon className="w-4 h-4 mr-2" />
          Voir les détails
        </button>
      </div>
    </div>
  );
};

// University Modal Component
interface UniversityModalProps {
  university: University;
  onClose: () => void;
}

const UniversityModal: React.FC<UniversityModalProps> = ({
  university,
  onClose,
}) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - university.founded;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {university.name}
              </h2>
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="w-5 h-5 mr-2" />
                <span className="text-lg">{university.region}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Type</p>
                <p className="text-lg text-gray-900">
                  {university.type || "Public"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Année de fondation
                </p>
                <p className="text-lg text-gray-900">
                  {university.founded} ({age} ans)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {university.students && (
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Nombre d&apos;étudiants
                  </p>
                  <p className="text-lg text-gray-900">
                    {university.students.toLocaleString()}
                  </p>
                </div>
              )}
              {university.website && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Site web</p>
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-primary-600 hover:text-primary-700 underline"
                  >
                    {university.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {university.description && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Description
              </p>
              <p className="text-gray-700 leading-relaxed">
                {university.description}
              </p>
            </div>
          )}

          {university.faculties && university.faculties.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">
                Facultés et Écoles ({university.faculties.length})
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {university.faculties.map((faculty, index) => (
                  <div key={index} className="px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{faculty}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversitiesView;
