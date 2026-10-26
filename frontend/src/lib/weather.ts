/**
 * Météo réelle via l'API publique Open-Meteo (https://open-meteo.com).
 * Gratuite, sans clé, appelable directement depuis le navigateur.
 * Licence des données : CC BY 4.0 — l'attribution doit rester affichée.
 *
 * Une seule requête par lot de coordonnées (Open-Meteo accepte des listes de
 * latitudes/longitudes) et un cache mémoire de 30 minutes par session.
 */

export const WEATHER_ATTRIBUTION = "Météo : Open-Meteo.com (CC BY 4.0)";

export interface WeatherForecastDay {
  day: string;
  condition: string;
  maxTemp: number;
  minTemp: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  /** Probabilité de précipitations maximale du jour, en % */
  precipitation: number;
  coordinates: [number, number];
  forecast: WeatherForecastDay[];
  /** Heure locale de l'observation renvoyée par l'API */
  observedAt: string;
}

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map<string, { at: number; data: WeatherData }>();

const DAYS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

/** Codes météo WMO → libellés utilisés par l'interface. */
export const weatherCodeToCondition = (code: number): string => {
  if (code === 0) return "Ensoleillé";
  if (code <= 2) return "Partiellement nuageux";
  if (code === 3 || code === 45 || code === 48) return "Nuageux";
  if (code >= 95) return "Orageux";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return "Neigeux";
  return "Pluvieux"; // bruine, pluie, averses (51–67, 80–82)
};

const cacheKey = ([lat, lon]: [number, number]) =>
  `${lat.toFixed(3)},${lon.toFixed(3)}`;

interface OpenMeteoResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
  };
}

const toWeatherData = (
  location: string,
  coordinates: [number, number],
  r: OpenMeteoResponse
): WeatherData => ({
  location,
  coordinates,
  observedAt: r.current.time,
  temperature: Math.round(r.current.temperature_2m),
  humidity: Math.round(r.current.relative_humidity_2m),
  windSpeed: Math.round(r.current.wind_speed_10m),
  condition: weatherCodeToCondition(r.current.weather_code),
  precipitation: r.daily.precipitation_probability_max[0] ?? 0,
  forecast: r.daily.time.map((date, i) => ({
    day: DAYS[new Date(`${date}T12:00:00`).getDay()],
    condition: weatherCodeToCondition(r.daily.weather_code[i]),
    maxTemp: Math.round(r.daily.temperature_2m_max[i]),
    minTemp: Math.round(r.daily.temperature_2m_min[i]),
  })),
});

/**
 * Récupère la météo actuelle + 3 jours pour plusieurs lieux en une requête.
 * Lève une erreur si l'API est injoignable : l'appelant affiche un message,
 * on ne fabrique jamais de valeurs de remplacement.
 */
export const fetchWeatherBatch = async (
  places: { name: string; coordinates: [number, number] }[],
  { force = false }: { force?: boolean } = {}
): Promise<Record<string, WeatherData>> => {
  const result: Record<string, WeatherData> = {};
  const now = Date.now();
  const missing = places.filter((p) => {
    const hit = cache.get(cacheKey(p.coordinates));
    if (!force && hit && now - hit.at < CACHE_TTL_MS) {
      result[p.name] = { ...hit.data, location: p.name };
      return false;
    }
    return true;
  });
  if (!missing.length) return result;

  const params = new URLSearchParams({
    latitude: missing.map((p) => p.coordinates[0]).join(","),
    longitude: missing.map((p) => p.coordinates[1]).join(","),
    current:
      "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "Africa/Douala",
    forecast_days: "3",
  });
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  );
  if (!response.ok) {
    throw new Error(`Service météo indisponible (HTTP ${response.status})`);
  }
  const json = (await response.json()) as
    | OpenMeteoResponse
    | OpenMeteoResponse[];
  // Une seule coordonnée → objet ; plusieurs → tableau
  const list = Array.isArray(json) ? json : [json];

  missing.forEach((place, i) => {
    if (!list[i]) return;
    const data = toWeatherData(place.name, place.coordinates, list[i]);
    cache.set(cacheKey(place.coordinates), { at: now, data });
    result[place.name] = data;
  });
  return result;
};
