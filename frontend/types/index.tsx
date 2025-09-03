export interface Region {
  id: number;
  name: string;
  capital: string;
  population: number;
  area: number;
  departments: string[];
}

export interface University {
  id: number;
  name: string;
  region: string;
  founded: number;
  type?: string;
  students?: number;
  faculties?: string[];
  website?: string;
  description?: string;
}

export interface Overview {
  totalPopulation: number;
  totalArea: number;
  totalRegions: number;
  totalDepartments: number;
  totalUniversities: number;
  capital: string;
  officialLanguages: string[];
  currency: string;
}

export interface CameroonData {
  regions: Region[];
  universities: University[];
  overview: Overview;
}

export interface ExtendedOverview extends Overview {
  totalCommunes: number;
  totalVillages: number;
  totalStudents?: number;
  averageUniversityAge?: number;
}
