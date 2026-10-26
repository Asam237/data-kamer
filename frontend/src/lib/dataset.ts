/**
 * Point d'accès unique au jeu de données embarqué (data/cameroon.json).
 *
 * Les composants ne doivent pas importer le JSON directement : ils passent par
 * ce module (ou par les services/hooks construits dessus). Le jour où les
 * données viendront d'une API, seul ce module devra changer.
 *
 * Tous les calculs dérivés (densité, nombre d'universités par région, ...)
 * sont faits une seule fois puis mis en cache : le JSON est statique.
 */
import rawData from "../../data/cameroon.json";
import { normalizeText } from "@/lib/search";

// ---------------------------------------------------------------------------
// Types : structure exacte du fichier JSON
// ---------------------------------------------------------------------------

export interface RawCompany {
  name: string;
  sector: string;
}

export interface RawTouristSite {
  name: string;
  description: string;
  location?: string;
  image?: string;
  images?: string[];
}

export interface RawSpecialties {
  gastronomy?: string;
  professions?: string;
  entertainment?: string;
}

export interface RawRegion {
  id: number;
  name: string;
  capital: string;
  population: number;
  area: number;
  departments: string[];
  majorCompanies?: RawCompany[];
  jobDemand?: string[];
  specialties?: RawSpecialties;
  touristSites?: RawTouristSite[];
  mainImage?: string;
}

export interface RawUniversity {
  id: number;
  name: string;
  /** Nom de la région (clé de jointure avec RawRegion.name) */
  region: string;
  founded: number;
  type?: "Public" | "Privé";
  students?: number;
  faculties?: string[];
  website?: string;
  description?: string;
  mainImage?: string;
  galleryImages?: string[];
}

export interface RawOverview {
  totalPopulation: number;
  totalPopulationYear?: number;
  totalArea: number;
  totalRegions: number;
  totalDepartments: number;
  totalUniversitesPubliques?: number;
  totalEtablissementsPrives?: number;
  capital: string;
  officialLanguages: string[];
  currency: string;
  populationGrowthRate?: number;
  medianAge?: number;
  urbanizationRate?: number;
  dataSource?: string;
}

export interface RawDataset {
  regions: RawRegion[];
  universities: RawUniversity[];
  overview: RawOverview;
}

// Le JSON importé est typé de façon trop large/étroite par TypeScript
// (littéraux, champs optionnels) : on le ramène au schéma documenté ci-dessus.
const dataset = rawData as unknown as RawDataset;

export const getDataset = (): RawDataset => dataset;
export const getRawRegions = (): RawRegion[] => dataset.regions;
export const getRawUniversities = (): RawUniversity[] => dataset.universities;
export const getRawOverview = (): RawOverview => dataset.overview;

// ---------------------------------------------------------------------------
// Indicateurs dérivés par région (calculés une fois)
// ---------------------------------------------------------------------------

export interface RegionIndicators {
  id: number;
  name: string;
  capital: string;
  population: number;
  area: number;
  /** hab/km², arrondi */
  density: number;
  /** Part de la population régionale dans la somme des régions, en % */
  populationShare: number;
  departmentCount: number;
  universityCount: number;
  publicUniversityCount: number;
  privateUniversityCount: number;
  /** Somme des effectifs étudiants déclarés (universités recensées) */
  students: number;
  companyCount: number;
  touristSiteCount: number;
}

let indicatorsCache: RegionIndicators[] | null = null;

export const getRegionIndicators = (): RegionIndicators[] => {
  if (indicatorsCache) return indicatorsCache;

  const totalPopulation = dataset.regions.reduce(
    (sum, r) => sum + r.population,
    0
  );
  const unisByRegion = new Map<string, RawUniversity[]>();
  for (const uni of dataset.universities) {
    const list = unisByRegion.get(uni.region) ?? [];
    list.push(uni);
    unisByRegion.set(uni.region, list);
  }

  indicatorsCache = dataset.regions.map((r) => {
    const unis = unisByRegion.get(r.name) ?? [];
    return {
      id: r.id,
      name: r.name,
      capital: r.capital,
      population: r.population,
      area: r.area,
      density: r.area ? Math.round(r.population / r.area) : 0,
      populationShare: totalPopulation
        ? Math.round((r.population / totalPopulation) * 1000) / 10
        : 0,
      departmentCount: r.departments.length,
      universityCount: unis.length,
      publicUniversityCount: unis.filter((u) => u.type !== "Privé").length,
      privateUniversityCount: unis.filter((u) => u.type === "Privé").length,
      students: unis.reduce((sum, u) => sum + (u.students ?? 0), 0),
      companyCount: r.majorCompanies?.length ?? 0,
      touristSiteCount: r.touristSites?.length ?? 0,
    };
  });
  return indicatorsCache;
};

export const getRegionByName = (name: string): RawRegion | undefined =>
  dataset.regions.find((r) => r.name === name);

export const getUniversitiesOfRegion = (regionName: string): RawUniversity[] =>
  dataset.universities.filter((u) => u.region === regionName);

// ---------------------------------------------------------------------------
// Index de recherche (régions, départements, universités)
// ---------------------------------------------------------------------------

export type SearchHitKind = "region" | "department" | "university";

export interface SearchHit {
  kind: SearchHitKind;
  label: string;
  /** Région de rattachement */
  region: string;
  id: string;
}

interface IndexedEntry extends SearchHit {
  haystack: string;
}

let searchIndex: IndexedEntry[] | null = null;

const buildSearchIndex = (): IndexedEntry[] => {
  const entries: IndexedEntry[] = [];
  for (const r of dataset.regions) {
    entries.push({
      kind: "region",
      id: `region-${r.id}`,
      label: r.name,
      region: r.name,
      haystack: normalizeText(`${r.name} ${r.capital}`),
    });
    r.departments.forEach((dept, idx) =>
      entries.push({
        kind: "department",
        id: `department-${r.id}-${idx}`,
        label: dept,
        region: r.name,
        haystack: normalizeText(dept),
      })
    );
  }
  for (const u of dataset.universities) {
    entries.push({
      kind: "university",
      id: `university-${u.id}`,
      label: u.name,
      region: u.region,
      haystack: normalizeText(u.name),
    });
  }
  return entries;
};

/** Recherche insensible à la casse et aux accents ("extreme" → "Extrême-Nord"). */
export const searchDataset = (query: string, limitPerKind = 5): SearchHit[] => {
  const q = normalizeText(query);
  if (!q) return [];
  if (!searchIndex) searchIndex = buildSearchIndex();

  const counts: Record<SearchHitKind, number> = {
    region: 0,
    department: 0,
    university: 0,
  };
  const hits: SearchHit[] = [];
  for (const entry of searchIndex) {
    if (counts[entry.kind] >= limitPerKind) continue;
    if (!entry.haystack.includes(q)) continue;
    counts[entry.kind] += 1;
    const { haystack, ...hit } = entry;
    hits.push(hit);
  }
  return hits;
};

// ---------------------------------------------------------------------------
// Métadonnées : sources, périodes de référence, limites connues
// ---------------------------------------------------------------------------

export interface DatasetMeta {
  nationalPopulation: number;
  nationalPopulationYear?: number;
  sumOfRegionalPopulations: number;
  nationalArea: number;
  sumOfRegionalAreas: number;
  source?: string;
}

export const getDatasetMeta = (): DatasetMeta => {
  const o = dataset.overview;
  return {
    nationalPopulation: o.totalPopulation,
    nationalPopulationYear: o.totalPopulationYear,
    sumOfRegionalPopulations: dataset.regions.reduce(
      (s, r) => s + r.population,
      0
    ),
    nationalArea: o.totalArea,
    sumOfRegionalAreas: dataset.regions.reduce((s, r) => s + r.area, 0),
    source: o.dataSource,
  };
};
