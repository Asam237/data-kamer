import { useState, useEffect } from "react";
import {
  UniversitiesService,
  University,
} from "@/services/universities.service";
import { ApiError } from "@/lib/api";

interface UseUniversitiesState {
  universities: University[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseUniversitiesFilters {
  region?: number;
  type?: "Public" | "Privé";
  search?: string;
}

/**
 * Hook personnalisé pour gérer les universités
 */
export const useUniversities = (
  filters?: UseUniversitiesFilters
): UseUniversitiesState => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: University[];

      if (filters?.search) {
        data = await UniversitiesService.searchUniversities(filters.search);
      } else if (filters?.region) {
        data = await UniversitiesService.getUniversitiesByRegion(
          filters.region
        );
      } else if (filters?.type) {
        data = await UniversitiesService.getUniversitiesByType(filters.type);
      } else {
        data = await UniversitiesService.getAllUniversities();
      }

      setUniversities(data);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Erreur lors du chargement des universités";
      setError(errorMessage);
      console.error("Erreur dans useUniversities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, [filters?.region, filters?.type, filters?.search]);

  return {
    universities,
    loading,
    error,
    refetch: fetchUniversities,
  };
};

/**
 * Hook pour récupérer une université spécifique
 */
export const useUniversity = (id: number) => {
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await UniversitiesService.getUniversityById(id);
        setUniversity(data);
      } catch (err) {
        const errorMessage =
          err instanceof ApiError
            ? err.message
            : "Erreur lors du chargement de l'université";
        setError(errorMessage);
        console.error("Erreur dans useUniversity:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUniversity();
    }
  }, [id]);

  return { university, loading, error };
};
