import { useEffect, useState } from "react";
import { RegionOutage } from "@/components/OutageView/types";

interface UseEneoOutagesState {
  outageData: RegionOutage[];
  loading: boolean;
  error: string | null;
}

/**
 * Charge les coupures ENEO pour toutes les régions via /api/outages.
 */
export const useEneoOutages = (): UseEneoOutagesState => {
  const [outageData, setOutageData] = useState<RegionOutage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllOutages = async (): Promise<void> => {
      setLoading(true);
      try {
        const response = await fetch("/api/outages");
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const rawData = await response.json();

        const transformedData: RegionOutage[] = rawData.map((region: any) => {
          if (
            region.outages &&
            typeof region.outages === "object" &&
            "status" in region.outages &&
            "data" in region.outages
          ) {
            return region;
          }

          return {
            regionCode: region.regionCode,
            regionName: region.regionName,
            outages: {
              status: 1,
              data: Array.isArray(region.outages) ? region.outages : [],
            },
            error: region.error,
          };
        });

        setOutageData(transformedData);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError(
          `Erreur lors du chargement des données: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllOutages();
  }, []);

  return { outageData, loading, error };
};
