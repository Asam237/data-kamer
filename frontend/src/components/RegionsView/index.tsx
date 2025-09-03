import React, { useState, useEffect, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  InformationCircleIcon,
  MapIcon,
  UserGroupIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

// Enhanced Region type with more detailed information
type Region = {
  id: number | string;
  name: string;
  capital: string;
  population: number;
  area: number;
  departments: string[];
  description?: string;
  economicActivities?: string[];
};

export default function RegionsView() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await fetch("/api/regions");
      const data: Region[] = await response.json();
      setRegions(data);
    } catch (error) {
      console.error("Error loading regions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered regions to improve performance
  const filteredRegions = useMemo(() => {
    return regions.filter(
      (region) =>
        region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        region.capital.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [regions, searchTerm]);

  // Modal for region details
  const RegionDetailModal = ({
    region,
    onClose,
  }: {
    region: Region;
    onClose: () => void;
  }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{region.name}</h2>
            <button
              onClick={onClose}
              className="hover:bg-white/20 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <MapIcon className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold">Détails sur la région</h3>
              </div>
              <div className="space-y-2">
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
                <h3 className="text-lg font-semibold">Population</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {region.population.toLocaleString()}
              </p>
            </div>
          </div>

          {region.description && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <InformationCircleIcon className="w-6 h-6 text-purple-500" />
                <h3 className="text-lg font-semibold">Description</h3>
              </div>
              <p className="text-gray-600">{region.description}</p>
            </div>
          )}

          {region.economicActivities && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <DocumentIcon className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-semibold">Economic Activities</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {region.economicActivities.map((activity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {activity}
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading Regions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Regions du Cameroun
          </h1>
          <div className="relative w-full md:w-auto">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une région..."
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Regions Grid */}
        {filteredRegions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegions.map((region) => (
              <div
                key={region.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {region.name}
                    </h3>
                    <button
                      onClick={() => setSelectedRegion(region)}
                      className="text-blue-500 hover:bg-blue-50 rounded-full p-2 transition"
                    >
                      <InformationCircleIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Capital
                        </p>
                        <p className="text-lg text-gray-900">
                          {region.capital}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Population
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {region.population.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {region.departments.slice(0, 3).map((dept, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {dept}
                        </span>
                      ))}
                      {region.departments.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
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
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-500 text-xl">
              No regions found for &quot;{searchTerm}&quot;
            </p>
          </div>
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
