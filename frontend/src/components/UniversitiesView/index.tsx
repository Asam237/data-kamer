import { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  FunnelIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Star, Download } from "lucide-react";
import { useUniversities } from "@/hooks/useUniversities";
import { useRegions } from "@/hooks/useRegions";
import { University } from "@/services/universities.service";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useFavorites } from "@/lib/favorites";
import { exportToCsv } from "@/lib/export";

interface UniversitiesViewProps {
  initialSearch?: string;
}

interface FilterState {
  region: number | undefined;
  foundedAfter: number;
  type: "Public" | "Privé" | undefined;
}

const UniversitiesView: React.FC<UniversitiesViewProps> = ({
  initialSearch = "",
}) => {
  const { regions } = useRegions();
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    region: undefined,
    foundedAfter: 0,
    type: undefined,
  });
  const { isFavorite, toggleFavorite } = useFavorites("university");

  // Use the hook with filters
  const { universities, loading, error, refetch } = useUniversities({
    region: filters.region,
    type: filters.type,
    search: searchTerm,
  });

  const handleFilterChange = (
    key: keyof FilterState,
    value: string | number | undefined
  ): void => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = (): void => {
    setFilters({
      region: undefined,
      foundedAfter: 0,
      type: undefined,
    });
    setSearchTerm("");
  };

  // Filter universities based on search and founded after
  const filteredUniversities = useMemo(() => {
    return universities.filter((university) => {
      const matchesSearch =
        !searchTerm ||
        university.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFoundedAfter =
        !filters.foundedAfter ||
        (university.founded && university.founded >= filters.foundedAfter);

      return matchesSearch && matchesFoundedAfter;
    });
  }, [universities, searchTerm, filters.foundedAfter]);

  const stats = useMemo(() => {
    const total = filteredUniversities.length;
    const publicCount = filteredUniversities.filter(
      (uni) => uni.type === "Public"
    ).length;
    const privateCount = filteredUniversities.filter(
      (uni) => uni.type === "Privé"
    ).length;

    const universitiesWithFoundedDate = filteredUniversities.filter(
      (uni) => uni.founded
    );
    const averageAge =
      universitiesWithFoundedDate.length > 0
        ? Math.round(
            new Date().getFullYear() -
              universitiesWithFoundedDate.reduce(
                (sum, uni) => sum + (uni.founded || 0),
                0
              ) /
                universitiesWithFoundedDate.length
          )
        : 0;

    return {
      total,
      public: publicCount,
      private: privateCount,
      averageAge,
    };
  }, [filteredUniversities]);

  const handleExport = () => {
    exportToCsv(
      "universites-cameroun",
      filteredUniversities.map((u) => ({
        Nom: u.name,
        Type: u.type,
        Fondée: u.founded ?? "",
        Étudiants: u.students,
        Région:
          regions.find((r) => r.id === u.region)?.name || "Région inconnue",
      }))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-muted-foreground">
          Chargement des universités...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 m-8">
        <p className="text-red-500">Erreur : {error}</p>
        <button
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header with stats */}
      <div className="bg-card rounded-xl shadow-sm p-4 sm:p-6 border border-border">
        <PageHeader
          title="Universités du Cameroun"
          icon={BuildingLibraryIcon}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  showFilters
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filtres
              </button>
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </button>
            </div>
          }
        />

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
          <div className="bg-blue-500/10 rounded-lg p-4">
            <div className="flex items-center">
              <BuildingLibraryIcon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Total
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-4">
            <div className="flex items-center">
              <UsersIcon className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Publiques
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {stats.public}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-4">
            <div className="flex items-center">
              <BuildingLibraryIcon className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Privées
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {stats.private}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-500/10 rounded-lg p-4">
            <div className="flex items-center">
              <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Âge moyen
                </p>
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  {stats.averageAge} ans
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une université ou une région..."
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-card rounded-xl shadow-sm p-4 sm:p-6 border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Région
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange("region", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les régions</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
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
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Effacer les filtres
            </button>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {filteredUniversities.length} université
          {filteredUniversities.length !== 1 ? "s" : ""} trouvée
          {filteredUniversities.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Universities grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredUniversities.map((university) => (
          <UniversityCard
            key={university.id}
            university={university}
            regions={regions}
            onViewDetails={setSelectedUniversity}
            isFavorite={isFavorite("university", university.name)}
            onToggleFavorite={() =>
              toggleFavorite("university", university.name, university.name)
            }
          />
        ))}
      </div>

      {/* No results */}
      {filteredUniversities.length === 0 && (
        <EmptyState
          icon={BuildingLibraryIcon}
          title="Aucune université trouvée"
          description="Essayez de modifier vos critères de recherche ou vos filtres."
        />
      )}

      {/* University details modal */}
      {selectedUniversity && (
        <UniversityModal
          university={selectedUniversity}
          regions={regions}
          onClose={() => setSelectedUniversity(null)}
        />
      )}
    </div>
  );
};

// University Card Component
interface UniversityCardProps {
  university: University;
  regions: any[];
  onViewDetails: (university: University) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const UniversityCard: React.FC<UniversityCardProps> = ({
  university,
  regions,
  onViewDetails,
  isFavorite,
  onToggleFavorite,
}) => {
  const currentYear = new Date().getFullYear();
  const age = university.founded ? currentYear - university.founded : 0;
  const regionName =
    regions.find((r) => r.id === university.region)?.name || "Région inconnue";

  return (
    <div className="bg-card rounded-xl shadow-sm p-6 border border-border hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {university.name}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPinIcon className="w-4 h-4 mr-1" />
            {regionName}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onToggleFavorite}
            className={`p-1.5 rounded-full transition ${
              isFavorite
                ? "text-amber-500"
                : "text-muted-foreground hover:text-amber-500"
            }`}
            title="Ajouter aux favoris"
          >
            <Star className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              university.type === "Public"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
            }`}
          >
            {university.type}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {university.founded && (
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="w-4 h-4 mr-2" />
            <span>
              Fondée en {university.founded} ({age} ans)
            </span>
          </div>
        )}

        {university.students > 0 && (
          <div className="flex items-center text-sm text-muted-foreground">
            <UsersIcon className="w-4 h-4 mr-2" />
            <span>{university.students.toLocaleString()} étudiants</span>
          </div>
        )}

        {university.faculties && university.faculties.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Facultés ({university.faculties.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {university.faculties.slice(0, 2).map((faculty, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-muted text-foreground text-xs rounded"
                >
                  {faculty.name}
                </span>
              ))}
              {university.faculties.length > 2 && (
                <span className="px-2 py-1 bg-muted text-foreground text-xs rounded">
                  +{university.faculties.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <button
          onClick={() => onViewDetails(university)}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
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
  regions: any[];
  onClose: () => void;
}

const UniversityModal: React.FC<UniversityModalProps> = ({
  university,
  regions,
  onClose,
}) => {
  const currentYear = new Date().getFullYear();
  const age = university.founded ? currentYear - university.founded : 0;
  const regionName =
    regions.find((r) => r.id === university.region)?.name || "Région inconnue";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start gap-3 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 break-words">
                {university.name}
              </h2>
              <div className="flex items-center text-muted-foreground">
                <MapPinIcon className="w-5 h-5 mr-2" />
                <span className="text-lg">{regionName}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-foreground"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Type
                </p>
                <p className="text-lg text-foreground">{university.type}</p>
              </div>
              {university.founded && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Année de fondation
                  </p>
                  <p className="text-lg text-foreground">
                    {university.founded} ({age} ans)
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {university.students > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nombre d&apos;étudiants
                  </p>
                  <p className="text-lg text-foreground">
                    {university.students.toLocaleString()}
                  </p>
                </div>
              )}
              {university.website && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Site web
                  </p>
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-blue-500 hover:text-blue-600 underline break-all"
                  >
                    {university.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {university.description && (
            <div className="mb-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </p>
              <p className="text-foreground leading-relaxed">
                {university.description}
              </p>
            </div>
          )}

          {university.faculties && university.faculties.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Facultés et Écoles ({university.faculties.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {university.faculties.map((faculty, index) => (
                  <div key={index} className="px-3 py-2 bg-muted rounded-lg">
                    <span className="text-sm text-foreground">
                      {faculty.name}
                    </span>
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
