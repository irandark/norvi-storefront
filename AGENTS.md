# Northstar Market agent guide

This file is the map, not the full project manual. Read the linked documents
that are relevant to the task before changing code.

## Project

Northstar Market is a small Angular storefront used to practise harness-driven
development. Deliver product changes as narrow, testable vertical slices.

## Sources of truth

- Product scope and exclusions: `docs/product/storefront.md`
- Task board and delivery order: `docs/BACKLOG.md`
- Architecture and dependency rules: `ARCHITECTURE.md`
- Design workflow and approval rules: `docs/design/README.md`
- Multi-agent delivery roles: `docs/agents/`
- Task acceptance criteria: `docs/tasks/`

## Working agreement

1. The analyst inspects existing sources and clarifies the human's goal until
   the analysis completion gate in `docs/agents/analyst.md` passes.
2. Find or create the work item in `docs/BACKLOG.md` and its detailed task spec.
3. For every material task, the architect conducts discovery, gives the human
   actionable feedback, and records decisions or unresolved blockers.
4. For new or materially changed UI, the designer completes the design gate and
   obtains explicit human approval. Otherwise record `Design: Not applicable`.
5. The orchestrator accepts the complete handoff and records role activation.
6. When architecture applies, the architect records implementation constraints
   before the developer implements the smallest coherent change with focused
   tests.
7. The tester, reviewer, documentation steward, and, when architecture applies,
   architect produce independent verdicts.
8. Findings return to the responsible role and the relevant stages repeat.
9. The orchestrator runs `npm run verify`, performs required visual comparison,
   and closes only when the exit gate in `docs/agents/orchestrator.md` passes.

## Live status discipline

- Treat `docs/BACKLOG.md` as live operational state, not an end-of-task report.
- Update a task's backlog row and detailed specification immediately whenever
  it enters `Ready`, `In progress`, `In review`, `Blocked`, or `Done`.
- Record the status transition in the same commit or pull request change that
  establishes it. Do not postpone status cleanup until handoff or closure.
- Before every handoff and before reporting progress to the human, verify that
  backlog, task specification, quality evidence, branch/PR state, and actual
  work stage agree.
- If work resumes after a finding or blocker, update the status before the next
  specialist begins. A stale status is a process defect and must be corrected
  immediately.

## Required commands

- `npm run lint` — static analysis
- `npm run test` — unit tests once
- `npm run build` — production build
- `npm run e2e` — browser smoke and user-journey tests
- `npm run verify` — complete local quality gate

## Non-negotiable rules

- Human approval cannot be inferred or replaced by an agent.
- Every material feature, technical-debt item, architecture proposal, or other
  materially scoped task requires architect-led discovery after analyst
  completion and before implementation readiness. Unresolved material
  questions block implementation.
- When waiting would cause material harm, an urgent defect may bypass the normal
  discovery gate only for the smallest reversible containment. Record the
  urgency, containment limits and rollback, and deferred questions before
  activation; obtain the retrospective human decision immediately afterward.
- Analyst, designer, developer, architect, tester, reviewer, and documentation
  steward are independent assignments when their roles apply.
- The orchestrator activates and releases agents only for bounded work and
  repeats the delivery loop until `Complete` or genuinely `Blocked`.
- A developer cannot approve its own implementation.
- P0/P1 findings block `Done`; P2 requires a fix or explicit human acceptance;
  P3 may be moved to the backlog.
- Production code must maintain at least 99% line, statement, function, and
  branch coverage. The tester records measured coverage and blocks regressions.
- Every feature or independently owned module keeps a concise `CONTEXT.md`
  following `docs/context/CONTEXT.template.md`.
- The documentation steward keeps module context synchronized with code and
  optimized for fast, low-token agent onboarding.
- Every backlog task is delivered through its own GitHub branch and pull
  request. A pull request must not combine unrelated task keys.
- Direct delivery to `main` is prohibited. A task reaches `Done` only after its
  dedicated pull request passes mandatory CI and is merged.

- Constructors are for dependency acquisition and framework-required reactive
  registration only. They must not start HTTP requests, subscribe to workflow
  streams, navigate, mutate business state, or perform DOM work. Initial
  workflows start explicitly through route resolution, an application/route
  initializer, a lifecycle method, or an idempotent facade use case.
- Route/page components are composition roots, not feature implementations.
  They bind route inputs to a facade, render child components, and translate
  child outputs into use cases. They do not simultaneously own navigation,
  remote-data orchestration, announcements, focus management, scroll locking,
  keyboard interaction, and detailed rendering.
- When a presentation surface coordinates three or more concerns or services,
  introduce a facade/container boundary. Extract independently testable visual
  regions into input/output-only presentational components. Extract reusable
  DOM behaviour such as outside-click, focus trapping, roving focus, and scroll
  locking into focused directives or UI services.
- Do not use one large component/template when responsibilities have independent
  reasons to change. Decomposition must follow ownership and behaviour, not an
  arbitrary line-count target.
- Before placing a domain model, port, repository, DTO, or HTTP transport under
  a route feature, evaluate its consumers. Reusable business capabilities such
  as products belong to their own capability boundary with an explicit
  `domain/index.ts`; route features compose that public API. `core` is not a
  dumping ground for reusable business code.
- Cross-feature consumers import only the capability's exact public domain
  entry point. A consuming feature owns its own task-specific snapshot/value
  model when it does not require the source aggregate itself.
- Every business feature has an explicit domain layer.
- Components inject domain services only and communicate using domain models and
  use cases.
- Components must not import DTOs, repositories, transport services, or
  `HttpClient`.
- Domain services depend on domain ports, never on DTO or HTTP implementations.
- HTTP transport services and DTOs remain in `data-access`; repository adapters
  validate, map, and implement domain ports.
- Store money as integer minor units, for example `priceInCents`.
- Keep business rules independent from component templates.
- Do not weaken, skip, or delete a failing check to make a change pass.
- Do not add a dependency when the platform already provides a clear solution.
- Update the relevant source-of-truth document when behaviour or architecture changes.
- Keep `docs/BACKLOG.md` and the detailed task status synchronized.
- Keep task statuses continuously current throughout delivery; updating them
  only at the end is prohibited.
- Do not implement or materially restyle user-facing UI without an approved
  design record.
- A designer agent must not approve its own work. Only explicit human approval
  can change a design record to `Approved`.

## Role contracts

- Analyst: `docs/agents/analyst.md`
- Designer: `docs/agents/designer.md`
- Orchestrator / Tech Lead: `docs/agents/orchestrator.md`
- Developer: `docs/agents/developer.md`
- Architect: `docs/agents/architect.md`
- Tester: `docs/agents/tester.md`
- Reviewer: `docs/agents/reviewer.md`
- Documentation steward: `docs/agents/documentation-steward.md`
- Quality evidence template: `docs/tasks/QUALITY-EVIDENCE.template.md`
