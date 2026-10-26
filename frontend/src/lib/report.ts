/**
 * Génère une fiche régionale imprimable (ou enregistrable en PDF via la boîte
 * d'impression du navigateur). Tout est fait côté client à partir du jeu de
 * données embarqué : aucune donnée n'est envoyée à un serveur.
 */
import {
  getRegionByName,
  getRegionIndicators,
  getUniversitiesOfRegion,
  type RegionIndicators,
} from "@/lib/dataset";
import { SOURCES } from "@/lib/sources";

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const fmt = (n: number) => n.toLocaleString("fr-FR");

const STYLES = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 32px; line-height: 1.5; font-size: 13px; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  h2 { font-size: 17px; margin: 28px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #2563eb; }
  h3 { font-size: 14px; margin: 16px 0 6px; }
  .muted { color: #64748b; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  th { background: #f1f5f9; font-weight: 600; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0; }
  .kpi { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
  .kpi b { display: block; font-size: 18px; }
  .chips span { display: inline-block; background: #f1f5f9; border-radius: 999px; padding: 2px 10px; margin: 2px; }
  .note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 12px; margin-top: 12px; }
  .toolbar { position: sticky; top: 0; background: #fff; padding: 8px 0 16px; display: flex; gap: 8px; }
  .toolbar button { padding: 8px 14px; border-radius: 8px; border: 1px solid #2563eb; background: #2563eb; color: #fff; cursor: pointer; font-size: 13px; }
  .page { page-break-before: always; }
  @media print { .toolbar { display: none; } body { padding: 0; } }
`;

const kpis = (r: RegionIndicators) => `
  <div class="grid">
    <div class="kpi"><span class="muted">Population</span><b>${fmt(r.population)}</b></div>
    <div class="kpi"><span class="muted">Superficie</span><b>${fmt(r.area)} km²</b></div>
    <div class="kpi"><span class="muted">Densité</span><b>${fmt(r.density)} hab/km²</b></div>
    <div class="kpi"><span class="muted">Part de la population*</span><b>${r.populationShare} %</b></div>
  </div>`;

const regionSection = (r: RegionIndicators, isFirst: boolean) => {
  const raw = getRegionByName(r.name);
  const unis = getUniversitiesOfRegion(r.name);
  return `
  <section class="${isFirst ? "" : "page"}">
    <h1>Région ${escapeHtml(r.name)}</h1>
    <p class="muted">Chef-lieu : ${escapeHtml(r.capital)} · ${r.departmentCount} départements</p>
    ${kpis(r)}

    <h2>Départements</h2>
    <div class="chips">${(raw?.departments ?? [])
      .map((d) => `<span>${escapeHtml(d)}</span>`)
      .join("")}</div>

    <h2>Enseignement supérieur</h2>
    ${
      unis.length
        ? `<table><thead><tr><th>Université</th><th>Type</th><th class="num">Création</th><th class="num">Étudiants (déclarés)</th></tr></thead><tbody>
          ${unis
            .map(
              (u) =>
                `<tr><td>${escapeHtml(u.name)}</td><td>${escapeHtml(
                  u.type ?? ""
                )}</td><td class="num">${u.founded}</td><td class="num">${
                  u.students ? fmt(u.students) : "—"
                }</td></tr>`
            )
            .join("")}
          </tbody></table>`
        : `<p class="muted">Aucune université recensée dans le jeu de données pour cette région.</p>`
    }
    <p class="muted">Source : ${escapeHtml(SOURCES.institutions.citation)}</p>

    ${
      raw?.majorCompanies?.length
        ? `<h2>Économie — entreprises citées</h2>
      <table><thead><tr><th>Entreprise</th><th>Secteur</th></tr></thead><tbody>
      ${raw.majorCompanies
        .map(
          (c) =>
            `<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(
              c.sector
            )}</td></tr>`
        )
        .join("")}
      </tbody></table>
      ${
        raw.jobDemand?.length
          ? `<h3>Secteurs à forte demande d'emploi</h3><div class="chips">${raw.jobDemand
              .map((j) => `<span>${escapeHtml(j)}</span>`)
              .join("")}</div>`
          : ""
      }
      <p class="muted">Source : ${escapeHtml(SOURCES.economy.citation)}</p>`
        : ""
    }

    ${
      raw?.touristSites?.length
        ? `<h2>Sites touristiques</h2><ul>${raw.touristSites
            .map(
              (s) =>
                `<li><b>${escapeHtml(s.name)}</b>${
                  s.location ? ` — ${escapeHtml(s.location)}` : ""
                }<br/><span class="muted">${escapeHtml(
                  s.description
                )}</span></li>`
            )
            .join("")}</ul>`
        : ""
    }
  </section>`;
};

const comparisonTable = (regions: RegionIndicators[]) => `
  <h1>Comparaison régionale</h1>
  <p class="muted">${regions.map((r) => escapeHtml(r.name)).join(", ")}</p>
  <table>
    <thead><tr><th>Région</th><th class="num">Population</th><th class="num">Superficie (km²)</th><th class="num">Densité</th><th class="num">Part pop.*</th><th class="num">Départements</th><th class="num">Universités</th><th class="num">Étudiants (déclarés)</th></tr></thead>
    <tbody>${regions
      .map(
        (r) => `<tr><td>${escapeHtml(r.name)}</td><td class="num">${fmt(
          r.population
        )}</td><td class="num">${fmt(r.area)}</td><td class="num">${fmt(
          r.density
        )}</td><td class="num">${r.populationShare} %</td><td class="num">${
          r.departmentCount
        }</td><td class="num">${r.universityCount}</td><td class="num">${fmt(
          r.students
        )}</td></tr>`
      )
      .join("")}</tbody>
  </table>`;

export const buildRegionsReportHtml = (regionNames: string[]): string => {
  const all = getRegionIndicators();
  const regions = regionNames
    .map((name) => all.find((r) => r.name === name))
    .filter((r): r is RegionIndicators => Boolean(r));
  const generatedAt = new Date().toLocaleString("fr-FR");
  const title =
    regions.length === 1
      ? `Fiche région ${regions[0].name}`
      : `Rapport régional — ${regions.length} régions`;

  const body = [
    regions.length > 1
      ? `<section>${comparisonTable(regions)}</section>`
      : "",
    ...regions.map((r, i) => regionSection(r, regions.length === 1 && i === 0)),
  ].join("");

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)} — Data Kamer</title><style>${STYLES}</style></head>
  <body>
    <div class="toolbar"><button onclick="window.print()">Imprimer / Enregistrer en PDF</button></div>
    <p class="muted">Data Kamer · ${escapeHtml(title)} · généré le ${escapeHtml(
      generatedAt
    )}</p>
    ${body}
    <div class="note">
      <b>Sources et limites.</b> Démographie : ${escapeHtml(
        SOURCES.demographics.citation
      )}
      <br/>* Part calculée sur la somme des populations régionales du jeu de données, dont l'année de référence peut différer du total national affiché ailleurs dans l'application.
      Les effectifs étudiants et listes d'entreprises sont indicatifs et non exhaustifs. Vérifiez auprès des sources officielles avant toute décision opérationnelle.
    </div>
  </body></html>`;
};

/** Ouvre le rapport dans un nouvel onglet. Renvoie false si le navigateur a bloqué l'ouverture. */
export const openRegionsReport = (regionNames: string[]): boolean => {
  const html = buildRegionsReportHtml(regionNames);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  // Laisser le temps à l'onglet de charger le document avant de libérer l'URL
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return Boolean(win);
};
