/**
 * Registre centralisé des sources de données affichées dans l'application.
 * Le dataset n'a qu'une seule source citée explicitement (overview.dataSource
 * dans data/cameroon.json) ; pour les catégories sans citation officielle
 * précise, on reste honnête plutôt que d'inventer une référence.
 */

export interface DataSource {
  label: string;
  citation: string;
  /** Période de référence, telle que documentée dans le jeu de données */
  period?: string;
  /** Niveau géographique le plus fin disponible */
  granularity?: string;
  /** Limites connues à signaler aux utilisateurs */
  limitations?: string;
}

export const SOURCES = {
  demographics: {
    label: "Démographie & superficie",
    citation:
      "BUCREP (Bureau Central des Recensements et des Études de Population) 2023, INS Cameroun, Worldometer 2025.",
    period:
      "Total national : 2025. Populations régionales : année de référence non précisée dans le jeu de données.",
    granularity: "National, régional (10 régions). Départements : noms uniquement.",
    limitations:
      "La somme des populations régionales ne coïncide pas avec le total national (sources/années différentes). Aucune donnée par commune ni par localité.",
  },
  institutions: {
    label: "Universités & établissements",
    citation:
      "Sites officiels des établissements. Non issu d'un recensement centralisé — à vérifier auprès de l'établissement pour les données sensibles.",
    period: "Non précisée.",
    granularity: "Établissement, rattaché à une région.",
    limitations:
      "16 universités recensées (11 publiques, 5 privées) — liste non exhaustive. Effectifs étudiants indicatifs.",
  },
  tourism: {
    label: "Sites touristiques",
    citation:
      "Données publiques régionales et sites officiels. Non issu d'un recensement centralisé.",
    period: "Non précisée.",
    granularity: "Site, rattaché à une région.",
    limitations: "Sélection de 3 sites par région, non exhaustive.",
  },
  economy: {
    label: "Entreprises & emploi",
    citation:
      "Données publiques régionales. Non issu d'un recensement centralisé.",
    period: "Non précisée.",
    granularity: "Région.",
    limitations:
      "Entreprises citées à titre indicatif ; secteurs en demande non quantifiés.",
  },
  outages: {
    label: "Coupures de courant",
    citation: "API publique ENEO — données en temps réel.",
    period: "Temps réel (coupures programmées publiées par ENEO).",
    granularity: "Quartier / localité, selon ENEO.",
    limitations:
      "Dépend de la disponibilité de l'API ENEO ; seules les coupures publiées sont visibles.",
  },
  weather: {
    label: "Météo",
    citation: "Open-Meteo.com (CC BY 4.0) — modèles météorologiques ouverts.",
    period: "Temps réel + prévisions à 3 jours.",
    granularity: "Coordonnées du chef-lieu de chaque département.",
    limitations:
      "Valeurs modélisées, pas des relevés de stations au sol. Requiert une connexion internet.",
  },
} as const satisfies Record<string, DataSource>;

export type SourceKey = keyof typeof SOURCES;
