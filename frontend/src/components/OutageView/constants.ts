import { OutageInfo, OutageResponse } from "./types";

export const CAMEROON_CENTER: [number, number] = [5.5, 12.5];
export const INITIAL_ZOOM: number = 6;

export const REGION_COORDINATES: Record<string, [number, number]> = {
  CENTRE: [3.8667, 11.5167],
  LITTORAL: [4.05, 9.7],
  OUEST: [5.4667, 10.4167],
  "SUD-OUEST": [4.1667, 9.2333],
  "NORD-OUEST": [6.0, 10.1667],
  SUD: [2.9333, 11.1333],
  EST: [4.4333, 13.6833],
  ADAMAOUA: [7.3233, 13.5837],
  NORD: [9.3, 13.4],
  "EXTRÊME-NORD": [10.5833, 14.3333],
};

export const REGION_MAPPING: Record<string, string> = {
  "X-1": "CENTRE",
  "X-2": "LITTORAL",
  "X-3": "OUEST",
  "X-4": "SUD-OUEST",
  "X-5": "NORD-OUEST",
  "X-6": "SUD",
  "X-7": "EST",
  "X-8": "ADAMAOUA",
  "X-9": "NORD",
  "X-10": "EXTRÊME-NORD",
};

export const getRegionColor = (outages: OutageResponse): string => {
  if (!outages.data || outages.data.length === 0) return "#2ecc71";
  if (outages.data.length < 3) return "#f39c12";
  return "#e74c3c";
};

export const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

// Identifiant stable d'une coupure au sein d'une région, utilisé pour cibler
// l'élément en cours de géocodage (affichage d'un spinner sur la bonne ligne).
export const getOutageKey = (regionCode: string, outage: OutageInfo): string =>
  `${regionCode}-${outage.ville}-${outage.quartier}-${outage.prog_date}-${outage.prog_heure_debut}`;
