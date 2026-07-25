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

Route ownership and reusable business capability ownership are different
boundaries. A route feature owns the workflow unique to that route. A business
concept expected to serve multiple workflows owns a capability boundary:

```text
src/app/features/products/
├── domain/
│   ├── index.ts
│   ├── models/
│   └── ports/
└── data-access/
    ├── dto/
    ├── mappers/
    ├── repositories/
    └── transport/

src/app/features/catalog/
├── domain/          # catalog selection and browsing workflow
└── presentation/    # catalog route composition
```

Do not move reusable business code to `core`. Promote it to a named capability
with explicit ownership and a minimal public domain API. Before creating
feature-local domain/data-access code, record the expected consumers and why
the chosen boundary is route-specific or reusable.

## Layer responsibilities

### Presentation

- Contains pages, components, templates, and purely presentational formatting.
- Injects domain services only.
- Reads domain models and invokes domain use cases.
- Owns ephemeral view-only state such as an open menu.
- Does not import DTOs, repositories, transport services, `HttpClient`, endpoint
  constants, or response validators.
- Does not translate backend errors or backend status codes.
- A route/page component is a thin composition root. It binds route data or
  route parameters to a facade/container, supplies state to child views, and
  translates child outputs into use cases.
- A facade owns presentation orchestration when a surface coordinates three or
  more concerns such as route state, domain state, announcements, or several
  services. A facade must not absorb reusable DOM mechanics.
- Presentational components receive state through signal inputs and expose user
  intent through outputs. They do not inject Router, domain repositories,
  transports, or page-level orchestration services.
- Reusable DOM interaction belongs in focused directives or UI services:
  outside-click, focus trap/restore, roving focus, scroll lock, and viewport
  adaptation are not page-business logic.
- Split a component when regions or behaviours have independent reasons to
  change. Line count is supporting evidence, not the decision rule.

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

## Initialization and constructor rules

Constructors and field initializers may acquire dependencies and register
framework-required reactive primitives. They must not:

- initiate HTTP or repository requests;
- subscribe to route, domain, or workflow streams;
- navigate or canonicalize URLs;
- mutate business state;
- read or mutate the DOM;
- start timers or other externally visible work.

Initial work starts through one explicit, testable mechanism:

- a route resolver or route input when data is required for navigation;
- an application/route initializer for true bootstrap work;
- a lifecycle method delegating to an idempotent facade use case;
- a declarative `toSignal`/`resource` pipeline whose input is explicit and whose
  cancellation/error semantics are tested.

An Angular `effect` may be registered in an injection context, but it is for
external side effects, never for synchronizing writable state or hiding initial
business workflows. Prefer `computed`, `linkedSignal`, `switchMap`, and
`toSignal` for derived/reactive state.

## Testing boundaries

- Domain tests cover invariants, use cases, and state transitions without HTTP.
- Mapper tests cover DTO validation and conversion into domain models.
- Transport tests cover URLs, methods, headers, and DTO serialization with
  Angular HTTP testing utilities.
- Component tests replace domain services, never HTTP transports.
- Integration tests verify the domain port is wired to its repository adapter.
- Playwright covers a small number of critical user journeys.
- Facade tests cover route-to-use-case orchestration without rendering the full
  page.
- Presentational component tests use inputs/outputs and do not configure HTTP or
  Router unless the component is itself the route boundary.
- Directive/UI-service tests cover focus, keyboard, outside-click, scroll-lock,
  and cleanup independently from business-state tests.
- Tests must prove that constructing or injecting a service does not start a
  repository/HTTP workflow unless the documented initialization mechanism is
  explicitly activated.

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
