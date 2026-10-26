import { getLocalRegions } from "@/lib/cameroonAdapter";
import { matchesQuery } from "@/lib/search";

// Types pour les régions (basés sur votre modèle Django)
export interface Region {
  id: number;
  name: string;
  capital: string;
  population: number;
  area: number;
  main_image?: string;
  departments: Department[];
  major_companies: Company[];
  job_demands: JobDemand[];
  specialties?: Specialty;
  tourist_sites: TouristSite[];
}

export interface Department {
  id: number;
  name: string;
  region: number;
}

export interface Company {
  id: number;
  name: string;
  sector: string;
  region: number;
}

export interface JobDemand {
  id: number;
  name: string;
  region: number;
}

export interface Specialty {
  id: number;
  gastronomy?: string;
  professions?: string;
  entertainment?: string;
  region: number;
}

export interface TouristSite {
  id: number;
  name: string;
  description: string;
  location?: string;
  image?: string;
  region: number;
}

/**
 * Service pour gérer les régions.
 * Source de données : le fichier JSON embarqué (data/cameroon.json),
 * exposé de façon synchrone via l'adaptateur local.
 */
export class RegionsService {
  /**
   * Récupérer toutes les régions
   */
  static async getAllRegions(): Promise<Region[]> {
    return getLocalRegions();
  }

  /**
   * Récupérer une région par ID
   */
  static async getRegionById(id: number): Promise<Region> {
    const region = getLocalRegions().find((r) => r.id === id);
    if (!region) {
      throw new Error(`Région introuvable pour l'identifiant ${id}`);
    }
    return region;
  }

  /**
   * Rechercher des régions par nom
   */
  static async searchRegions(query: string): Promise<Region[]> {
    return getLocalRegions().filter(
      (region) =>
        matchesQuery(region.name, query) || matchesQuery(region.capital, query)
    );
  }

  /**
   * Récupérer les statistiques des régions
   */
  static async getRegionsStats(): Promise<{
    totalRegions: number;
    totalPopulation: number;
    totalArea: number;
    averageDensity: number;
  }> {
    const regions = getLocalRegions();

    const totalRegions = regions.length;
    const totalPopulation = regions.reduce(
      (sum, region) => sum + region.population,
      0
    );
    const totalArea = regions.reduce((sum, region) => sum + region.area, 0);
    const averageDensity = Math.round(totalPopulation / totalArea);

    return {
      totalRegions,
      totalPopulation,
      totalArea,
      averageDensity,
    };
  }
}
