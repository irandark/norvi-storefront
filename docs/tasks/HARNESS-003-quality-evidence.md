# Quality evidence: HARNESS-003

## Scope

Engineering-guidance change only. Production and test behaviour are unchanged.

## Recorded user requirements

- No HTTP, workflow subscriptions, navigation, business mutation, DOM work, or
  timers from constructors.
- Page components must not own route integration, remote-data orchestration,
  UI state, accessibility mechanics, and detailed rendering at the same time.
- Use facade/container boundaries for multi-concern orchestration.
- Decompose independently changing UI into signal-input/output presentational
  components.
- Extract reusable DOM behaviour into directives or focused UI services.
- Place reusable business concepts in named capability boundaries rather than
  trapping them under a route feature.
- Cross-feature consumers use an explicit `domain/index.ts`.

## Source synchronization

- `AGENTS.md`: non-negotiable rules.
- `ARCHITECTURE.md`: initialization, presentation responsibility, capability
  placement, and testing boundaries.
- `docs/agents/analyst.md`: consumers and reuse expectations.
- `docs/agents/architect.md`: pre/post implementation verdicts.
- `docs/agents/developer.md`: implementation duties and prohibitions.
- `docs/agents/tester.md`: independent activation and boundary tests.
- `docs/agents/reviewer.md`: blocking review checks.
- `docs/agents/orchestrator.md`: entry and exit evidence gates.
- `docs/agents/documentation-steward.md`: module-context synchronization.

## Exemptions

- Designer: Not applicable — no user-facing UI or design decision.
- Developer implementation: Not applicable — no executable code changed.
- Runtime architecture migration: deferred to a separate task; HARNESS-003
  changes the rules that govern that future refactor.

## Verification

- `git diff --check` — pass.
- `npm run verify` — pass.
- Static lint, style-token guard, and architecture guard — pass.
- Unit tests — 69/69 pass.
- Coverage — 100% statements, branches, functions, and lines.
- Production build — pass without warnings.
- Playwright — 11/11 pass.

## Current verdict

`In review`. Local evidence is green; mandatory pull-request CI and merge are
still required before `Done`.
