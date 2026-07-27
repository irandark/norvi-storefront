# Quality evidence: TD-005

## Intake

- Analysis verdict: `Complete`; project-wide scope, preserved behaviour,
  edge cases, consumers, exclusions, and visual baseline were fully specified.
- Architect discovery feedback: split catalog group browsing from reusable
  products; use explicit lifecycle activation, a thin page, a route/domain
  facade, input/output visual components, and reusable UI directives.
- Architect decision questions, options, and trade-offs: confirm the
  ownership-based target versus catalog-local products, a facade monolith, or
  new NgRx/CDK/UI dependencies.
- Architect recommendation: ownership-based catalog/products capabilities and
  separate business-agnostic interaction directives.
- Human architect decisions and rejected options: approved reusable directives
  for focus, keyboard/roving focus, outside-click, and scroll-lock; rejected
  page-specific utilities and the alternatives above.
- Unresolved assumptions: none.
- Architect discovery verdict: `Complete`.
- Design verdict: `Not applicable`; behaviour and appearance are preserved
  against `SHOP-002` and `DESIGN-003`.
- Human approvals: architecture/directive decision approved in task thread.
- Role activation plan: analyst → architect → developer → tester/reviewer/
  documentation/architect final review → orchestrator.
- Exemptions and rationale: none.

## Delivery loop — iteration 1

- Iteration: 1.
- Reason for this iteration: initial TD-005 implementation.
- Active roles: developer, tester, reviewer, documentation steward, architect,
  and orchestrator.
- Architect implementation constraints: recorded in the task specification.
- Architect final-review verdict: `Pass`; no open P0–P3 architecture findings.
- Developer evidence: products capability split; explicit inert activation;
  thin page/facade/components; four reusable directives; focused and browser
  regressions corrected.
- Tester verdict: `Pass`; no open P0–P2 findings.
- Coverage (lines / statements / functions / branches):
  `100% / 100% / 100% / 99.15%`.
- Coverage exclusions reviewed: no new exclusions.
- Reviewer verdict: `Approve`; no open P0–P3 findings.
- Documentation verdict: `Current`; no open P0–P3 documentation findings.
- Module context files checked: `src/app/CONTEXT.md`,
  `src/app/features/catalog/CONTEXT.md`,
  `src/app/features/products/CONTEXT.md`,
  `src/app/shared/presentation/CONTEXT.md`.

## Project-wide production inventory

| Files | Ownership / initialization / HARNESS-003 disposition |
| --- | --- |
| `app.ts`, `app.html` | RouterOutlet-only shell; construction inert; pass. |
| `app.routes.ts` | Exact lazy presentation entry; no workflow; pass. |
| `app.config.ts` | Narrow DI composition for catalog groups/products; no workflow; pass. |
| `catalog/domain/models/product-group.ts`, `domain/index.ts` | Catalog-owned group/selection values and minimal domain surface; pure; pass. |
| `catalog/domain/ports/product-group.repository.ts` | Catalog group port; pure contract; pass. |
| `catalog/domain/services/catalog.service.ts` | Catalog workflow state; injection inert, explicit idempotent `activate`, latest request wins; remediated/pass. |
| `catalog/data-access/dto/product-group.dto.ts`, `parse-product-group-dtos.ts` | Catalog external validation boundary; pure; pass. |
| `catalog/data-access/mappers/product-group.mapper.ts` | Pure group mapping; pass. |
| `catalog/data-access/transport/product-group-http.service.ts` | Cold group HTTP request; injection inert; pass. |
| `catalog/data-access/repositories/http-product-group.repository.ts` | Catalog group adapter; injection inert; pass. |
| `products/domain/models/product.ts`, `ports/product.repository.ts`, `index.ts` | Reusable Product/read capability with exact cross-feature API; migrated/pass. |
| `products/data-access/dto/product.dto.ts`, `parse-product-dtos.ts` | Product external validation boundary; pure; migrated/pass. |
| `products/data-access/mappers/product.mapper.ts` | Pure product mapping; migrated/pass. |
| `products/data-access/transport/product-http.service.ts` | Cold product HTTP request; injection inert; migrated/pass. |
| `products/data-access/repositories/http-product.repository.ts` | Product adapter; injection inert; migrated/pass. |
| `catalog/presentation/pages/catalog-page/catalog-page.ts`, `catalog-page.html` | Thin lifecycle/composition root; explicit facade activation; remediated/pass. |
| `catalog/presentation/facades/catalog-page.facade.ts` | Router/domain orchestration and announcements; inert before idempotent activation; stale instructions suppressed; remediated/pass. |
| `catalog/presentation/components/catalog-header/catalog-header.ts` | OnPush signal input/output header; no service injection; pass. |
| `catalog/presentation/components/catalog-navigation/catalog-navigation.ts` | OnPush signal input/output navigation composition; delegates DOM behaviour to directives; pass. |
| `catalog/presentation/components/catalog-results/catalog-results.ts` | OnPush signal input/output state/grid presentation; pass. |
| `catalog/presentation/components/product-card/product-card.ts` | OnPush input-only product presentation; pass. |
| `catalog/presentation/pipes/rub-price.pipe.ts` | Pure focused money formatting; pass. |
| `shared/presentation/directives/focus-trap-restore.directive.ts` | Explicit host-scoped focus lifecycle; inert while disabled; cleanup tested; remediated/pass. |
| `shared/presentation/directives/roving-focus.directive.ts` | Host-bound, business-agnostic keyboard focus; pass. |
| `shared/presentation/directives/outside-click.directive.ts` | Explicit document listener lifecycle; destroy cleanup tested; pass. |
| `shared/presentation/directives/body-scroll-lock.directive.ts` | Reusable caller-supplied lock class with per-class reference counting; cleanup tested; pass. |

## Findings

| ID | Severity | Owner | Status | Evidence or accepted-risk decision |
| --- | --- | --- | --- | --- |
| TD005-F1 | P1 | Developer | Fixed | Desktop initial focus was missing after the first directive integration; E2E now passes. |
| TD005-F2 | P1 | Developer | Fixed | Focus restore ran before mobile `inert` removal; restoration now runs in the next microtask and E2E passes. |
| TD005-F3 | P1 | Developer | Fixed | Facade construction replayed stale canonicalization; effects now register only during idempotent activation and stale IDs are baselined. |
| TD005-F4 | P2 | Developer | Fixed | Shared body lock hardcoded a catalog class; callers now supply independently reference-counted classes. |
| TD005-F5 | P2 | Developer | Fixed | Product requests used a retained subscription; one `switchMap` pipeline now owns latest-only cancellation with inner error recovery. |
| TD005-F6 | P2 | Developer | Fixed | Viewport initialization now occurs only in explicit `ngOnInit`; construction-inertness is tested. |
| TD005-F7 | P2 | Developer | Fixed | Product announcements are computed; only canonical Router work remains in an effect. |
| TD005-F8 | P2 | Developer | Fixed | App composition and provider integration consume catalog’s exact `domain/index.ts`. |
| TD005-F9 | P2 | Developer | Fixed | Product retry now clears a canonical recovery override so refetch announcements remain observable. |

## Final gate

- Focused checks: 99 unit/integration tests pass; architecture and style guards
  pass; 11 Playwright journeys pass.
- `npm run verify`: pass.
- 99% coverage gate: pass (`100 / 100 / 100 / 99.15`).
- Visual comparison when applicable: pass. Fresh 1440×1000 and 375×812
  screenshots under `output/playwright/` visually match the iteration-4 loaded
  approved baseline with no material layout, typography, grid, card, spacing,
  or responsive departure.
- Open accepted risks: none.
- Orchestrator final status: `In review`; all local specialist verdicts pass.
  Dedicated commit/PR, mandatory CI, and merge remain pending.
