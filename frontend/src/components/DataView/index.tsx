import React, { useMemo } from "react";
import {
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { getDataset, getRawRegions } from "@/lib/dataset";
import { runDataQualityChecks, type CheckLevel } from "@/lib/dataQuality";
import { EXPORT_TABLES, buildFullDatasetExport } from "@/lib/datasetExports";
import { exportToCsv, exportToJson } from "@/lib/export";
import { openRegionsReport } from "@/lib/report";
import { SOURCES } from "@/lib/sources";

type Coverage = "available" | "partial" | "missing";

// Couverture sectorielle du jeu de données actuel — décrit l'existant, sans
// rien supposer de données que l'application ne possède pas.
const SECTORS: { name: string; coverage: Coverage; detail: string }[] = [
  {
    name: "Démographie",
    coverage: "partial",
    detail: "Population et superficie par région ; pas de ventilation par âge, sexe ni commune.",
  },
  {
    name: "Éducation",
    coverage: "partial",
    detail: "Enseignement supérieur uniquement (16 universités). Pas de données primaire/secondaire.",
  },
  {
    name: "Économie & emploi",
    coverage: "partial",
    detail: "Entreprises citées et secteurs en demande, à titre indicatif.",
  },
  {
    name: "Énergie",
    coverage: "available",
    detail: "Coupures programmées ENEO en temps réel (vue Coupures).",
  },
  { name: "Santé", coverage: "missing", detail: "Non couvert par le jeu de données actuel." },
  {
    name: "Agriculture & sécurité alimentaire",
    coverage: "missing",
    detail: "Non couvert par le jeu de données actuel.",
  },
  { name: "Eau, hygiène & assainissement", coverage: "missing", detail: "Non couvert par le jeu de données actuel." },
  { name: "Protection", coverage: "missing", detail: "Non couvert par le jeu de données actuel." },
];

const COVERAGE_STYLE: Record<Coverage, { label: string; className: string }> = {
  available: { label: "Disponible", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  partial: { label: "Partiel", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  missing: { label: "Non couvert", className: "bg-muted text-muted-foreground" },
};

// Portails de données ouvertes de référence (non intégrés à l'application).
const OPEN_DATA_PORTALS = [
  { name: "HDX — Humanitarian Data Exchange (OCHA), Cameroun", url: "https://data.humdata.org/group/cmr" },
  { name: "Banque mondiale — indicateurs Cameroun", url: "https://data.worldbank.org/country/cameroon" },
  { name: "Institut National de la Statistique (INS)", url: "https://ins-cameroun.cm" },
  { name: "OMS — Global Health Observatory", url: "https://www.who.int/data/gho" },
];

const LEVEL_ICON: Record<CheckLevel, { icon: React.ElementType; className: string }> = {
  error: { icon: XCircle, className: "text-red-500" },
  warning: { icon: AlertTriangle, className: "text-amber-500" },
  info: { icon: Info, className: "text-blue-500" },
};

const card = "bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm";

const DataView: React.FC = () => {
  const checks = useMemo(() => runDataQualityChecks(getDataset()), []);
  const errorCount = checks.filter((c) => c.level === "error").length;
  const tableSizes = useMemo(
    () => Object.fromEntries(EXPORT_TABLES.map((t) => [t.id, t.rows().length])),
    []
  );

  const handleNationalReport = () =>
    openRegionsReport(getRawRegions().map((r) => r.name));

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Données & sources"
        subtitle="Catalogue, provenance, contrôle qualité et téléchargement des jeux de données"
        icon={Database}
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleNationalReport}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-border text-foreground rounded-xl hover:bg-muted transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              Rapport national (PDF)
            </button>
            <button
              onClick={() => exportToJson("datakamer-jeu-complet", buildFullDatasetExport())}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              Jeu complet (JSON)
            </button>
          </div>
        }
      />

      {/* Téléchargements */}
      <section className={card}>
        <h2 className="text-lg font-bold text-foreground mb-1">Jeux de données téléchargeables</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tables à plat, une ligne par entité, avec identifiants stables (<code>region_id</code>) pour
          les jointures dans un tableur ou un SIG. Téléchargement gratuit, généré dans votre navigateur.
        </p>
        <div className="divide-y divide-border">
          {EXPORT_TABLES.map((table) => (
            <div key={table.id} className="py-3 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">
                  {table.label}{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    · {tableSizes[table.id]} lignes
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{table.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Source : {table.source}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => exportToCsv(`datakamer-${table.id}`, table.rows())}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-sm font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4" /> CSV
                </button>
                <button
                  onClick={() => exportToJson(`datakamer-${table.id}`, table.rows())}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-sm font-medium"
                >
                  <FileJson className="w-4 h-4" /> JSON
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sources & méthodologie */}
      <section className={card}>
        <h2 className="text-lg font-bold text-foreground mb-4">Sources, périodes de référence et limites</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(SOURCES).map(([key, source]) => (
            <div key={key} className="rounded-xl border border-border p-4 space-y-1.5">
              <p className="font-semibold text-foreground">{source.label}</p>
              <p className="text-sm text-foreground">{source.citation}</p>
              {source.period && (
                <p className="text-xs text-muted-foreground"><b>Période :</b> {source.period}</p>
              )}
              {source.granularity && (
                <p className="text-xs text-muted-foreground"><b>Granularité :</b> {source.granularity}</p>
              )}
              {source.limitations && (
                <p className="text-xs text-amber-600 dark:text-amber-400"><b>Limites :</b> {source.limitations}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Couverture sectorielle */}
      <section className={card}>
        <h2 className="text-lg font-bold text-foreground mb-1">Couverture sectorielle</h2>
        <p className="text-sm text-muted-foreground mb-4">
          État des thématiques couramment utilisées par les partenaires de développement.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SECTORS.map((s) => (
            <div key={s.name} className="flex items-start gap-3 rounded-xl border border-border p-3">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${COVERAGE_STYLE[s.coverage].className}`}
              >
                {COVERAGE_STYLE[s.coverage].label}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <p className="text-sm font-medium text-foreground mb-2">
            Portails de données ouvertes de référence <span className="text-muted-foreground font-normal">(non intégrés à Data Kamer)</span>
          </p>
          <ul className="space-y-1">
            {OPEN_DATA_PORTALS.map((p) => (
              <li key={p.url}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {p.name} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Qualité */}
      <section className={card}>
        <div className="flex items-center gap-2 mb-4">
          {errorCount ? (
            <XCircle className="w-5 h-5 text-red-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          )}
          <h2 className="text-lg font-bold text-foreground">Contrôle qualité automatique</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {errorCount
            ? `${errorCount} erreur(s) bloquante(s) détectée(s).`
            : "Aucune erreur bloquante : identifiants uniques, rattachements région ↔ université valides, nombre de régions et de départements cohérent."}{" "}
          Points d&apos;attention :
        </p>
        <ul className="space-y-2">
          {checks.map((c) => {
            const { icon: Icon, className } = LEVEL_ICON[c.level];
            return (
              <li key={c.id} className="flex items-start gap-2 text-sm text-foreground">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${className}`} />
                <span>{c.message}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Limites de la plateforme */}
      <section className={card}>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-foreground">Fonctionnement et confidentialité</h2>
        </div>
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
          <li>Les données sont embarquées dans l&apos;application : aucun compte requis, aucune donnée personnelle collectée.</li>
          <li>
            Favoris, préférences et statut Pro sont enregistrés <b>uniquement dans ce navigateur</b> : ils ne
            sont ni synchronisés entre appareils ni partagés au sein d&apos;une équipe.
          </li>
          <li>Les espaces d&apos;organisation, la collaboration et les mises à jour automatiques des données nécessiteront un serveur et ne sont pas encore disponibles.</li>
        </ul>
      </section>
    </div>
  );
};

export default DataView;
