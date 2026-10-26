/**
 * Tables « à plat » prêtes à l'export (CSV/JSON), construites depuis la source
 * canonique. Une ligne = une entité, colonnes stables et documentées : c'est
 * le format attendu par les tableurs et outils SIG des partenaires.
 */
import {
  getDataset,
  getRawRegions,
  getRawUniversities,
  getRegionIndicators,
} from "@/lib/dataset";
import { SOURCES } from "@/lib/sources";

export interface ExportTable {
  id: string;
  label: string;
  description: string;
  source: string;
  rows: () => Record<string, unknown>[];
}

export const EXPORT_TABLES: ExportTable[] = [
  {
    id: "regions",
    label: "Indicateurs régionaux",
    description:
      "Une ligne par région : population, superficie, densité, part de la population, départements, universités, effectifs étudiants déclarés.",
    source: SOURCES.demographics.citation,
    rows: () =>
      getRegionIndicators().map((r) => ({
        region_id: r.id,
        region: r.name,
        chef_lieu: r.capital,
        population: r.population,
        superficie_km2: r.area,
        densite_hab_km2: r.density,
        part_population_pct: r.populationShare,
        nb_departements: r.departmentCount,
        nb_universites: r.universityCount,
        nb_universites_publiques: r.publicUniversityCount,
        nb_universites_privees: r.privateUniversityCount,
        etudiants_declares: r.students,
      })),
  },
  {
    id: "departements",
    label: "Départements",
    description:
      "Une ligne par département avec sa région de rattachement (58 départements).",
    source: SOURCES.demographics.citation,
    rows: () =>
      getRawRegions().flatMap((r) =>
        r.departments.map((d) => ({
          region_id: r.id,
          region: r.name,
          departement: d,
        }))
      ),
  },
  {
    id: "universites",
    label: "Universités",
    description:
      "Une ligne par université recensée : type, année de création, effectif déclaré, région, site web, nombre de facultés.",
    source: SOURCES.institutions.citation,
    rows: () => {
      const regionIds = new Map(getRawRegions().map((r) => [r.name, r.id]));
      return getRawUniversities().map((u) => ({
        universite_id: u.id,
        nom: u.name,
        type: u.type ?? "",
        annee_creation: u.founded,
        etudiants_declares: u.students ?? "",
        region_id: regionIds.get(u.region) ?? "",
        region: u.region,
        site_web: u.website ?? "",
        nb_facultes: u.faculties?.length ?? 0,
        facultes: u.faculties ?? [],
      }));
    },
  },
  {
    id: "entreprises",
    label: "Entreprises majeures",
    description:
      "Une ligne par entreprise citée pour une région, avec son secteur. Liste indicative, non exhaustive.",
    source: SOURCES.economy.citation,
    rows: () =>
      getRawRegions().flatMap((r) =>
        (r.majorCompanies ?? []).map((c) => ({
          region_id: r.id,
          region: r.name,
          entreprise: c.name,
          secteur: c.sector,
        }))
      ),
  },
  {
    id: "sites-touristiques",
    label: "Sites touristiques",
    description: "Une ligne par site touristique référencé, avec sa localisation.",
    source: SOURCES.tourism.citation,
    rows: () =>
      getRawRegions().flatMap((r) =>
        (r.touristSites ?? []).map((s) => ({
          region_id: r.id,
          region: r.name,
          site: s.name,
          localisation: s.location ?? "",
          description: s.description,
        }))
      ),
  },
];

/** Jeu de données complet, accompagné de ses métadonnées de provenance. */
export const buildFullDatasetExport = () => ({
  metadata: {
    title: "Data Kamer — jeu de données Cameroun",
    exportedAt: new Date().toISOString(),
    sources: SOURCES,
    notes: [
      "Les chiffres de population régionaux et le total national proviennent de sources et d'années de référence différentes : leur somme ne coïncide pas avec le total national.",
      "Les effectifs étudiants sont des ordres de grandeur déclarés, non issus d'un recensement centralisé.",
    ],
  },
  ...getDataset(),
});
