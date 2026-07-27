# Module context: products

## Responsibility

Owns the reusable product aggregate and read capability. It validates and maps
the `/api/products` contract. Catalog groups, URL selection, cart snapshots,
and presentation are explicitly outside this capability.

## Public surface

`domain/index.ts` is the exact cross-feature entry point. It exports `Product`
and `ProductRepository`.

## Data and control flow

```text
Consumer domain service
→ ProductRepository
← HttpProductRepository
→ ProductHttpService
→ GET /api/products[?groupId=...]
```

The HTTP response is accepted as `unknown`, validated as product DTOs, and
mapped to distinct domain values.

## Invariants

- Cross-feature consumers import only `domain/index.ts`.
- Money is stored as integer `priceInCents`.
- DTO, validation, mapping, transport, and adapter details stay in
  `data-access`.
- Optional `groupId` is an exact server-side filter; the capability does not
  own product-group meaning.

## Dependencies

Angular DI/HTTP and RxJS. Runtime providers are wired in `app.config.ts`.

## Key files

- `domain/index.ts` — exact public domain API.
- `domain/ports/product.repository.ts` — product-loading port.
- `data-access/repositories/http-product.repository.ts` — adapter.
- `data-access/transport/product-http.service.ts` — endpoint ownership.

## Verification

Run the colocated domain/data-access tests, `npm run lint:architecture`, and
`npm test`.

## Decisions and traps

Product groups remain catalog-owned. Future cart code should own a cart-line
snapshot rather than depend on catalog presentation or data access. See
`docs/tasks/TD-005-project-wide-angular-architecture-refactor.md`.
