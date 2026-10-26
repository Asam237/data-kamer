/**
 * Contrôles de cohérence du jeu de données.
 *
 * Module volontairement sans dépendance d'exécution (imports de types
 * uniquement) : il est utilisé à la fois par l'interface (vue « Données &
 * sources ») et par `scripts/validate-data.mts` exécuté directement par Node.
 */
import type { RawDataset } from "./dataset";

export type CheckLevel = "error" | "warning" | "info";

export interface QualityCheck {
  id: string;
  level: CheckLevel;
  message: string;
}

interface Options {
  /** Vérifie l'existence d'un fichier sous public/ (fourni par le script Node). */
  fileExists?: (publicPath: string) => boolean;
}

const duplicates = (values: (string | number)[]) =>
  values.filter((v, i) => values.indexOf(v) !== i);

export const runDataQualityChecks = (
  data: RawDataset,
  { fileExists }: Options = {}
): QualityCheck[] => {
  const checks: QualityCheck[] = [];
  const add = (id: string, level: CheckLevel, message: string) =>
    checks.push({ id, level, message });

  const { regions, universities, overview } = data;

  // --- Structure / identifiants -------------------------------------------
  if (!Array.isArray(regions) || !regions.length)
    add("regions-empty", "error", "Aucune région dans le jeu de données.");
  if (!Array.isArray(universities))
    add("universities-missing", "error", "Liste des universités absente.");

  const dupRegionIds = duplicates(regions.map((r) => r.id));
  if (dupRegionIds.length)
    add("regions-dup-id", "error", `Identifiants de région dupliqués : ${dupRegionIds.join(", ")}`);
  const dupRegionNames = duplicates(regions.map((r) => r.name));
  if (dupRegionNames.length)
    add("regions-dup-name", "error", `Noms de région dupliqués : ${dupRegionNames.join(", ")}`);
  const dupUniIds = duplicates(universities.map((u) => u.id));
  if (dupUniIds.length)
    add("universities-dup-id", "error", `Identifiants d'université dupliqués : ${dupUniIds.join(", ")}`);
  const dupUniNames = duplicates(universities.map((u) => u.name));
  if (dupUniNames.length)
    add("universities-dup-name", "warning", `Universités en double (même nom) : ${dupUniNames.join(", ")}`);

  // --- Champs obligatoires / formats ---------------------------------------
  for (const r of regions) {
    if (!r.name || !r.capital)
      add(`region-${r.id}-fields`, "error", `Région ${r.id} : nom ou chef-lieu manquant.`);
    if (!(r.population > 0))
      add(`region-${r.id}-population`, "error", `Région ${r.name} : population invalide (${r.population}).`);
    if (!(r.area > 0))
      add(`region-${r.id}-area`, "error", `Région ${r.name} : superficie invalide (${r.area}).`);
    if (!Array.isArray(r.departments) || !r.departments.length)
      add(`region-${r.id}-departments`, "error", `Région ${r.name} : aucun département.`);
    const dupDepts = duplicates(r.departments ?? []);
    if (dupDepts.length)
      add(`region-${r.id}-dup-dept`, "error", `Région ${r.name} : départements dupliqués (${dupDepts.join(", ")}).`);
  }

  const regionNames = new Set(regions.map((r) => r.name));
  const currentYear = new Date().getFullYear();
  for (const u of universities) {
    if (!regionNames.has(u.region))
      add(`university-${u.id}-region`, "error", `${u.name} : région « ${u.region} » inconnue.`);
    if (!(u.founded > 1800 && u.founded <= currentYear))
      add(`university-${u.id}-founded`, "warning", `${u.name} : année de création douteuse (${u.founded}).`);
    if (u.type && u.type !== "Public" && u.type !== "Privé")
      add(`university-${u.id}-type`, "error", `${u.name} : type inattendu (${u.type}).`);
    if (u.website && !/^https?:\/\//.test(u.website))
      add(`university-${u.id}-website`, "warning", `${u.name} : URL de site web mal formée.`);
  }

  // --- Cohérence avec l'aperçu national ------------------------------------
  const deptCount = regions.reduce((s, r) => s + (r.departments?.length ?? 0), 0);
  if (overview.totalDepartments !== deptCount)
    add("overview-departments", "error", `Aperçu : ${overview.totalDepartments} départements annoncés, ${deptCount} listés.`);
  if (overview.totalRegions !== regions.length)
    add("overview-regions", "error", `Aperçu : ${overview.totalRegions} régions annoncées, ${regions.length} listées.`);

  const popSum = regions.reduce((s, r) => s + r.population, 0);
  if (popSum !== overview.totalPopulation) {
    const gap = ((overview.totalPopulation - popSum) / overview.totalPopulation) * 100;
    add(
      "overview-population",
      "warning",
      `Somme des populations régionales (${popSum.toLocaleString("fr-FR")}) ≠ total national ${
        overview.totalPopulationYear ? `${overview.totalPopulationYear} ` : ""
      }(${overview.totalPopulation.toLocaleString("fr-FR")}), écart ${gap.toFixed(1)} % — années de référence probablement différentes.`
    );
  }
  const areaSum = regions.reduce((s, r) => s + r.area, 0);
  if (areaSum !== overview.totalArea)
    add(
      "overview-area",
      "warning",
      `Somme des superficies régionales (${areaSum.toLocaleString("fr-FR")} km²) ≠ superficie nationale (${overview.totalArea.toLocaleString("fr-FR")} km²).`
    );

  // --- Couverture / métadonnées --------------------------------------------
  const withoutStudents = universities.filter((u) => !u.students).length;
  if (withoutStudents)
    add("universities-students", "info", `${withoutStudents} université(s) sans effectif étudiant.`);
  add(
    "students-unsourced",
    "info",
    "Les effectifs étudiants n'ont pas de source ni d'année de référence documentées."
  );
  const sitesWithoutImages = regions.flatMap((r) =>
    (r.touristSites ?? []).filter((s) => !s.images?.length).map((s) => `${s.name} (${r.name})`)
  );
  if (sitesWithoutImages.length)
    add("sites-images", "info", `${sitesWithoutImages.length} site(s) touristique(s) sans photo : ${sitesWithoutImages.join(", ")}.`);

  // --- Fichiers référencés (uniquement côté script Node) --------------------
  if (fileExists) {
    const paths = new Set<string>();
    regions.forEach((r) => {
      if (r.mainImage) paths.add(r.mainImage);
      r.touristSites?.forEach((s) => {
        if (s.image) paths.add(s.image);
        s.images?.forEach((i) => paths.add(i));
      });
    });
    universities.forEach((u) => {
      if (u.mainImage) paths.add(u.mainImage);
      u.galleryImages?.forEach((i) => paths.add(i));
    });
    const missing = Array.from(paths).filter((p) => !fileExists(p));
    if (missing.length)
      add(
        "images-missing",
        "warning",
        `${missing.length}/${paths.size} chemins d'image référencés n'existent pas dans public/ (ex. ${missing.slice(0, 3).join(", ")}).`
      );
  }

  return checks;
};
