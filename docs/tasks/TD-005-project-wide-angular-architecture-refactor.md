# TD-005: Refactor the project to the Angular composition rules

## Status

Backlog.

## Priority

P1 — establish a compliant project baseline before `SHOP-004` adds more code on
top of existing architectural violations.

## Problem

The project contains code written before the mandatory `HARNESS-003`
composition rules. The most visible violations are currently in `SHOP-003`:

- `CatalogService` starts group loading from its constructor;
- `CatalogPage` subscribes to Router state and registers workflow effects in
  its constructor;
- the page coordinates route navigation, canonicalization, domain state,
  announcements, viewport state, focus, keyboard navigation, outside-click,
  scroll locking, price formatting, and detailed rendering;
- the page template owns the application shell, category navigation, result
  states, product grid, and product cards;
- reusable focus/keyboard/modal mechanics are embedded in the route component;
- product domain models, ports, repository adapters, DTOs, and HTTP transport
  are trapped under the catalog route feature even though cart and later
  workflows will also consume product information;
- the catalog domain has no exact public `domain/index.ts` despite the
  cross-feature architecture contract.

These are concrete findings, not the complete scope. The task must audit every
production Angular source, feature, application-composition file, shared/core
module, and nearby test/context file against `HARNESS-003`. Equivalent
violations outside catalog are in scope and cannot be ignored because the
initial report named only one feature.

The current concentration creates hidden initialization, coupled tests, weak
reuse boundaries, and a high regression risk for every subsequent feature.

## Outcome

Establish a project-wide compliant architecture baseline. First inventory every
current module and record:

- ownership and expected consumers;
- initialization mechanism;
- route/page, facade/container, presentational, directive/UI-service, domain,
  and data-access responsibilities;
- public domain entry points and forbidden deep imports;
- constructor, subscription, Router, DOM, and cross-feature violations.

Then refactor every recorded violation. The known catalog target should become
explicit, independently testable composition boundaries while preserving all
approved behaviour and visuals:

```text
CatalogPage                         # thin route composition
└── CatalogPageFacade              # Router ↔ catalog workflow orchestration
    ├── CatalogNavigationComponent # smart UI boundary
    │   └── GroupListComponent     # input/output-only presentation
    ├── CatalogHeaderComponent     # input/output-only presentation
    ├── CatalogStateComponent      # loading/error/empty presentation
    └── ProductGridComponent
        └── ProductCardComponent

Focused directives/UI services:
- outside click;
- focus trap and focus restoration;
- roving option focus;
- body scroll lock;
- viewport adaptation when a directive/service is justified.

Reusable business capability:
features/products/
├── domain/index.ts
├── domain/models/
├── domain/ports/
└── data-access/{dto,mappers,repositories,transport}
```

The exact component split may change during the architect gate when a smaller
ownership-based decomposition satisfies the same requirements. Other current
or newly discovered modules receive equivalent ownership-based treatment.
Arbitrary line-count targets and facade dumping grounds are prohibited.

## Functional requirements

All existing product behaviour remains unchanged. For the storefront this
includes:

- frontend-owned `Все товары`;
- backend-owned group names and order;
- server-side product filtering through exact group IDs;
- URL selection, canonicalization, reload, Back, and Forward restoration;
- latest-request-wins cancellation;
- independent group/product loading, errors, retries, empty, and refetch states;
- approved desktop panel and mobile modal sheet;
- keyboard navigation, focus trap/restore, inert background, scroll lock,
  announcements, reduced motion, and long-label wrapping.

## Architecture requirements

### Explicit initialization

- Audit every injectable service, component, directive, pipe, guard, resolver,
  and application/route initializer in the project.
- Constructors and field initializers acquire dependencies and register only
  framework-required reactive primitives.
- Construction/injection alone must not start repository/HTTP work, subscribe
  to workflow streams, navigate, mutate business state, or touch the DOM.
- Every initial workflow uses one explicit, idempotent mechanism approved by the
  architect: route binding/resolver, lifecycle-to-facade activation, an actual
  application/route initializer, or a declarative
  `toSignal`/`switchMap`/resource pipeline.
- Tests prove that injection is inert and explicit activation starts each
  required workflow exactly as specified.

### Presentation composition

- Audit every route/page and non-trivial component, not only `CatalogPage`.
- Record a project-wide responsibility map and remediate every component that
  coordinates unrelated concerns without an explicit boundary.
- `CatalogPage` is a thin route composition component.
- Router query adaptation, canonical URL writes, announcements, and catalog
  workflow coordination belong to `CatalogPageFacade` or an equivalent
  explicitly named container boundary.
- Independently changing visual regions use signal inputs and outputs and do
  not inject Router, repositories, transports, or `HttpClient`.
- Domain services contain business workflow only; they do not own DOM,
  viewport, focus, or URL mechanics.
- Outside-click, focus trap/restore, roving focus, and body scroll locking move
  to focused directives or UI services with independent cleanup tests.
- Use component `host` bindings rather than `@HostListener`.
- Component-owned elements are accessed through Angular queries/references, not
  global `document.querySelector`.
- Price presentation uses a focused formatter/pipe rather than route-component
  business/UI mixing.

### Reactive workflow

- Audit all manual subscriptions and effects across the project for ownership,
  cleanup, cancellation, and state-synchronization misuse.
- Replace manually retained workflow subscriptions with declarative
  cancellation where practical.
- Latest-request-wins uses `switchMap` or an equivalent explicit mechanism.
- Error handling remains inside the request pipeline so outer route/selection
  streams stay alive.
- Use `computed` for derived state and do not use effects to synchronize
  writable state.

### Capability and module ownership

- Audit every domain model, port, service, repository, DTO, mapper, transport,
  and `core`/`shared` artifact for actual ownership and expected consumers.
- Route-specific concepts stay with the route feature; reusable business
  concepts move to named capabilities; application-wide infrastructure stays
  in `core`; business code must not be hidden in `core` or `shared`.
- Every capability exposes an exact, minimal `domain/index.ts`; deep
  cross-feature imports are removed and mechanically prohibited.
- Context files document why the boundary is local or reusable.

The known product migration is mandatory:

- Move reusable product domain models and product-loading port into a named
  `products` capability with an exact, minimal `domain/index.ts`.
- Move product DTOs, validation, mapping, HTTP transport, and repository
  adapter under the same capability's `data-access`.
- Keep catalog-specific group selection and URL browsing workflow in catalog.
- Catalog imports reusable product contracts only from
  `features/products/domain/index.ts`.
- Cart must later own a `CartLine` or product snapshot appropriate to checkout;
  it must not depend on catalog presentation or catalog data-access.
- Do not move reusable business code into generic `core`.

## Acceptance criteria

1. Quality evidence contains a complete inventory of current production Angular
   modules and a disposition for every `HARNESS-003` rule.
2. Injecting/constructing any audited service or component produces no HTTP,
   repository, navigation, DOM, timer, or business-state side effects.
3. Every initial workflow has one documented and independently tested
   activation mechanism.
4. Every route/page is either a thin composition component or has an explicit,
   architect-approved rationale and responsibility map.
5. Route, facade/container, domain, presentational, and DOM-interaction concerns
   have independent test boundaries wherever those responsibilities exist.
6. Presentational components use signal inputs/outputs and `OnPush`.
7. Reusable DOM mechanics are absent from route/page components.
8. Unjustified `@HostListener`, global component-element queries, manual
   workflow subscriptions, and state-synchronizing effects are removed
   project-wide.
9. Products have a reusable capability boundary with an exact
   `features/products/domain/index.ts`.
10. Catalog-specific selection/group models remain in catalog and do not leak
   into cart-facing product contracts.
11. Every reusable business capability has an exact public domain entry point;
    all cross-feature deep imports are removed.
12. Architecture guard tests cover reusable capability/public API rules and any
    other project-wide rule that can be enforced reliably.
13. Existing unit and browser journeys remain green without weakened
    assertions.
14. Fresh desktop/mobile visual comparison shows no material departure from
    the approved `SHOP-002` and `DESIGN-003` artifacts.
15. Production coverage remains at least 99% for statements, branches,
    functions, and lines.
16. Every affected `CONTEXT.md` documents initialization, ownership, public API,
    data flow, consumers, and verification.
17. `npm run verify` and mandatory pull-request CI pass.

## Scope

- All current production Angular and TypeScript code under `src/app`.
- All feature, capability, `core`, `shared`, application composition, provider,
  route, test, context, and architecture-guard surfaces affected by the audit.
- The catalog/product migration is the first mandatory remediation, not the
  limit of the task.
- Pure refactoring required to make the whole current project satisfy
  `HARNESS-003`.

## Exclusions

- Cart behaviour or storage.
- New product fields or backend endpoints.
- Visual redesign or material restyling.
- Search, sorting, facets, authentication, SSR, and checkout.
- New state-management or UI dependencies.
- Changing approved URL, API, accessibility, loading, error, empty, or refetch
  contracts.
- Speculative scaffolding for features that do not yet exist.

## Dependencies

- `SHOP-003` — current behaviour and approved implementation baseline.
- `HARNESS-003` — mandatory composition/capability rules.
- `TD-004` — static architecture guard.

## Risks

- A mechanical component split can preserve the monolith inside a facade.
- A catalog-only review can incorrectly declare the project compliant while
  leaving equivalent violations elsewhere.
- Moving models without separating catalog selection from product capability
  can create circular or misleading ownership.
- Initialization changes can introduce duplicate or premature HTTP requests.
- Focus/modal extraction can regress accessibility despite unit-test coverage.
- Snapshot-heavy tests can obstruct safe refactoring if they assert private
  structure instead of public behaviour.

## Design

Not applicable — this is a behaviour- and appearance-preserving refactor.
Existing approved visual artifacts remain the comparison baseline.

## Verification

- A repository-wide architecture inventory with file-level dispositions.
- Focused tests for constructor inertness and explicit activation across every
  affected module.
- Facade orchestration tests.
- Presentational input/output tests.
- Directive/UI-service focus, keyboard, outside-click, scroll-lock, and cleanup
  tests.
- Domain, mapper, transport, repository, provider-integration, and project-wide
  architecture guard tests.
- Existing and updated Playwright journeys.
- Exact desktop/mobile screenshot comparison.
- `npm run verify`.

## Definition of done

- Analyst confirms the project-wide scope, preserved behaviour, and exclusions.
- Architect records a complete pre-implementation project inventory,
  responsibility/capability map, and final project-wide `Pass`.
- Developer records every audited module's initialization, decomposition, and
  migration disposition.
- Tester records project-wide activation/boundary coverage plus browser,
  accessibility, and visual evidence.
- Reviewer independently checks the whole production tree and returns
  `Approve` with no unresolved P0–P2 findings.
- Documentation steward confirms every affected module context and source is
  current.
- Dedicated pull request passes mandatory CI and is merged.
