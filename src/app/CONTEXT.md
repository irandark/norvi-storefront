# Module context: application shell

## Responsibility

Owns Angular bootstrap configuration, top-level routes, and the root shell. It
does not own catalog business behaviour or HTTP contracts.

## Public surface

- `/` route, currently backed by the catalog page.
- Root providers in `app.config.ts`.

## Data and control flow

`app.routes.ts` selects a feature presentation entry point. Feature-owned
providers connect domain ports to data-access adapters; the shell must not
bypass feature domain services.

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

Run `npm run lint` (including `lint:styles`), `npm run test`, `npm run build`,
and `npm run e2e`.

GitHub CI uses `.github/workflows/quality-gate.yml` with Node.js 24.14.0 and npm
11.11.0. The stable required check is `quality-gate`.

## Decisions and traps

See `ARCHITECTURE.md`, `docs/product/storefront.md`, and `docs/BACKLOG.md`.

Angular CLI persistent caching is disabled in `angular.json`. On the current
macOS arm64 environment the native LMDB cache addon aborts while freeing an
invalid pointer during `ng build`; disabling the cache makes builds
deterministic at the cost of slower rebuilds. Revisit after upgrading the
Angular build/cache dependency or runtime, and re-enable only after
`npm run verify` passes repeatedly.
