# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Data Kamer** — a Next.js 13 (Pages Router) + TypeScript + Tailwind CSS app for exploring data about Cameroon (regions, universities, tourist sites, power outages, statistics). French is the primary UI/content language; code comments and error messages throughout the codebase are also in French.

## Commands

Package manager is **yarn** (yarn.lock is the source of truth; ignore the npm instructions in README.md).

```sh
yarn install    # install dependencies
yarn dev        # start dev server (next dev)
yarn build      # production build
yarn start      # run production build
yarn lint       # next lint (extends next/core-web-vitals)
yarn test       # node --test on tests/*.test.mts (Node ≥ 22.18, native type stripping, no test deps)
yarn validate:data  # data quality checks on data/cameroon.json (exit 1 on blocking errors)
```

Tests only cover pure modules (`src/lib/search.ts`, `export.ts`, `weather.ts`, `dataQuality.ts`) because Node can't resolve the `@/` alias or JSON imports without a bundler — keep those modules free of runtime imports (type-only imports are fine) if they need tests. See `docs/architecture.md` for the data architecture and SaaS limits.

## Architecture

### Single-page app shell, not multi-route

- `src/pages/index.tsx` is a marketing/SaaS landing page (hero, features, pricing) with a manual CTA into `/dashboard` — it no longer auto-redirects.
- `src/pages/dashboard.tsx` is the actual application. It holds an `activeView: ViewType` state and switches between view components (`Dashboard`, `RegionsView`, `UniversitiesView`, `StatsView`, `CompareView`, `MapView`, `OutageView`, `DataView`, `SettingsView` under `src/components/`) — these are **not** separate Next.js routes. The active view is mirrored in the URL hash (`/dashboard#map`), so links are shareable and back/forward work. `ViewType` is defined in `src/components/CommandPalette/index.tsx` and must stay in sync with `VIEW_TITLES` in `dashboard.tsx` and with `Sidebar`/`CommandPalette` entries whenever a view is added or renamed.
- Every view is code-split with `next/dynamic`. Keep each call written literally as `dynamic(() => import("..."), {...})` — wrapping it in a helper hides the import from Next's compiler, the SSR'd view's chunk is then not preloaded and hydration fails (React #418). `MapView`/`OutageView` are `ssr: false`.
- There is no `next.config.js` — Next.js runs on defaults.

### Lightweight "SaaS" layer (Free / Pro, no backend)

- `src/lib/pro.ts` exposes `usePro()` (localStorage key `datakamer-pro`, event `datakamer-pro-changed`, mirrors the `useFavorites` pattern) plus the shared `FREE_FEATURES`/`PRO_FEATURES` copy used by the landing page, `UpgradeModal`, and the Settings "Abonnement" tab.
- There is no real payment processor — unlocking Pro is an honor-system click ("J'ai soutenu, débloquer Pro") after visiting Buy Me a Coffee (`src/lib/bmc.ts`, configurable via `NEXT_PUBLIC_BMC_USERNAME`, defaults to `datakamer`). Treat this as client-side/per-device only, not a real entitlement check.
- `src/components/UpgradeModal` is the shared upsell dialog, opened from `CompareView` (region limit beyond 2, CSV export), `StatsView` (radar/tendances charts, CSV export), and the `Sidebar` footer "Passer à Pro" button.

### Single source of truth: `data/cameroon.json` via `src/lib/dataset.ts`

`src/lib/dataset.ts` is the **only** module that imports `data/cameroon.json`. It exposes the typed raw schema (`RawRegion`, `RawUniversity`, ...), memoized derived indicators (`getRegionIndicators`: density, population share, university/student counts), an accent-insensitive search index (`searchDataset`, used by the command palette — includes departments) and dataset metadata. Components, the map, the reports and the API routes all read through it; don't import the JSON elsewhere.

Legacy copies `data/cameroon.ts`, `public/data/cameroon.json`, `public/data/cameroon.ts` are no longer read by any code (they hold older population figures). Don't edit them expecting an effect; `public/data/cameroon.json` is still publicly served at `/data/cameroon.json`. Tourist-site photos live in `public/pictures/touristiques/` and are referenced by the `images` arrays in `data/cameroon.json`; the region/university `mainImage`/`galleryImages` paths point to files that don't exist (reported by `yarn validate:data`).

Searching: use `normalizeText`/`matchesQuery` from `src/lib/search.ts` (case- and accent-insensitive) rather than `toLowerCase().includes`.

### Data flow for the main UI (regions/universities/stats/compare/dashboard views)

`data/cameroon.json` → `src/lib/dataset.ts` → `src/lib/cameroonAdapter.ts` (`getLocalRegions`/`getLocalUniversities`, memoized, synchronous, reshapes to the `Region`/`University` domain models) → `src/services/regions.service.ts` / `universities.service.ts` / `overview.service.ts` (async wrappers, still local-only — this is the seam to swap for a real API) → `src/hooks/useRegions.ts` / `useUniversities.ts` / `useOverview.ts` → view components. `Dashboard`, `CompareView`, `StatsView`, `MapView` and `DataView` read `@/lib/dataset` directly.

Exports/reports: `src/lib/export.ts` (`exportToCsv` with CSV-formula-injection guard, `exportToJson`), `src/lib/datasetExports.ts` (flat downloadable tables), `src/lib/report.ts` (printable region/comparison report opened in a new tab, user prints to PDF). Data provenance (source, period, granularity, limitations) lives in `src/lib/sources.ts` and is rendered by `SourceBadge` and the "Données & sources" view.

`src/lib/api.ts` defines a generic `ApiClient`/`ApiError` pointed at an external Django API (`NEXT_PUBLIC_API_URL`, defaults to a Heroku URL). It is **not used** by the services above (they're all local-JSON-backed) — it's legacy/vestigial from before the app switched to the embedded JSON dataset.

### Live external integrations

- `src/pages/api/outages/index.ts` calls the ENEO outage API (via `axios`) server-side and maps region IDs to region names via `REGION_MAPPING`; `src/components/OutageView` consumes this API route.
- `src/lib/weather.ts` fetches real weather from Open-Meteo directly in the browser (one batched request per region, 30-min in-memory cache) for the map's "Météo" tab. It replaced a `Math.random()` simulation; on failure it surfaces an error and shows no values — never reintroduce placeholder weather. The "Open-Meteo (CC BY 4.0)" attribution must stay visible.

### Swagger docs

`src/swagger.ts` defines the OpenAPI spec; `src/pages/api/swagger.ts` serves it as JSON; `src/pages/docs/index.tsx` renders it with `swagger-ui-react`.

### Styling / UI kit

- Tailwind config used at build time is `tailwind.config.ts` (referenced by `components.json`); `tailwind.config.js` also exists but is not the one shadcn/tailwind tooling points at — treat `.ts` as authoritative if the two ever disagree.
- Design tokens (HSL CSS vars for background/foreground/primary/etc., `--radius`) live in `src/style.css` under `:root` / `.dark`.
- `@radix-ui/themes` is no longer imported (its `<Theme>` wrapper was unused and its CSS cost ~80 kB gzip per page); base typography it provided is now in `src/style.css`. `@radix-ui/react-dialog` etc. are still used. The package remains in `package.json` pending a `yarn remove`.
- `src/components/ui/*` are small local shadcn-style primitives (Card, StatCard, PageHeader, EmptyState, IconButton); `src/components/common/*` has `LoadingSpinner`/`ErrorMessage`. Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- Dark mode is class-based, toggled via `src/contexts/ThemeContext.tsx` (`ThemeProvider`/`useTheme`), persisted to `localStorage` under `datakamer-theme`.
- Favorites (starring regions/universities) persist to `localStorage` under `datakamer-favorites` via `src/lib/favorites.ts` (`useFavorites` hook), synced across components with a custom `datakamer-favorites-changed` window event.

### i18n

`next-i18next.config.js` declares locales `en`/`fr` (default `en`), but the app's actual visible content and copy are hardcoded in French throughout components rather than routed through i18next translation files — check before assuming a string is translatable via next-i18next.
