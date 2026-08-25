/**
 * Registre centralisé des sources de données affichées dans l'application.
 * Le dataset n'a qu'une seule source citée explicitement (overview.dataSource
 * dans data/cameroon.json) ; pour les catégories sans citation officielle
 * précise, on reste honnête plutôt que d'inventer une référence.
 */

export interface DataSource {
  label: string;
  citation: string;
}

export const SOURCES = {
  demographics: {
    label: "Démographie & superficie",
    citation:
      "BUCREP (Bureau Central des Recensements et des Études de Population) 2023, INS Cameroun, Worldometer 2025.",
  },
  institutions: {
    label: "Universités & établissements",
    citation:
      "Sites officiels des établissements. Non issu d'un recensement centralisé — à vérifier auprès de l'établissement pour les données sensibles.",
  },
  tourism: {
    label: "Sites touristiques",
    citation:
      "Données publiques régionales et sites officiels. Non issu d'un recensement centralisé.",
  },
  economy: {
    label: "Entreprises & emploi",
    citation:
      "Données publiques régionales. Non issu d'un recensement centralisé.",
  },
  outages: {
    label: "Coupures de courant",
    citation: "API publique ENEO — données en temps réel.",
  },
} as const satisfies Record<string, DataSource>;

export type SourceKey = keyof typeof SOURCES;
