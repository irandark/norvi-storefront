# TD-004: Enforce architecture boundaries with a tested static import guard

## Status

In progress.

## Outcome

New changes cannot silently bypass the dependency rules in `ARCHITECTURE.md`.
Local lint and CI reject forbidden feature-layer imports with a deterministic,
actionable diagnostic before they reach review.

## Design

Design: Not applicable — this task changes developer tooling and architecture
documentation only. It does not change user-facing behaviour or presentation.

## Requirements

- Inspect TypeScript dependency surfaces below `src/app/features/<feature>`,
  including production and colocated test files.
- Reject presentation dependencies on data access, Angular HTTP APIs, DTOs,
  repository/transport implementations, and response validators.
- Reject domain dependencies on data access, DTOs, Angular HTTP APIs, browser
  storage APIs, and presentation/component types.
- Reject direct access from one feature to another feature's presentation or
  data-access internals.
- Permit cross-feature compile-time access only through an explicit public
  domain API convention recorded by the architect.
- Permit data access to depend on its own domain and transport tooling.
- Preserve a narrow application composition-root exception for DI wiring.
- Inspect static imports, re-exports, type-only imports/exports, and dynamic
  imports without treating comments or ordinary strings as dependencies.
- Normalize relative paths and configured project aliases consistently.
- Report project-relative file, line, and violated rule; fail with a non-zero
  status when violations exist.
- Add focused positive and negative tests for every rule and important
  exception.
- Run the architecture guard from `npm run lint`, and therefore from
  `npm run verify`, without weakening the existing ESLint or style-token gates.

## Acceptance criteria

1. Presentation-to-data-access imports in the same feature are rejected.
2. Presentation and production components cannot import Angular HTTP APIs,
   DTOs, repositories, transports, or response-validation internals.
3. Domain cannot import data access, DTOs, Angular HTTP, browser storage, or
   presentation/component types.
4. Feature A cannot import Feature B presentation or data-access internals.
5. Presentation-to-own-domain, data-access-to-own-domain, and
   domain-to-own-domain dependencies pass.
6. Cross-feature imports through the documented public domain API pass while
   imports that bypass it fail.
7. Application composition-root DI wiring passes; equivalent feature
   presentation/domain imports fail.
8. Static imports, `import type`, `export ... from`, `export type ... from`,
   and dynamic `import()` cannot bypass the same rules.
9. Diagnostics include the project-relative source path, line, and reason, and
   violations produce a non-zero process status.
10. Tests cover relative traversal, applicable aliases, nested paths, colocated
    specs, legal similar names, and stable diagnostic ordering.
11. `npm run lint` runs ESLint, the existing style-token guard, and the new
    architecture guard; all current valid sources pass.
12. `ARCHITECTURE.md` and relevant `CONTEXT.md` files describe the actual
    enforcement boundary, public API convention, and composition-root exception.

## Edge cases

| Scenario | Required result |
| --- | --- |
| Type-only import or re-export | Enforce the same boundary as a value import. |
| Barrel re-export | Cannot hide access to a forbidden boundary. |
| Dynamic import | Enforce the same boundary; root route loading remains allowed. |
| Relative traversal or configured alias | Resolve to the same owned layer. |
| `dto` in a comment, string, or domain type name | Do not report a dependency violation. |
| Domain model resembles a DTO name | Ownership and resolved boundary decide, not the suffix. |
| Presentation/domain tests | Same layer restrictions; domain tests may use Angular core/TestBed but not HTTP testing. |
| Data-access transport tests | Angular HTTP testing remains allowed. |
| Application root/config | May compose implementations and ports for DI, but is not a feature public API. |
| Unresolved import | Leave the primary diagnostic to TypeScript/ESLint; do not mask it. |

## Scope

- Static architecture guard and focused tests/fixtures.
- Package-script and lint integration.
- Architecture, module-context, backlog, task, and quality-evidence updates.
- Only minimal remediation of pre-existing imports required to enable the
  agreed guard.

## Explicit exclusions

- `SHOP-003` implementation, storefront behaviour, API contracts, URL state, or
  design.
- Cart or checkout architecture designed in advance.
- Empty feature-layer scaffolding.
- Runtime authorization or a complete semantic analysis of DI/object flow.
- Monorepo module-boundary redesign or a third-party architecture framework.
- Replacing code review or the documented architecture.

## Dependencies and assumptions

- Depends on `TD-001` (`Done`) and the current `ARCHITECTURE.md`.
- `src/app/features/<feature>/{presentation,domain,data-access}` remains the
  canonical feature boundary.
- The task is delivered in its own branch and pull request.
- Before merge, the guard is checked against the latest `SHOP-003` state to
  avoid a parallel-development integration surprise.

## Risks and deferrals

- Path-only enforcement can miss aliases/barrels or create false positives;
  tests must prove boundary outcomes rather than filename folklore.
- An overly broad guard can block legitimate test tooling or root DI wiring.
- ESLint and a separate guard can drift; the enforced contract and ownership
  must remain explicit.
- Broader core/shared dependency rules are deferred unless the architect can
  encode them without inventing ownership that the project has not defined.

## Required verification

- Focused guard unit/fixture tests pass.
- A representative forbidden import fails with the expected diagnostic.
- Current valid application sources pass the guard.
- `npm run lint`, `npm run test`, `npm run build`, `npm run e2e`, and
  `npm run verify` pass.
- Production coverage remains at least 99% for lines, statements, functions,
  and branches.
- The final diff is independently reviewed by architect, tester, reviewer, and
  documentation steward.

## Definition of done

- Every acceptance criterion has executable or inspectable evidence.
- Required specialist verdicts are non-blocking.
- No open P0/P1 findings remain; P2 findings are fixed or human-accepted.
- The dedicated pull request passes mandatory CI and is merged.
- Backlog and task status are synchronized.
