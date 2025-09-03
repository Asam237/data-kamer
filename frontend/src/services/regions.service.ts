import { apiClient, ApiError } from '@/lib/api';

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
 * Service pour gérer les régions
 */
export class RegionsService {
  private static readonly BASE_ENDPOINT = '/regions';

  /**
   * Récupérer toutes les régions
   */
  static async getAllRegions(): Promise<Region[]> {
    try {
      return await apiClient.get<Region[]>(`${this.BASE_ENDPOINT}/`);
    } catch (error) {
      console.error('Erreur lors de la récupération des régions:', error);
      throw error;
    }
  }

  /**
   * Récupérer une région par ID
   */
  static async getRegionById(id: number): Promise<Region> {
    try {
      return await apiClient.get<Region>(`${this.BASE_ENDPOINT}/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la récupération de la région ${id}:`, error);
      throw error;
    }
  }

  /**
   * Rechercher des régions par nom
   */
  static async searchRegions(query: string): Promise<Region[]> {
    try {
      return await apiClient.get<Region[]>(`${this.BASE_ENDPOINT}/?search=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error('Erreur lors de la recherche de régions:', error);
      throw error;
    }
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
    try {
      const regions = await this.getAllRegions();
      
      const totalRegions = regions.length;
      const totalPopulation = regions.reduce((sum, region) => sum + region.population, 0);
      const totalArea = regions.reduce((sum, region) => sum + region.area, 0);
      const averageDensity = Math.round(totalPopulation / totalArea);

      return {
        totalRegions,
        totalPopulation,
        totalArea,
        averageDensity,
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques des régions:', error);
      throw error;
    }
  }
}