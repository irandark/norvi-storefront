# Architecture

## Core principle

Every business feature has an explicit domain layer. Components communicate in
the language of domain models and use cases. They must not know how data is
transported, which endpoint is called, or what shape the backend DTO uses.

The required dependency flow is:

```text
Presentation
    Component
        │ domain models and use cases
        ▼
Domain
    Domain service
        │ domain port
        ▼
Data access
    Repository adapter
        │ maps domain models ↔ DTOs
        ▼
    HTTP transport service
        │ DTOs
        ▼
    HttpClient
```

Runtime dependency injection connects the domain port to its data-access
implementation. Compile-time imports continue to point toward the domain.

## Feature structure

Each feature follows this shape when its layers are needed:

```text
src/app/features/<feature>/
├── presentation/
│   ├── pages/
│   └── components/
├── domain/
│   ├── models/
│   ├── ports/
│   └── services/
└── data-access/
    ├── dto/
    ├── mappers/
    ├── repositories/
    └── transport/
```

Do not create empty directories in anticipation of future work.

## Layer responsibilities

### Presentation

- Contains pages, components, templates, and purely presentational formatting.
- Injects domain services only.
- Reads domain models and invokes domain use cases.
- Owns ephemeral view-only state such as an open menu.
- Does not import DTOs, repositories, transport services, `HttpClient`, endpoint
  constants, or response validators.
- Does not translate backend errors or backend status codes.

### Domain

- Contains business models, invariants, ports, and domain services.
- Uses business language rather than backend or UI terminology.
- Domain services expose use cases and feature state to presentation.
- Domain ports describe required capabilities using domain models.
- Does not import Angular HTTP APIs, DTOs, transport implementations, browser
  storage APIs, or component types.
- Remains testable without Angular HTTP testing utilities.

### Data access

- Contains backend DTOs and all transport-specific code.
- HTTP transport services use `HttpClient` and communicate using DTOs.
- Runtime response validation happens at this boundary.
- Mappers convert validated DTOs into domain models and domain commands into DTOs.
- Repository adapters implement domain ports and compose transport plus mapping.
- Backend field names, URLs, status codes, and serialization rules stay here.

## Model rules

- Domain models represent business meaning and enforce domain invariants.
- DTOs represent the backend contract and may not be used in presentation.
- A DTO and a domain model remain separate even when their current fields happen
  to be identical.
- Money in domain models uses integer minor units, for example `priceInCents`.
- External `unknown` data becomes a validated DTO before mapping to a domain model.
- Mapping is explicit and independently tested.

## Dependency rules

Allowed imports:

```text
presentation → domain
data-access  → domain
domain       → domain
```

Forbidden imports:

```text
presentation ⇢ data-access
presentation ⇢ HttpClient
domain       ⇢ data-access
domain       ⇢ DTO
domain       ⇢ HttpClient
```

Cross-feature access goes through an explicitly exported domain API. A feature
must not import another feature's presentation or data-access internals.
The only cross-feature compile-time entry point is the target feature's exact
`domain/index.ts`; importing deeper domain files bypasses that public API and is
forbidden.

Application-wide infrastructure belongs in `core`. Reusable presentational UI
without business ownership belongs in `shared`.

The application composition root is deliberately narrow: `app.config.ts` may
import domain ports/services and data-access implementations to wire dependency
injection, while `app.routes.ts` may dynamically import feature presentation
entry points for route loading. Other application files must not import feature
internals.

## State ownership

- Domain services own feature state that represents a business workflow.
- Components observe domain state and dispatch domain actions.
- Components do not coordinate multiple HTTP/data-access services.
- Signals may expose state to components; RxJS may coordinate asynchronous work
  inside domain or data-access services.
- Cancellation, queuing, and retry semantics must reflect the business use case
  and have behavioural tests.

## Testing boundaries

- Domain tests cover invariants, use cases, and state transitions without HTTP.
- Mapper tests cover DTO validation and conversion into domain models.
- Transport tests cover URLs, methods, headers, and DTO serialization with
  Angular HTTP testing utilities.
- Component tests replace domain services, never HTTP transports.
- Integration tests verify the domain port is wired to its repository adapter.
- Playwright covers a small number of critical user journeys.

## Mechanical enforcement

`npm run lint:architecture` uses the TypeScript compiler API and root TypeScript
configuration to inspect production and colocated test sources. It resolves
relative imports and configured aliases, and checks static imports, type-only
imports/re-exports, and dynamic imports. Diagnostics are stable and include the
project-relative source path, line, and violated rule.

- presentation cannot import from `data-access`;
- presentation cannot import Angular HTTP APIs;
- domain cannot import from `data-access`, Angular HTTP, presentation, or
  browser storage globals;
- one feature can consume another only through the exact `domain/index.ts`;
- the composition-root exceptions above are enforced by file and import kind.

Enforcement follows resolved ownership rather than filename suffixes: comments,
ordinary strings, unresolved imports, and domain types with DTO-like names do
not produce architecture findings. Locally shadowed storage names are not
treated as browser globals. TypeScript and ESLint remain responsible for
unresolved-module diagnostics.
