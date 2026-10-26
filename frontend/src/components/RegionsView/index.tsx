import React, { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  InformationCircleIcon,
  MapIcon,
  UserGroupIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { Star, Download, FileText } from "lucide-react";
import { useRegions } from "@/hooks/useRegions";
import { Region } from "@/services/regions.service";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import SourceBadge from "@/components/ui/SourceBadge";
import { useFavorites } from "@/lib/favorites";
import { exportToCsv } from "@/lib/export";
import { matchesQuery } from "@/lib/search";
import { openRegionsReport } from "@/lib/report";

interface RegionsViewProps {
  initialSearch?: string;
}

export default function RegionsView({ initialSearch = "" }: RegionsViewProps) {
  const { regions, loading, error, refetch } = useRegions();
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites("region");

  // Memoized filtered regions to improve performance
  const filteredRegions = useMemo(() => {
    return regions.filter(
      (region) =>
        matchesQuery(region.name, searchTerm) ||
        matchesQuery(region.capital, searchTerm) ||
        region.departments.some((d) => matchesQuery(d.name, searchTerm))
    );
  }, [regions, searchTerm]);

  const handleExport = () => {
    exportToCsv(
      "regions-cameroun",
      filteredRegions.map((r) => ({
        Nom: r.name,
        Capitale: r.capital,
        Population: r.population,
        "Superficie (km²)": r.area,
        Départements: r.departments.length,
      }))
    );
  };

  // Modal for region details
  const RegionDetailModal = ({
    region,
    onClose,
  }: {
    region: Region;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border">
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold">{region.name}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openRegionsReport([region.name])}
                className="hover:bg-white/20 rounded-full p-2 transition"
                title="Fiche région imprimable (PDF)"
                aria-label="Fiche région imprimable (PDF)"
              >
                <FileText className="w-5 h-5" />
              </button>
              <button
                onClick={() => toggleFavorite("region", region.name, region.name)}
                className="hover:bg-white/20 rounded-full p-2 transition"
                title="Ajouter aux favoris"
              >
                <Star
                  className={`w-5 h-5 ${
                    isFavorite("region", region.name) ? "fill-current" : ""
                  }`}
                />
              </button>
              <button
                onClick={onClose}
                className="hover:bg-white/20 rounded-full p-2 transition"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <MapIcon className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-foreground">
                  Détails sur la région
                </h3>
              </div>
              <div className="space-y-2 text-foreground">
                <p>
                  <strong>Capitale:</strong> {region.capital}
                </p>
                <p>
                  <strong>Superficie:</strong> {region.area.toLocaleString()}{" "}
                  km²
                </p>
                <p>
                  <strong>Départements:</strong> {region.departments.length}
                </p>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <UserGroupIcon className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-foreground">
                  Population
                </h3>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {region.population.toLocaleString()}
              </p>
              <div className="mt-2">
                <SourceBadge source="demographics" align="left" />
              </div>
            </div>
          </div>

          {region.tourist_sites && region.tourist_sites.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <MapIcon className="w-6 h-6 text-teal-500" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Sites touristiques
                  </h3>
                </div>
                <SourceBadge source="tourism" />
              </div>
              <div className="flex flex-wrap gap-2">
                {region.tourist_sites.map((site) => (
                  <span
                    key={site.id}
                    className="px-3 py-1 bg-muted text-foreground rounded-full text-sm"
                  >
                    {site.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {region.specialties?.gastronomy && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <InformationCircleIcon className="w-6 h-6 text-purple-500" />
                <h3 className="text-lg font-semibold text-foreground">
                  Gastronomie
                </h3>
              </div>
              <p className="text-muted-foreground">
                {region.specialties.gastronomy}
              </p>
            </div>
          )}

          {region.major_companies && region.major_companies.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Grandes Entreprises
                  </h3>
                </div>
                <SourceBadge source="economy" />
              </div>
              <div className="flex flex-wrap gap-2">
                {region.major_companies.map((company, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted text-foreground rounded-full text-sm"
                  >
                    {company.name} ({company.sector})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-muted-foreground">
            Chargement des régions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-red-500/10 p-8 rounded-lg">
          <p className="text-xl text-red-500 mb-4">Erreur de chargement</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header and Search */}
        <PageHeader
          title="Régions du Cameroun"
          subtitle={`${filteredRegions.length} région${
            filteredRegions.length !== 1 ? "s" : ""
          } référencée${filteredRegions.length !== 1 ? "s" : ""}`}
          icon={MapIcon}
          source="demographics"
          actions={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher une région..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium flex-shrink-0"
                title="Exporter en CSV"
              >
                <Download className="w-4 h-4" />
                <span>Exporter</span>
              </button>
            </div>
          }
        />

        {/* Regions Grid */}
        {filteredRegions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredRegions.map((region) => (
              <div
                key={region.id}
                className="bg-card rounded-xl shadow-sm border border-border overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-foreground">
                      {region.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          toggleFavorite("region", region.name, region.name)
                        }
                        className={`rounded-full p-2 transition ${
                          isFavorite("region", region.name)
                            ? "text-amber-500"
                            : "text-muted-foreground hover:text-amber-500"
                        }`}
                        title="Ajouter aux favoris"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            isFavorite("region", region.name)
                              ? "fill-current"
                              : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => setSelectedRegion(region)}
                        className="text-blue-500 hover:bg-blue-500/10 rounded-full p-2 transition"
                      >
                        <InformationCircleIcon className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Capital
                        </p>
                        <p className="text-lg text-foreground">
                          {region.capital}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-muted-foreground">
                            Population
                          </p>
                          <SourceBadge source="demographics" iconOnly />
                        </div>
                        <p className="text-lg font-semibold text-foreground">
                          {region.population.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {region.departments.slice(0, 3).map((dept, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-muted text-foreground text-xs rounded-full"
                        >
                          {dept.name}
                        </span>
                      ))}
                      {region.departments.length > 3 && (
                        <span className="px-2 py-1 bg-muted text-foreground text-xs rounded-full">
                          +{region.departments.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={MagnifyingGlassIcon}
            title={`Aucune région trouvée pour "${searchTerm}"`}
            description="Essayez un autre terme de recherche."
          />
        )}
      </div>

      {/* Region Details Modal */}
      {selectedRegion && (
        <RegionDetailModal
          region={selectedRegion}
          onClose={() => setSelectedRegion(null)}
        />
      )}
    </div>
  );
}
