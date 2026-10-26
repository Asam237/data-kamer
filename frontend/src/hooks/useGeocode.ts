import { useCallback, useState } from "react";
import axios, { AxiosError } from "axios";

type Coordinates = [number, number];

// Cache mémoire partagé entre tous les composants: une même ville/quartier
// n'est géocodée qu'une seule fois via Nominatim (mêmes patron que le memo
// getLocalRegions/getLocalUniversities de src/lib/cameroonAdapter.ts).
const geocodeCache = new Map<string, Coordinates | null>();

interface UseGeocodeState {
  geocodeLocation: (
    location: string,
    city: string
  ) => Promise<Coordinates | null>;
  isGeocoding: boolean;
}

/**
 * Géocode un lieu (ville/quartier, Cameroun) via l'API Nominatim, avec cache.
 */
export const useGeocode = (): UseGeocodeState => {
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  const geocodeLocation = useCallback(
    async (location: string, city: string): Promise<Coordinates | null> => {
      const cacheKey = `${location}|${city}`;
      if (geocodeCache.has(cacheKey)) {
        return geocodeCache.get(cacheKey) ?? null;
      }

      const query = `${location}, ${city}, Cameroun`;
      setIsGeocoding(true);
      try {
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: query,
              format: "json",
              limit: 1,
              country: "Cameroon",
            },
          }
        );

        let coords: Coordinates | null = null;
        if (response.data && response.data.length > 0) {
          coords = [
            parseFloat(response.data[0].lat),
            parseFloat(response.data[0].lon),
          ];
        }

        geocodeCache.set(cacheKey, coords);
        return coords;
      } catch (error) {
        console.error(
          `Erreur de géocodage pour ${query}:`,
          error as AxiosError
        );
        return null;
      } finally {
        setIsGeocoding(false);
      }
    },
    []
  );

  return { geocodeLocation, isGeocoding };
};
