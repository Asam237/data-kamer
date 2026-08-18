import { getLocalUniversities } from "@/lib/cameroonAdapter";

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
 * Service pour gérer les universités.
 * Source de données : le fichier JSON embarqué (data/cameroon.json),
 * exposé de façon synchrone via l'adaptateur local.
 */
export class UniversitiesService {
  /**
   * Récupérer toutes les universités
   */
  static async getAllUniversities(): Promise<University[]> {
    return getLocalUniversities();
  }

  /**
   * Récupérer une université par ID
   */
  static async getUniversityById(id: number): Promise<University> {
    const university = getLocalUniversities().find((u) => u.id === id);
    if (!university) {
      throw new Error(`Université introuvable pour l'identifiant ${id}`);
    }
    return university;
  }

  /**
   * Filtrer les universités par région
   */
  static async getUniversitiesByRegion(
    regionId: number
  ): Promise<University[]> {
    return getLocalUniversities().filter((u) => u.region === regionId);
  }

  /**
   * Filtrer les universités par type
   */
  static async getUniversitiesByType(
    type: "Public" | "Privé"
  ): Promise<University[]> {
    return getLocalUniversities().filter((u) => u.type === type);
  }

  /**
   * Rechercher des universités
   */
  static async searchUniversities(query: string): Promise<University[]> {
    const q = query.trim().toLowerCase();
    if (!q) return getLocalUniversities();
    return getLocalUniversities().filter((u) =>
      u.name.toLowerCase().includes(q)
    );
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
    const universities = getLocalUniversities();

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
              (sum, uni) => sum + (currentYear - (uni.founded || currentYear)),
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
  }
}
