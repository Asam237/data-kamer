# Architecture des données et trajectoire SaaS

## Aujourd'hui : application statique, sans backend

```
data/cameroon.json            ← source canonique unique (35 Ko)
  └─ src/lib/dataset.ts       ← seul module qui importe le JSON : types, indicateurs dérivés,
     │                          index de recherche, métadonnées (tout est mis en cache)
     ├─ src/lib/cameroonAdapter.ts → services/*.service.ts → hooks/use*.ts → vues Régions / Universités
     ├─ src/lib/datasetExports.ts  → exports CSV/JSON (vue « Données & sources »)
     ├─ src/lib/report.ts          → fiches régionales imprimables / PDF
     ├─ src/lib/dataQuality.ts     → contrôles de cohérence (UI + `yarn validate:data`)
     └─ src/pages/api/*            → mêmes données exposées en JSON (documentées dans /docs)
```

Sources externes appelées en direct :

- **ENEO** (coupures) — via la route `src/pages/api/outages`.
- **Open-Meteo** (météo, CC BY 4.0) — appelée depuis le navigateur par `src/lib/weather.ts`, une requête par région, cache mémoire 30 min.

### Règles

- Les composants n'importent **jamais** `data/cameroon.json` directement : ils passent par `@/lib/dataset` (ou les services/hooks).
- Tout chiffre affiché doit être rattaché à une entrée de `src/lib/sources.ts` (source, période, granularité, limites). Pas de valeur estimée ou simulée présentée comme une donnée.
- Après toute modification du JSON : `yarn validate:data` puis `yarn test`.

### Fichiers hérités (plus lus par le code)

`data/cameroon.ts`, `public/data/cameroon.json` et `public/data/cameroon.ts` sont d'anciennes copies divergentes (chiffres de population antérieurs). `public/data/cameroon.json` reste toutefois téléchargeable publiquement à `/data/cameroon.json`. Leur suppression est recommandée mais n'a pas été faite sans validation.

## Ce que le stockage local permet — et ne permet pas

| Fonction | État actuel | Limite |
|---|---|---|
| Favoris, thème, statut Pro | `localStorage` du navigateur | Ni synchronisé entre appareils, ni partagé en équipe, effaçable par l'utilisateur |
| Statut Pro | Déclaratif (bouton après don Buy Me a Coffee) | Aucune vérification : ce n'est pas un droit d'accès sécurisé |
| Exports, rapports | Générés dans le navigateur | Aucun historique, aucune planification |
| Mise à jour des données | Modification du JSON + redéploiement | Pas de versionnement des séries, pas de mise à jour automatique |

## Évolutions nécessaires pour un SaaS multi-organisations

1. **API de données** : remplacer le corps de `src/lib/dataset.ts` (et des services) par des appels HTTP. Les signatures sont déjà centralisées ; les services sont déjà asynchrones.
2. **Authentification réelle** (fournisseur OIDC) et **comptes d'organisation** (rôles admin / analyste / lecteur).
3. **Persistance serveur** des vues personnalisées, favoris et tableaux de bord, rattachés à l'organisation.
4. **Paiement vérifié** côté serveur (webhook du prestataire) à la place du statut Pro déclaratif.
5. **Modèle de données temporel** : chaque indicateur avec `valeur`, `année`, `source`, `unité`, `niveau géographique` (région → département → commune), pour comparer des périodes et ajouter les secteurs non couverts (santé, éducation de base, WASH, sécurité alimentaire…) à partir de sources ouvertes (HDX, INS, Banque mondiale, OMS).
6. **Géométries administratives** (limites régionales/départementales sous licence ouverte) pour des cartes choroplèthes.
7. **Journal d'audit et conditions d'utilisation des données** si des données non publiques sont un jour hébergées.
