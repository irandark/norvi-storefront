# Module context: catalog

## Responsibility

Owns catalog loading, domain product models, controlled UI states, DTO
validation/mapping, and the product-list presentation. It does not own cart,
checkout, or client-side product-group filtering.

## Public surface

- Catalog route presentation entry point.
- `CatalogService` domain use cases and state.
- `ProductCatalogRepository` domain port.
- Domain `Product` model using integer `priceInCents`.

## Data and control flow

```text
Catalog page
→ CatalogService
→ ProductCatalogRepository port
← HttpProductCatalogRepository
→ CatalogHttpService
→ /data/products.json
```

The repository validates unknown DTO input and maps it before domain models
cross into presentation.

## Invariants

- Components depend only on domain services and domain models.
- Domain code does not import DTO, repository adapter, transport, or HttpClient.
- DTO/HTTP details remain in `data-access`.
- Invalid external data becomes a controlled catalog failure.
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
- `presentation/pages/catalog-page/` — component consuming the domain service.
- `presentation/pages/catalog-page/_catalog-tokens.scss` — catalog-owned
  semantic style tokens referencing shared primitives.

## Verification

Run `npm run test`, `npm run lint`, and `npm run e2e`.

Catalog presentation styles consume global semantic tokens documented in
`src/styles/CONTEXT.md`. `npm run lint:styles` rejects raw colours outside the
global palette and dimensions outside owned token-definition files.

## Decisions and traps

- Architecture: `ARCHITECTURE.md`.
- Original slice: `docs/tasks/001-product-catalog.md`.
- Domain refactor: `docs/tasks/TD-001-catalog-domain-boundary.md`.
- Approved layout: `docs/design/storefront-layout/approval.md`.
- Product groups are backend-owned; do not filter a full collection only in the
  browser.
