import { apiClient } from "@/lib/api";

// Types pour les universités (basés sur votre modèle Django)
export interface University {
  id: number;
  name: string;
  region: number;
  founded?: number;
  type: "Public" | "Privé";
  students: number;
  website?: string;
  description?: string;
  main_image?: string;
  faculties: Faculty[];
  gallery_images: UniversityGallery[];
}

export interface Faculty {
  id: number;
  name: string;
  university: number;
}

export interface UniversityGallery {
  id: number;
  image: string;
  university: number;
}

/**
 * Service pour gérer les universités
 */
export class UniversitiesService {
  private static readonly BASE_ENDPOINT = "/universities";

  /**
   * Récupérer toutes les universités
   */
  static async getAllUniversities(): Promise<University[]> {
    try {
      return await apiClient.get<University[]>(`${this.BASE_ENDPOINT}/`);
    } catch (error) {
      console.error("Erreur lors de la récupération des universités:", error);
      throw error;
    }
  }

  /**
   * Récupérer une université par ID
   */
  static async getUniversityById(id: number): Promise<University> {
    try {
      return await apiClient.get<University>(`${this.BASE_ENDPOINT}/${id}/`);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'université ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Filtrer les universités par région
   */
  static async getUniversitiesByRegion(
    regionId: number
  ): Promise<University[]> {
    try {
      return await apiClient.get<University[]>(
        `${this.BASE_ENDPOINT}/?region=${regionId}`
      );
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des universités de la région ${regionId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Filtrer les universités par type
   */
  static async getUniversitiesByType(
    type: "Public" | "Privé"
  ): Promise<University[]> {
    try {
      return await apiClient.get<University[]>(
        `${this.BASE_ENDPOINT}/?type=${type}`
      );
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des universités ${type}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Rechercher des universités
   */
  static async searchUniversities(query: string): Promise<University[]> {
    try {
      return await apiClient.get<University[]>(
        `${this.BASE_ENDPOINT}/?search=${encodeURIComponent(query)}`
      );
    } catch (error) {
      console.error("Erreur lors de la recherche d'universités:", error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques des universités
   */
  static async getUniversitiesStats(): Promise<{
    totalUniversities: number;
    publicUniversities: number;
    privateUniversities: number;
    totalStudents: number;
    averageAge: number;
  }> {
    try {
      const universities = await this.getAllUniversities();

      const totalUniversities = universities.length;
      const publicUniversities = universities.filter(
        (uni) => uni.type === "Public"
      ).length;
      const privateUniversities = universities.filter(
        (uni) => uni.type === "Privé"
      ).length;
      const totalStudents = universities.reduce(
        (sum, uni) => sum + uni.students,
        0
      );

      const currentYear = new Date().getFullYear();
      const averageAge =
        universities.length > 0
          ? Math.round(
              universities.reduce(
                (sum, uni) =>
                  sum + (currentYear - (uni.founded || currentYear)),
                0
              ) / universities.length
            )
          : 0;

      return {
        totalUniversities,
        publicUniversities,
        privateUniversities,
        totalStudents,
        averageAge,
      };
    } catch (error) {
      console.error(
        "Erreur lors du calcul des statistiques des universités:",
        error
      );
      throw error;
    }
  }
}
