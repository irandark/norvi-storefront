# Task specifications

Create one short Markdown file per product change before implementation.

The planning board is `docs/BACKLOG.md`. Add a stable key there before moving a
task to `Ready`. The board tracks status and dependencies; this directory owns
detailed scope and acceptance criteria.

Each task should contain:

1. User-visible outcome
2. Acceptance criteria
3. Important edge cases
4. Explicit exclusions
5. Required verification
6. Design record path for any user-visible change
7. Quality evidence using `QUALITY-EVIDENCE.template.md`

## Design gate

A task that creates or materially changes UI cannot enter implementation until
its linked design record has status `Approved`.

The task must identify:

- the design brief;
- proposed mockup variants;
- the exact approved variant;
- desktop and mobile targets;
- required states and interactions.

Non-visual refactors, test-only changes, and data-access changes may mark the
design gate `Not applicable` with a short reason.

## Architect discovery gate

After analyst completion and before orchestrator implementation readiness,
every material feature, technical-debt item, architecture proposal, or other
materially scoped task records:

- architect feedback on assumptions, constraints, risks, dependencies, and
  alternatives;
- targeted decision questions with options, trade-offs, and a recommendation
  where useful;
- the explicit human decision, rejected options, and unresolved assumptions;
- a discovery verdict of `Complete` or `Blocked`.

An unresolved material question blocks implementation and the task status must
be `Blocked`. If the proposal is fully determined, record why no material choice
remains and the human's confirmation. Do not invent questions.

Urgent defect containment may proceed only as the smallest reversible action
when delay would cause material harm. Record the urgency, deferred questions,
containment or rollback limits, and a retrospective human decision immediately
afterward.

Architect implementation constraints and final diff review remain conditional
on affected boundaries, contracts, dependencies, ownership, security, or
cross-layer behaviour. For UI changes, architect discovery is additional to,
not a replacement for, the separate design approval gate.

Completed specifications remain here as versioned product history.

## GitHub delivery contract

Every backlog task has exactly one dedicated branch and one dedicated pull
request. The pull request may contain supporting changes required by that task,
but it must not combine unrelated task keys. Direct pushes to `main` are
prohibited. Mandatory CI must pass and the pull request must be merged before
the task can move to `Done`.

## Required role evidence

Material delivery tasks record:

- analyst verdict;
- design verdict or `Not applicable`;
- architect discovery feedback and verdict;
- recorded human decisions, rejected options, and unresolved assumptions;
- architect implementation/final-review verdict or `Not applicable`;
- developer evidence;
- tester verdict;
- reviewer verdict;
- documentation verdict;
- measured line, statement, function, and branch coverage (each at least 99%);
- affected feature/module `CONTEXT.md` updates;
- orchestrator final status.

P0/P1 findings block `Done`. P2 findings require a fix or explicit human risk
acceptance. P3 findings may become backlog items.

## Status changes

When work changes state, update both the task specification and its
`docs/BACKLOG.md` row in the same change.

Statuses are maintained continuously, not reconstructed at closure. Update
`Ready`, `In progress`, `In review`, `Blocked`, and `Done` immediately when the
corresponding gate or event occurs. Before every specialist handoff and human
progress report, verify that the backlog row, task status, quality evidence,
branch/PR state, and actual work stage agree.
