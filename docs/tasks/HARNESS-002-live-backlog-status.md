# HARNESS-002: Keep backlog and task statuses continuously synchronized

## Status

Done on protected merge of PR #4.

## Outcome

The repository backlog always reflects the actual delivery stage. Humans and
agents do not have to reconstruct whether a task is ready, active, under
review, blocked, or complete from chat history, branch names, or stale task
documents.

## Design

Design: Not applicable — this task changes delivery governance documentation
only.

## Acceptance criteria

1. `AGENTS.md` defines the backlog as live operational state.
2. Every transition to `Ready`, `In progress`, `In review`, `Blocked`, or
   `Done` is recorded immediately.
3. The backlog row and detailed task specification change together.
4. Status updates are part of the commit or PR change that establishes the
   transition rather than deferred until closure.
5. Every specialist handoff and human progress report includes a reconciliation
   of backlog, task spec, quality evidence, branch/PR state, and actual stage.
6. Stale status is explicitly classified as a process defect that must be
   corrected before further work.

## Scope

- `AGENTS.md`
- backlog working rules
- task-specification guidance

## Explicit exclusions

- Automated synchronization with an external issue tracker
- Runtime application or storefront changes
- Changing the existing workflow states

## Required verification

- The three governance sources use consistent requirements and terminology.
- The backlog row and this specification remain synchronized through the
  dedicated pull request.

## Definition of done

- Documentation review finds no conflicting status guidance.
- Mandatory CI passes.
- The dedicated pull request is merged.
