# Module context: application shell

## Responsibility

Owns Angular bootstrap configuration, top-level routes, and the root shell. It
does not own catalog business behaviour or HTTP contracts.

## Public surface

- `/` route, currently backed by the catalog page.
- Root providers in `app.config.ts`.

## Data and control flow

`app.routes.ts` dynamically selects a feature presentation entry point.
`app.config.ts` is the narrow composition root that connects domain ports and
services to data-access adapters. Other shell files must not import feature
internals.

## Invariants

- Business behaviour stays inside feature domain layers.
- Root routing and providers remain thin.
- New or materially changed shell UI requires an approved design record;
  non-material corrections may record `Design: Not applicable`.

## Dependencies

- Angular router and browser bootstrap.
- Catalog feature presentation entry point.
- Shared presentation tokens from `src/styles/_tokens.scss`.

## Key files

- `app.routes.ts` — route ownership.
- `app.config.ts` — root providers.
- `features/catalog/CONTEXT.md` — current storefront feature map.
- `../styles/CONTEXT.md` — shared visual-token ownership and catalogue.

## Verification

Run `npm run lint` (including `lint:styles` and `lint:architecture`),
`npm run test`, `npm run build`, and `npm run e2e`.

GitHub CI uses `.github/workflows/quality-gate.yml` with Node.js 24.14.0 and npm
11.11.0. The stable required check is `quality-gate`.

## Decisions and traps

See `ARCHITECTURE.md`, `docs/product/storefront.md`, and `docs/BACKLOG.md`.

Cross-feature consumers use only the target feature's exact `domain/index.ts`.
The architecture guard resolves relative paths and configured aliases and
checks production plus colocated test files.

Angular CLI persistent caching is disabled in `angular.json`. On the current
macOS arm64 environment the native LMDB cache addon aborts while freeing an
invalid pointer during `ng build`; disabling the cache makes builds
deterministic at the cost of slower rebuilds. Revisit after upgrading the
Angular build/cache dependency or runtime, and re-enable only after
`npm run verify` passes repeatedly.
