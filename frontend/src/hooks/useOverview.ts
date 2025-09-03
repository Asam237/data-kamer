import { useState, useEffect } from 'react';
import { OverviewService, Overview } from '@/services/overview.service';
import { ApiError } from '@/lib/api';

interface UseOverviewState {
  overview: Overview | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook personnalisé pour gérer les données d'aperçu
 */
export const useOverview = (): UseOverviewState => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await OverviewService.getOverview();
      setOverview(data);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Erreur lors du chargement des données d\'aperçu';
      setError(errorMessage);
      console.error('Erreur dans useOverview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return {
    overview,
    loading,
    error,
    refetch: fetchOverview,
  };
};