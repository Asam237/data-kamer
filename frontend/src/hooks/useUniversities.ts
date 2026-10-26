import { useState, useEffect, useCallback } from "react";
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

  const region = filters?.region;
  const type = filters?.type;
  const search = filters?.search;

  const fetchUniversities = useCallback(async () => {
    try {
      // Pas de remise à true de `loading` ici : seul le premier chargement
      // affiche l'état de chargement, sinon la vue (et son champ de
      // recherche) serait démontée à chaque frappe.
      setError(null);

      // Les filtres se cumulent (recherche + région + type)
      let data: University[] = search
        ? await UniversitiesService.searchUniversities(search)
        : await UniversitiesService.getAllUniversities();
      if (region) data = data.filter((u) => u.region === region);
      if (type) data = data.filter((u) => u.type === type);

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
  }, [region, type, search]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

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
