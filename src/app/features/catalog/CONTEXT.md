# Module context: catalog

## Responsibility

Owns URL-driven catalog browsing, product-group loading and selection, controlled
UI states, and responsive storefront presentation. Reusable product loading is
owned by `features/products`. Catalog does not own cart, checkout, or
client-side product-group filtering.

## Public surface

- Catalog route presentation entry point.
- `domain/index.ts` exports only `ProductGroupRepository` for application-root
  DI wiring.
- `CatalogService`, `ProductGroup`, and `CatalogSelection` are feature-local
  domain APIs; cross-feature consumers must not deep-import them.

## Data and control flow

```text
CatalogPage lifecycle
→ CatalogPageFacade Router/query adapter
→ CatalogService
→ ProductGroupRepository / products ProductRepository ports
← HttpProductGroupRepository / HttpProductRepository
→ ProductGroupHttpService / ProductHttpService
→ GET /api/product-groups
→ GET /api/products[?groupId=...]
```

`CatalogPage.ngOnInit()` explicitly activates the idempotent facade, which binds
the route before explicitly activating `CatalogService`. Injection alone is
inert. The service resolves URL slugs against ordered backend groups, owns the
canonical selection and independent group/product state. Product requests use
one `switchMap` pipeline, so a newer selection cancels the prior request; inner
`catchError` keeps the outer workflow alive. The transport requests
`unknown`; parsers validate DTOs and repositories map distinct domain values
before they cross into presentation.

## Invariants

- The route page depends on its presentation facade and visual children.
- Input/output visual components may use domain-facing types and focused
  presentation utilities, but never Router, repositories, transports, DTOs, or
  `HttpClient`.
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
- `domain/index.ts` — exact application-composition DI entry point.
- `domain/ports/product-group.repository.ts` — catalog-owned group contract.
- `data-access/repositories/http-product-group.repository.ts` — group adapter.
- `data-access/transport/product-group-http.service.ts` — group endpoint.
- `../products/CONTEXT.md` — reusable product capability.
- `scripts/dev-server.mjs` — temporary browser-observable deterministic local
  API and Angular development proxy; it is outside the production bundle.
- `presentation/pages/catalog-page/` — thin lifecycle/composition route.
- `presentation/facades/catalog-page.facade.ts` — Router/domain orchestration,
  canonicalization, and live announcements.
- `presentation/components/` — OnPush signal input/output visual regions.
- `../../shared/presentation/directives/` — reusable focus, keyboard,
  outside-click, and body-scroll-lock behaviour.
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
