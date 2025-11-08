import { useState, useEffect } from "react";
import { RegionsService, Region } from "@/services/regions.service";
import { ApiError } from "@/lib/api";

interface UseRegionsState {
  regions: Region[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRegions = (): UseRegionsState => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RegionsService.getAllRegions();
      setRegions(data);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Erreur lors du chargement des régions";
      setError(errorMessage);
      console.error("Erreur dans useRegions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  return {
    regions,
    loading,
    error,
    refetch: fetchRegions,
  };
};

/**
 * Hook pour récupérer une région spécifique
 */
export const useRegion = (id: number) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegion = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await RegionsService.getRegionById(id);
        setRegion(data);
      } catch (err) {
        const errorMessage =
          err instanceof ApiError
            ? err.message
            : "Erreur lors du chargement de la région";
        setError(errorMessage);
        console.error("Erreur dans useRegion:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRegion();
    }
  }, [id]);

  return { region, loading, error };
};
