# Module context: catalog

## Responsibility

Owns URL-driven catalog loading, domain product/group models, controlled UI
states, DTO validation/mapping, and responsive storefront presentation. It does
not own cart, checkout, or client-side product-group filtering.

## Public surface

- Catalog route presentation entry point.
- `CatalogService` domain use cases and state.
- `ProductCatalogRepository` domain port.
- `ProductGroup` and `CatalogSelection` domain models.
- Domain `Product` model using integer `priceInCents`.

## Data and control flow

```text
Angular Router query adapter in catalog page
→ CatalogService
→ ProductCatalogRepository port
← HttpProductCatalogRepository
→ CatalogHttpService
→ GET /api/product-groups
→ GET /api/products[?groupId=...]
```

`CatalogService` resolves URL slugs against ordered backend groups, owns the
canonical selection and independent group/product state, and cancels a prior
product subscription before activating a newer request. The transport requests
`unknown`; parsers validate DTOs and repositories map distinct domain values
before they cross into presentation.

## Invariants

- Components depend only on domain services and domain models.
- Domain code does not import DTO, repository adapter, transport, or HttpClient.
- DTO/HTTP details remain in `data-access`.
- Invalid external data becomes a controlled catalog failure.
- `Все товары` is frontend-owned and requests products without `groupId`.
- Backend group order is preserved; duplicate IDs/slugs and malformed ASCII
  slugs are rejected.
- URL slugs never cross the domain port; resolved stable IDs do.
- Refetch replaces old cards with approved Variant A skeletons.
- Money remains integer minor units.

## Dependencies

- Angular core, router integration, and `HttpClient`.
- RxJS for repository and domain-service async flows.
- Application shell for route activation only; no business dependency back to
  the shell.

## Key files

- `domain/services/catalog.service.ts` — state transitions and use cases.
- `domain/ports/product-catalog.repository.ts` — domain data contract.
- `data-access/repositories/http-product-catalog.repository.ts` — adapter.
- `data-access/transport/catalog-http.service.ts` — HTTP endpoint ownership.
- `scripts/dev-server.mjs` — temporary browser-observable deterministic local
  API and Angular development proxy; it is outside the production bundle.
- `presentation/pages/catalog-page/` — component consuming the domain service.
- `presentation/pages/catalog-page/_catalog-tokens.scss` — catalog-owned
  semantic style tokens referencing shared primitives.
- `src/styles/_storefront.scss` — catalog-host-scoped storefront rules. Every
  selector is nested under `app-catalog-page`; only keyframes escape the host
  scope. This keeps the component bundle below its style budget without broad
  global selectors.

## Verification

Run `npm run test`, `npm run lint`, `npm run build`, and `npm run e2e`.

Catalog presentation styles consume global semantic tokens documented in
`src/styles/CONTEXT.md`. `npm run lint:styles` rejects raw colours outside the
global palette and dimensions outside owned token-definition files.
`npm run lint:architecture` resolves TypeScript dependencies and enforces the
presentation, domain, data-access, and exact cross-feature `domain/index.ts`
boundaries for production and colocated test sources.

## Decisions and traps

- Architecture: `ARCHITECTURE.md`.
- Original slice: `docs/tasks/001-product-catalog.md`.
- Domain refactor: `docs/tasks/TD-001-catalog-domain-boundary.md`.
- Approved layout: `docs/design/storefront-layout/approval.md`.
- Approved async/navigation states:
  `docs/design/storefront-states/approval.md`.
- `SHOP-003`: `docs/tasks/SHOP-003-approved-storefront-and-product-groups.md`.
- Product groups are backend-owned; only the deterministic local API associates
  products with groups. Never move filtering into domain or presentation.
- Initial URL selection is explicitly pending. A synchronous group response
  must not trigger products before the Router activates the current URL.
