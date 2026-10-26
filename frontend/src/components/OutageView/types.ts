export interface OutageInfo {
  observations: string;
  prog_date: string;
  prog_heure_debut: string;
  prog_heure_fin: string;
  quartier: string;
  region: string;
  ville: string;
}

export interface OutageResponse {
  status: number;
  data: OutageInfo[];
}

export interface RegionOutage {
  regionCode: string;
  regionName: string;
  outages: OutageResponse;
  error?: string;
}

export interface BoundsChanged {
  center: [number, number];
  zoom: number;
}

export interface OutageMatch {
  region: RegionOutage;
  outage: OutageInfo;
}
