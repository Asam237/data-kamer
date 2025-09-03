import { RegionsService } from './regions.service';
import { UniversitiesService } from './universities.service';

// Type pour l'aperçu général
export interface Overview {
  totalPopulation: number;
  totalArea: number;
  totalRegions: number;
  totalDepartments: number;
  totalUniversities: number;
  totalStudents: number;
  capital: string;
  officialLanguages: string[];
  currency: string;
  averageDensity: number;
  averageUniversityAge: number;
}

/**
 * Service pour gérer les données d'aperçu général
 */
export class OverviewService {
  /**
   * Récupérer toutes les données d'aperçu
   */
  static async getOverview(): Promise<Overview> {
    try {
      // Récupérer les données des régions et universités en parallèle
      const [regionsStats, universitiesStats, regions] = await Promise.all([
        RegionsService.getRegionsStats(),
        UniversitiesService.getUniversitiesStats(),
        RegionsService.getAllRegions(),
      ]);

      // Calculer le nombre total de départements
      const totalDepartments = regions.reduce((sum, region) => sum + region.departments.length, 0);

      return {
        totalPopulation: regionsStats.totalPopulation,
        totalArea: regionsStats.totalArea,
        totalRegions: regionsStats.totalRegions,
        totalDepartments,
        totalUniversities: universitiesStats.totalUniversities,
        totalStudents: universitiesStats.totalStudents,
        capital: 'Yaoundé',
        officialLanguages: ['Français', 'Anglais'],
        currency: 'Franc CFA',
        averageDensity: regionsStats.averageDensity,
        averageUniversityAge: universitiesStats.averageAge,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'aperçu:', error);
      throw error;
    }
  }
}