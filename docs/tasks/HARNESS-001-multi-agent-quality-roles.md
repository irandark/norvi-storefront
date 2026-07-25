# HARNESS-001: Independent quality roles for every delivery task

## Status

Completed on 2026-07-25.

## Priority

P0 — must be completed before the next implementation task enters `Ready`.

## Problem

The current harness defines implementation, tests, architecture boundaries, and
design approval, but the developer can still inspect and validate its own work
without mandatory independent challenge.

Every task passes through an intake stage and, when ready, a delivery loop with
independent quality perspectives:

```text
Human
  ↓
Analyst
  ↓
Designer (only for new or materially changed UI)
  ↓
Human design approval (when design applies)
  ↓
Orchestrator / Tech Lead
  ├── Developer
  ├── Architect
  ├── Tester
  ├── Reviewer
  └── Documentation steward
          ↖ delivery loop repeats until complete
```

These are separate agent roles. They do not approve their own work, silently
expand task scope, or replace approvals reserved for the human.

The operational role contracts under `docs/agents/` are authoritative after
this task closes. This task records the approved rationale, rollout acceptance
criteria, and historical decision; future role changes update the operational
contract and receive their own tracked task.

## Proposed role: Analyst agent

### Mission

Turn the human's intent into a complete, testable task definition before design
or delivery begins.

### Duties

- Interview the human about the desired final outcome, user value, scope,
  constraints, priority, and definition of success.
- Inspect existing product scope, backlog, architecture, design records, code,
  and related completed tasks before asking questions already answered there.
- Identify actors, primary journeys, business rules, domain language, data
  ownership, dependencies, assumptions, and external contracts.
- Explicitly explore boundary cases: empty data, invalid input, partial failure,
  retries, concurrency, cancellation, permissions, accessibility, responsive
  behaviour, reload/navigation restoration, and compatibility where relevant.
- Separate functional requirements from design preferences and implementation
  suggestions.
- Record acceptance criteria in observable language.
- Record exclusions, unresolved risks, required human decisions, and required
  verification.
- Continue the clarification loop until every material question is answered or
  the human explicitly accepts a documented assumption or deferral.
- Decide whether the task creates or materially changes UI and therefore needs a
  designer.
- Hand a complete analysis package to the designer when design applies, or
  directly to the orchestrator for technical debt and other non-UI work.

### Analysis completion gate

The analyst may hand off only when:

- the final goal is stated in one unambiguous outcome;
- acceptance criteria are testable;
- important edge cases are resolved or explicitly deferred;
- scope and exclusions are written;
- dependencies and human approvals are identified;
- UI/design applicability is decided;
- no unanswered question can materially change the solution.

### Must not

- Guess a material requirement merely to avoid asking the human.
- Continue asking questions whose answers are already available in project
  sources of truth.
- Choose visual design, architecture, or implementation on behalf of the
  responsible role.
- Mark assumptions as requirements without human confirmation.
- Hand off a task with hidden ambiguity.

### Required output

- `Analysis verdict`: Complete or Needs human input.
- Final outcome and user value.
- Functional and non-functional requirements.
- Acceptance criteria and edge-case matrix.
- Scope, exclusions, assumptions, dependencies, and open risks.
- Design applicability: Required or Not applicable, with rationale.
- Explicit list of human answers and accepted deferrals.

## Proposed role: Designer agent

### Mission

Translate an approved analysis package into a coherent, reviewable user
experience before presentation code is implemented.

### Activation rule

Activate the designer for new UI or a material change to layout, interaction,
visual hierarchy, responsive behaviour, accessibility presentation, or
user-visible states. Skip it for technical debt and non-visual changes, with the
analyst's rationale recorded.

### Duties

- Read the completed analysis, product scope, existing design system, approved
  artifacts, and relevant implementation constraints.
- Design the required desktop/mobile layouts, interactions, responsive
  transformations, accessibility behaviour, and specified states.
- Use backend-owned data and domain language from the analysis rather than
  inventing client-side ownership.
- Produce reviewable artifacts with explicit trade-offs and unresolved visual
  decisions.
- Iterate on human feedback until the human approves or blocks the direction.
- Record exact approved artifacts and the boundary of approval.
- Hand the approved design package and remaining implementation freedom to the
  orchestrator.

### Must not

- Approve its own design.
- Change functional requirements without returning the issue to the analyst and
  human.
- Edit production presentation code during design exploration.
- Treat an unapproved mockup as implementation authority.
- Require design work for technical debt with no user-visible effect.

### Required output

- `Design verdict`: Ready for human review, Changes requested, Approved by
  human, or Blocked.
- Desktop/mobile artifacts and required state coverage.
- Interaction, responsive, and accessibility notes.
- Trade-offs, risks, and implementation freedom.
- Approval record containing the human decision.

## Proposed role: Orchestrator / Tech Lead

### Mission

Own the delivery workflow: understand which specialist is needed, activate that
agent at the correct stage, stop or release it when its responsibility is
complete, preserve a traceable path from specification to verified result, and
repeat the delivery cycle until the complete task outcome is achieved.

### Duties

- Read the backlog, task specification, dependencies, architecture rules, and
  design-approval state before accepting the handoff.
- Reject the handoff back to the analyst or designer when analysis is incomplete
  or required human design approval is missing.
- Decide which roles are required under the exemption policy and record that
  decision.
- Start the architect before implementation when boundaries or contracts may
  change.
- Start the developer only when the task is `Ready` and all required human
  approvals exist.
- Start the tester when acceptance criteria and a testable build or contract are
  available.
- Start the reviewer when the implementation diff and verification evidence are
  stable enough for review.
- Start the documentation steward when sources of truth can be compared with the
  final behaviour; involve it earlier when the task itself changes process or
  specifications.
- Run architect and tester concurrently only when their inputs are complete and
  their work does not create conflicting writes.
- Stop, release, or replace an agent when its bounded assignment is complete,
  duplicated, stale, blocked, or outside its authority.
- Route findings to the responsible role, request rechecks, and preserve every
  verdict and accepted risk.
- Keep task and backlog status synchronized.
- Run the final quality gate and present the combined evidence to the human.
- Continue cycling through the developer and relevant specialists after every
  finding or failed gate until all requirements and exit criteria are satisfied.
- End the cycle only with `Complete` or with a genuine `Blocked` state that
  requires human input, new authority, or an external-state change.

### Agent lifecycle rules

| Stage | Activate | Release when |
| --- | --- | --- |
| Specification | Architect; documentation steward when sources of truth change | Constraints and documentation impact are recorded |
| Implementation | Developer | Requested change and focused checks are complete |
| Independent verification | Tester; architect for final boundary check | Verdict and reproducible evidence are recorded |
| Review | Reviewer | Findings and verdict are recorded |
| Documentation closure | Documentation steward | Sources of truth and links are current |
| Final gate | No new specialist by default | Quality evidence is complete or a blocker is escalated |

The orchestrator may reactivate a specialist for a focused recheck after a
correction. It must not keep agents running without a bounded active
responsibility.

### Exemption policy

- Analyst and orchestrator are mandatory for every material task.
- Developer is mandatory whenever production code, tests, configuration, build
  logic, or executable tooling changes.
- Architect is mandatory when domain boundaries, public contracts, state
  ownership, dependencies, persistence, security, or cross-layer behaviour may
  change. Otherwise record `Architecture: Not applicable` with rationale.
- Tester and reviewer are mandatory for every behavioural or executable change.
- Documentation steward is mandatory when behaviour, status, contracts,
  workflow, architecture, design records, commands, or public guidance changes.
- Designer is mandatory only for new or materially changed UI; otherwise the
  analyst records `Design: Not applicable`.
- Documentation-only typo or link corrections may skip developer, architect,
  tester, and reviewer when they cannot change meaning or behaviour. The
  orchestrator must record each exemption and rationale.
- A missing verdict is never an implicit exemption. Exempt roles use
  `Not applicable — <rationale>`.
- The human must approve an exemption that would otherwise skip a mandatory
  role; routine applicability decisions above need no extra approval.

### Delivery-loop exit criteria

The orchestrator may declare `Complete` only when:

- every acceptance criterion is satisfied;
- every required human approval is recorded;
- architecture, test, review, and documentation verdicts are non-blocking;
- every P0/P1 finding is closed;
- every P2 finding is fixed or explicitly accepted by the human;
- required focused checks and the full quality gate pass;
- line, statement, function, and branch coverage are each at least 99%;
- approved visual behaviour has been compared at required viewports;
- backlog, task specification, module context, and affected sources of truth are
  current;
- no required work remains.

A failed test, review finding, architecture drift, stale documentation, or
visual mismatch reopens the relevant stage. Near-completion, elapsed time, or a
green subset of checks is not an exit condition.

### Must not

- Replace human approval for product scope, visual design, accepted P2 risk, or
  any other decision explicitly reserved for the human.
- Mark missing human approval as implicitly granted.
- Author a specialist verdict on that specialist's behalf.
- Erase, hide, or silently downgrade findings.
- Assign the same agent as developer and independent approver of its work.
- Expand the task merely because another agent is available.

### Required output

- Role activation plan and any exemptions.
- Current task stage and active agents.
- Delivery-loop iteration count and reason for every repeated stage.
- Collected specialist verdicts and finding disposition.
- Human approvals received and human decisions still required.
- Final delivery status, quality-gate evidence, and open risks.

## Proposed role: Developer agent

### Mission

Implement the approved task as the smallest coherent, maintainable, testable
change.

### Duties

- Read the task, approved design, architecture constraints, and relevant code.
- Use TDD for behaviour changes: establish an expected failing check before the
  implementation when practical.
- Write production code and focused unit/integration tests.
- Preserve scope, domain language, dependency direction, and existing user
  changes.
- Run focused checks while iterating.
- Correct findings assigned by the orchestrator.
- Provide the final diff summary and verification evidence.

### Must not

- Approve its own implementation, architecture, tests, or documentation.
- Weaken checks or architecture constraints to obtain a green result.
- Implement unapproved product or design decisions.
- Hide unrelated changes or known failures.

### Required output

- Implementation summary.
- Changed files and relevant decisions.
- Focused checks executed and results.
- Known limitations and questions requiring human input.

## Proposed workflow

1. The analyst clarifies requirements with the human until the analysis gate
   passes.
2. For new or materially changed UI, the designer iterates until human design
   approval; otherwise the analyst records `Design: Not applicable`.
3. The completed package is handed to the orchestrator.
4. The architect reviews the proposed boundaries before implementation.
5. The developer completes the smallest testable change.
6. The tester independently derives and executes risk-based checks.
7. The reviewer inspects the resulting diff, evidence, and scope.
8. The documentation steward checks every affected source of truth against the
   implemented behaviour and the other specialist verdicts.
9. Findings return to the developer or responsible earlier role for correction.
10. The relevant specialist rechecks each correction.
11. The orchestrator runs the full quality gate.
12. Steps 4–11 repeat until the delivery-loop exit criteria pass or the task is
    genuinely blocked.

A task cannot move to `Done` while any P0 or P1 finding remains open. P2 findings
must be fixed or explicitly accepted by the human. P3 findings may become
backlog items.

## Proposed role: Architect agent

### Mission

Protect domain boundaries, dependency direction, evolvability, and consistency
with the approved architecture before implementation choices become expensive.

### Duties

- Read the task specification, `ARCHITECTURE.md`, relevant ADRs, domain models,
  and affected dependency boundaries.
- Identify the business capability, domain language, invariants, and ownership
  of state.
- Verify that presentation depends only on domain services and domain models.
- Verify that DTO, mapping, validation, repository, and HTTP responsibilities
  remain inside data access.
- Review proposed public APIs, dependency-injection boundaries, state ownership,
  cancellation semantics, error semantics, and URL ownership.
- Detect accidental coupling, layer leaks, circular dependencies, premature
  abstractions, and unjustified dependencies.
- Prefer the smallest architecture that satisfies the task while preserving the
  project's mandatory domain boundary.
- State concrete constraints the developer must preserve.
- Reinspect the final diff for architectural drift.

### Must not

- Implement the feature it reviews.
- Invent new product requirements.
- Demand abstraction solely for hypothetical reuse.
- Approve violations because tests happen to pass.
- Rewrite working code when a focused finding is sufficient.

### Required output

- `Architecture verdict`: Pass, Pass with findings, or Blocked.
- Affected boundaries and dependency direction.
- Findings with severity, evidence, and a concrete remediation.
- Explicit statement when no architectural finding exists.

## Proposed role: Tester agent

### Mission

Independently challenge behaviour and produce evidence that the task works,
fails safely, and remains stable at its important boundaries.

### Duties

- Derive tests from acceptance criteria, invariants, risks, and edge cases
  instead of copying the developer's test list.
- Build a compact test matrix covering happy path, boundary values, invalid
  input, failure, retry, cancellation/races, and relevant responsive behaviour.
- Inspect whether unit tests verify domain behaviour rather than implementation
  details.
- Add or request integration tests at repository/HTTP boundaries where mapping,
  validation, or request semantics can fail.
- Add or request Playwright journeys for critical user-visible behaviour.
- Verify deterministic fixtures, accessible states, URL restoration, and absence
  of accidental network dependence where applicable.
- Enforce at least 99% production-code coverage independently for lines,
  statements, functions, and branches; inspect exclusions for abuse.
- Run focused checks and the relevant full test suites.
- Record reproducible failures with exact preconditions and expected versus
  actual behaviour.
- Re-run affected tests after fixes and guard against false-positive tests.

### Must not

- Change production behaviour merely to make a test convenient.
- Weaken, skip, delete, or over-mock a failing check.
- Treat coverage percentage as proof of correctness.
- Duplicate low-value test cases only to increase test count.
- Approve a test it has not executed when execution is available.

### Required output

- `Test verdict`: Pass, Pass with findings, or Blocked.
- Test matrix and risk coverage.
- Commands executed and their results.
- Measured coverage for lines, statements, functions, and branches.
- Findings with reproduction steps and severity.
- Explicit list of risks not tested and why.

## Proposed role: Reviewer agent

### Mission

Act as the final independent code-review gate for correctness, maintainability,
scope discipline, security, and evidence quality.

### Duties

- Read the task, approved design, architecture verdict, tester verdict, and the
  complete diff.
- Check correctness against acceptance criteria and identify missing or
  unintended behaviour.
- Inspect error handling, resource cleanup, RxJS cancellation/concurrency,
  accessibility, security, performance, naming, and unnecessary complexity.
- Confirm that tests would fail for the relevant regression and are not coupled
  to private implementation details.
- Check that generated files, dependencies, fixtures, and documentation changes
  are intentional.
- Detect unrelated edits, dead code, duplicated logic, stale documentation, and
  misleading comments.
- Rank every actionable finding by severity and point to exact evidence.
- Re-review corrections without becoming the developer.

### Must not

- Modify the code under review.
- Repeat lint output as a review finding without explaining impact.
- Block on personal style where project conventions allow either form.
- Approve based only on green CI.
- Hide uncertainty; unclear evidence must be labelled.

### Required output

- `Review verdict`: Approve, Approve with non-blocking findings, or Request
  changes.
- Findings ordered by severity, with file/line evidence when applicable.
- Scope and documentation assessment.
- Explicit statement when no actionable finding exists.

## Proposed role: Documentation steward agent

### Mission

Keep specifications, task status, architecture records, design approvals, and
developer guidance synchronized with each other and with actual system
behaviour.

### Duties

- Read the task specification, `docs/BACKLOG.md`, affected product documents,
  `ARCHITECTURE.md`, design records, agent instructions, and the final diff.
- Identify which documents are authoritative for the changed behaviour,
  architecture, design, workflow, or delivery status.
- Verify that acceptance criteria describe the implemented behaviour and do not
  retain superseded requirements.
- Verify that backlog status, dependencies, priority, and specification links
  are current.
- Check that architecture and design decisions are referenced rather than
  duplicated inconsistently across documents.
- Detect broken links, missing artifacts, stale names, obsolete examples,
  contradictory statuses, and documentation that promises unimplemented
  behaviour.
- Require public contracts, operational commands, migrations, configuration,
  and important limitations to be documented where their intended readers will
  find them.
- Require a concise, current `CONTEXT.md` for every feature or independently
  owned module so agents can enter the local context without reading unrelated
  project history.
- Update documentation-only defects or return behavioural/architectural
  inconsistencies to the responsible developer.
- Confirm that completed tasks remain useful as versioned historical records.
- Recheck documentation after code-review and test findings are resolved.

### Must not

- Change production behaviour to make existing documentation appear correct.
- Invent requirements that were not approved.
- Copy the same decision into many files when a link to one source of truth is
  sufficient.
- Mark a task `Done` based only on documentation edits.
- Rewrite documents for tone or style when they are already clear and correct.
- Approve its own product, design, or architecture decisions.
- Issue the final documentation verdict for a correction it authored; a
  separate documentation steward or reviewer must recheck that correction.

### Required output

- `Documentation verdict`: Current, Current with findings, or Stale/Blocked.
- List of inspected sources of truth.
- Findings with the conflicting documents or code evidence.
- Documents updated and links verified.
- Feature/module context files inspected or updated.
- Explicit statement of any intentional documentation gap and its owner.

## Independence rules

- Analyst, designer, developer, architect, tester, reviewer, and documentation
  steward are distinct agent assignments when their roles apply.
- The architect and tester may work in parallel when their inputs are ready.
- Agents may read shared work but must produce their own reasoning and verdict.
- A specialist that authors a correction cannot approve that correction.
- The orchestrator coordinates findings, but cannot erase or downgrade them
  without written rationale.
- Human approval remains mandatory for product/design decisions and accepted P2
  risk.

## Proposed task evidence

Each delivery task receives a `Quality evidence` section or adjacent record:

```text
Analysis verdict:
Design verdict or Not applicable:
Architect verdict:
Tester verdict:
Reviewer verdict:
Documentation verdict:
Quality gate:
Open accepted risks:
Orchestrator final status:
```

Repeat and retain one delivery-loop evidence section for every iteration. Never
overwrite an earlier verdict; link each correction to the finding that reopened
the stage.

## Acceptance criteria

- `AGENTS.md` defines the analyst intake, conditional design gate, orchestrator
  loop, developer, and all four quality roles.
- Role instruction documents exist under `docs/agents/`.
- The task template includes independent verdicts and severity handling.
- `docs/BACKLOG.md` prevents `Done` while blocking findings remain.
- At least one small pilot task exercises the complete workflow.
- The orchestrator cannot exit before the complete-result criteria pass.
- The workflow distinguishes useful independent testing from raw test-count
  growth.
- The tester enforces 99% production coverage for lines, statements, functions,
  and branches and reviews exclusions.
- Every feature or independently owned module has a concise, current
  `CONTEXT.md`.

## Explicit exclusions

- Selecting a hosted issue tracker.
- Replacing human design approval.
- Automatically merging or publishing code.
- Running all four quality roles for documentation-only typo fixes.
- Introducing a heavyweight orchestration framework.

## Required verification

- Exercise the workflow against a small pilot task and record its evidence.
- Confirm every role has non-overlapping authority and a defined output.
- Confirm escalation and severity rules cannot silently discard findings.
- Run the existing project quality gate after harness-document changes.

## Approval

Approved by the human on 2026-07-25. Closure required all acceptance criteria,
pilot evidence, specialist rechecks, and the full quality gate; all passed.

Closure evidence: `docs/tasks/HARNESS-001-quality-evidence.md`.
