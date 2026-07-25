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
- architect verdict;
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
