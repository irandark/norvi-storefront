# Technical debt 001: Introduce the catalog domain boundary

## Status

Completed on 2026-07-25.

## Problem

The first catalog slice has a domain `Product` model and an abstract `CatalogApi`,
but `CatalogPage` still injects that data-access-shaped API directly and owns the
loading workflow.

This violates the architecture now required for every feature:

```text
Component → Domain service → Domain port ← Repository adapter → HTTP transport
```

The current naming also hides the distinction between a backend DTO, a transport
service, and a domain model.

## Desired outcome

`CatalogPage` communicates only with a catalog domain service and uses only
domain models and domain actions. HTTP, endpoint details, DTO validation, and DTO
mapping remain behind a repository adapter.

## Target structure

```text
src/app/features/catalog/
├── presentation/
│   └── pages/catalog-page/
├── domain/
│   ├── models/product.ts
│   ├── ports/product-catalog.repository.ts
│   └── services/catalog.service.ts
└── data-access/
    ├── dto/product.dto.ts
    ├── mappers/product.mapper.ts
    ├── repositories/http-product-catalog.repository.ts
    └── transport/catalog-http.service.ts
```

Names may be refined during implementation, but the layer boundaries and
dependency directions are mandatory.

## Responsibilities

### Catalog domain service

- Exposes catalog state using domain concepts.
- Provides the `load` or `retry` use case used by presentation.
- Depends only on a domain repository port.
- Owns loading, loaded, empty, and failure state transitions.
- Does not import DTOs, `HttpClient`, endpoint paths, or transport errors.

### Domain repository port

- Is declared in the domain layer.
- Returns domain `Product` models.
- Contains no DTO or HTTP terminology.

### HTTP transport service

- Is the only catalog class that uses `HttpClient`.
- Sends and receives DTOs.
- Owns the `/data/products.json` endpoint detail.
- Does not expose DTOs outside data access.

### DTO validator and mapper

- Treats HTTP response data as `unknown`.
- Produces a validated `ProductDto`.
- Maps `ProductDto` explicitly to domain `Product`.
- Keeps validation errors inside the data-access boundary.

### Catalog component

- Injects only the catalog domain service.
- Reads only domain state and models.
- Invokes domain actions such as retry.
- Does not import anything from `data-access`.

## Acceptance criteria

- `CatalogPage` has no import from `data-access`.
- `CatalogPage` does not inject `CatalogApi`, a repository, a transport, or
  `HttpClient`.
- The domain layer contains no imports from `data-access`, DTO paths, or
  `@angular/common/http`.
- Backend DTO and domain `Product` are distinct types.
- Runtime JSON validation produces a DTO before domain mapping.
- A repository adapter implements the domain port.
- Application DI wires the domain port to the repository adapter.
- Existing loading, success, empty, error, and retry behaviour remains unchanged.
- Existing browser scenarios remain green.

## Required tests

### Domain

- Initial state is loading when the catalog use case starts.
- Successful repository output becomes loaded domain state.
- An empty result becomes the empty domain state.
- Repository failure becomes a presentation-safe domain failure.
- Retry performs a new repository call and can recover.
- Domain tests use a fake domain repository without Angular HTTP utilities.

### Data access

- Valid backend data is parsed as `ProductDto`.
- Invalid DTO fields are rejected.
- Mapper converts a DTO into the expected domain model.
- Transport sends `GET /data/products.json`.
- Repository returns mapped domain products rather than DTOs.

### Presentation

- Component tests provide a fake catalog domain service.
- Tests continue to cover loading, products, empty state, failure, and retry.
- No component test configures Angular HTTP testing utilities.

### Architecture

- Add an automated check preventing imports from `presentation` to `data-access`.
- Add an automated check preventing imports from `domain` to `data-access`,
  DTO paths, and Angular HTTP.

## Migration constraints

- Preserve the current product behaviour and visual design.
- Do not combine this migration with cart functionality.
- Do not add a state-management or runtime-validation dependency.
- Do not weaken or delete existing tests to complete the migration.
- Move tests to the layer whose behaviour they verify.

## Definition of done

- All acceptance criteria have executable coverage.
- Architecture checks fail when a representative forbidden import is introduced.
- `npm run verify` passes.
- `ARCHITECTURE.md` and implementation agree.

## Verification record

- Presentation imports only `CatalogService` from the domain layer.
- Domain service tests use a fake `ProductCatalogRepository` without HTTP tools.
- DTO parsing, mapping, HTTP transport, and repository adapter have separate tests.
- A temporary forbidden presentation-to-data-access import produced the expected
  `no-restricted-imports` lint failure and was then removed.
- Unit suite: 17 tests passed across 7 files.
