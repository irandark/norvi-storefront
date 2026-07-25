# HARNESS-003: Enforce Angular composition and capability boundaries

## Status

Done — the agent, architecture, and role-contract sources are synchronized.
Dedicated [pull request #7](https://github.com/irandark/norvi-storefront/pull/7)
passed mandatory CI and was squash-merged into `main` as
`0fa1f4a769a803d9bcc05d8fab8104fe1ac66bc5`.

## Priority

P1 — these rules apply before the next product implementation task.

## User requirement

Agent-written Angular code must avoid constructor workflows, monolithic
page/components, mixed navigation/data/UI responsibilities, and route-local
ownership of reusable business capabilities.

## Outcome

Every delivery role evaluates and records:

1. the explicit initialization mechanism;
2. the page/component responsibility map;
3. whether a facade/container is required;
4. which visual regions are input/output-only components;
5. which DOM behaviours belong in directives or UI services;
6. the expected consumers and placement of each domain/data-access capability;
7. the exact public `domain/index.ts` used by cross-feature consumers.

## Requirements

- Constructors and field initializers perform dependency acquisition and
  framework-required reactive registration only.
- Construction/injection never starts HTTP, repository requests, workflow
  subscriptions, navigation, business mutations, DOM work, or timers.
- Initial workflows use a resolver, initializer, lifecycle-to-facade call, or
  explicit declarative resource/pipeline.
- Route/page components remain thin composition roots.
- Coordinating three or more concerns/services requires an explicit facade
  decision and recorded rationale.
- Independently changing visual regions become signal-input/output
  presentational components.
- Reusable focus, keyboard, outside-click, scroll-lock, and viewport behaviour
  becomes focused directives or UI services.
- Decomposition follows ownership and reasons to change, not line-count quotas.
- Reusable business concepts use named capability boundaries, not route-local
  internals and not generic `core`.
- Cross-feature imports use only the capability's exact `domain/index.ts`.
- Consumers use their own snapshot/value model when they do not need the source
  aggregate itself.

## Acceptance criteria

1. `AGENTS.md` marks all requirements as non-negotiable.
2. `ARCHITECTURE.md` defines initialization, presentation decomposition, and
   capability-placement rules with approved examples.
3. Developer duties/prohibitions require an initialization mechanism,
   responsibility map, and capability rationale.
4. Architect output includes explicit constructor, decomposition, and
   capability-placement verdicts.
5. Reviewer output includes the same independent verdicts and blocks
   monolithic-but-tested code.
6. Tester independently checks construction activation and the extracted
   facade/component/directive boundaries.
7. Analyst records known consumers/reuse expectations and the orchestrator
   blocks implementation/closure when required architecture evidence is absent.
8. Documentation stewardship verifies the same ownership map in module context.
9. The rules do not mandate arbitrary component sizes or move business code
   into `core`.
10. All edited Markdown passes `git diff --check`; the repository quality gate
   remains green.

## Design

Not applicable — this task changes engineering rules, not user-facing UI.

## Exclusions

- Refactoring the existing SHOP-003 implementation.
- Adding a new state-management dependency.
- Defining the future cart/product integration contract.
- Mechanical lint rules for component responsibility; those require a separate
  task if useful static checks can be defined without false confidence.

## Verification

- Inspect every changed role contract against these acceptance criteria.
- Run `git diff --check`.
- Run `npm run verify`.

## Definition of done

- The documentation steward confirms all agent and architecture sources agree.
- `npm run verify` passes.
- The dedicated pull request passes mandatory CI and is merged.
