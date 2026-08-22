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
```

There is no test suite/framework configured in this repo.

## Architecture

### Single-page app shell, not multi-route

- `src/pages/index.tsx` is a marketing/SaaS landing page (hero, features, pricing) with a manual CTA into `/dashboard` — it no longer auto-redirects.
- `src/pages/dashboard.tsx` is the actual application. It holds an `activeView: ViewType` state and switches between view components (`Dashboard`, `RegionsView`, `UniversitiesView`, `StatsView`, `CompareView`, `MapView`, `OutageView`, `SettingsView` under `src/components/`) — these are **not** separate Next.js routes. `ViewType` is defined in `src/components/CommandPalette/index.tsx` and must stay in sync with `VIEW_TITLES` in `dashboard.tsx` and with `Sidebar`/`CommandPalette` entries whenever a view is added or renamed.
- There is no `next.config.js` — Next.js runs on defaults.

### Lightweight "SaaS" layer (Free / Pro, no backend)

- `src/lib/pro.ts` exposes `usePro()` (localStorage key `datakamer-pro`, event `datakamer-pro-changed`, mirrors the `useFavorites` pattern) plus the shared `FREE_FEATURES`/`PRO_FEATURES` copy used by the landing page, `UpgradeModal`, and the Settings "Abonnement" tab.
- There is no real payment processor — unlocking Pro is an honor-system click ("J'ai soutenu, débloquer Pro") after visiting Buy Me a Coffee (`src/lib/bmc.ts`, configurable via `NEXT_PUBLIC_BMC_USERNAME`, defaults to `datakamer`). Treat this as client-side/per-device only, not a real entitlement check.
- `src/components/UpgradeModal` is the shared upsell dialog, opened from `CompareView` (region limit beyond 2, CSV export), `StatsView` (radar/tendances charts, CSV export), and the `Sidebar` footer "Passer à Pro" button.

### Two divergent copies of the dataset — important gotcha

The static dataset exists in **two places that have drifted apart**:

- `data/cameroon.json` (+ `data/cameroon.ts` for typed access) — imported directly by client components (`dashboard.tsx`, `CommandPalette`) and consumed through `src/lib/cameroonAdapter.ts`, which reshapes it into the typed `Region`/`University` domain models used by `src/services/*.service.ts` → `src/hooks/use*.ts`.
- `public/data/cameroon.json` (+ `public/data/cameroon.ts`) — read only by the Next.js API routes under `src/pages/api/regions/`, `src/pages/api/universities/`, `src/pages/api/overview.ts`.

These files currently differ in content (e.g. population figures, tourist site fields/images). When updating dataset content, check whether the change needs to be applied to both files or clarify with the user which one is authoritative for the task at hand — don't assume they're mirrors of each other.

### Data flow for the main UI (regions/universities/stats/compare/dashboard views)

`data/cameroon.json` → `src/lib/cameroonAdapter.ts` (`getLocalRegions`/`getLocalUniversities`, memoized, synchronous) → `src/services/regions.service.ts` / `universities.service.ts` / `overview.service.ts` (async wrappers, still local-only) → `src/hooks/useRegions.ts` / `useUniversities.ts` / `useOverview.ts` → view components.

`src/lib/api.ts` defines a generic `ApiClient`/`ApiError` pointed at an external Django API (`NEXT_PUBLIC_API_URL`, defaults to a Heroku URL). It is **not used** by the services above (they're all local-JSON-backed) — it's legacy/vestigial from before the app switched to the embedded JSON dataset.

### Outages view is the one live external integration

`src/pages/api/outages/index.ts` calls the ENEO outage API (via `axios`) server-side and maps region IDs to region names via `REGION_MAPPING`; `src/components/OutageView` consumes this API route. This is the only view backed by a real external/live data source rather than the embedded JSON.

### Swagger docs

`src/swagger.ts` defines the OpenAPI spec; `src/pages/api/swagger.ts` serves it as JSON; `src/pages/docs/index.tsx` renders it with `swagger-ui-react`.

### Styling / UI kit

- Tailwind config used at build time is `tailwind.config.ts` (referenced by `components.json`); `tailwind.config.js` also exists but is not the one shadcn/tailwind tooling points at — treat `.ts` as authoritative if the two ever disagree.
- Design tokens (HSL CSS vars for background/foreground/primary/etc., `--radius`) live in `src/style.css` under `:root` / `.dark`.
- `src/components/ui/*` are small local shadcn-style primitives (Card, StatCard, PageHeader, EmptyState, IconButton); `src/components/common/*` has `LoadingSpinner`/`ErrorMessage`. Path alias `@/*` maps to `src/*` (see `tsconfig.json`).
- Dark mode is class-based, toggled via `src/contexts/ThemeContext.tsx` (`ThemeProvider`/`useTheme`), persisted to `localStorage` under `datakamer-theme`.
- Favorites (starring regions/universities) persist to `localStorage` under `datakamer-favorites` via `src/lib/favorites.ts` (`useFavorites` hook), synced across components with a custom `datakamer-favorites-changed` window event.

### i18n

`next-i18next.config.js` declares locales `en`/`fr` (default `en`), but the app's actual visible content and copy are hardcoded in French throughout components rather than routed through i18next translation files — check before assuming a string is translatable via next-i18next.
