import { useCallback, useEffect, useState } from "react";

interface UseUserLocationState {
  userLocation: [number, number] | null;
  locationError: string | null;
  locationPrompted: boolean;
  requestUserLocation: () => void;
  clearLocationError: () => void;
}

interface UseUserLocationOptions {
  onLocated?: (position: [number, number]) => void;
}

/**
 * Demande et suit la position de l'utilisateur via l'API de géolocalisation
 * du navigateur. La demande initiale est déclenchée une seule fois au montage.
 */
export const useUserLocation = (
  options: UseUserLocationOptions = {}
): UseUserLocationState => {
  const { onLocated } = options;
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPrompted, setLocationPrompted] = useState<boolean>(false);

  const requestUserLocation = useCallback((): void => {
    if ("geolocation" in navigator) {
      setLocationPrompted(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(coords);
          setLocationError(null);
          onLocated?.(coords);
        },
        (err) => {
          console.error("Erreur de géolocalisation:", err.message);
          let errorMessage = "Accès à la localisation refusé ou impossible.";
          if (err.code === err.PERMISSION_DENIED) {
            errorMessage =
              "Veuillez activer la localisation dans les réglages de votre navigateur.";
          }
          setLocationError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationError(
        "La géolocalisation n'est pas supportée par votre navigateur."
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Demande de localisation une seule fois au montage.
  useEffect(() => {
    requestUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearLocationError = useCallback(() => setLocationError(null), []);

  return {
    userLocation,
    locationError,
    locationPrompted,
    requestUserLocation,
    clearLocationError,
  };
};
