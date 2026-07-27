# Project backlog

This file is the repository-owned task board. It is the source of truth for
planning until an external tracker is connected. Every implementation task must
link to a detailed specification under `docs/tasks/`.

## Workflow

```text
Backlog → Ready → In progress → In review → Done
                         ↘ Blocked
```

| Field         | Meaning                                                  |
| ------------- | -------------------------------------------------------- |
| Key           | Stable project identifier; never reuse it                |
| Type          | Story, Task, Bug, Design, Tech debt, or DevOps           |
| Priority      | P0 critical, P1 high, P2 normal, P3 low                  |
| Status        | Backlog, Ready, In progress, In review, Blocked, or Done |
| Depends on    | Keys that must be completed first                        |
| Specification | Detailed scope and acceptance criteria                   |

## Active board

| Key        | Type      | Summary                                                                   | Priority | Status  | Depends on               | Specification                                       |
| ---------- | --------- | ------------------------------------------------------------------------- | -------- | ------- | ------------------------ | --------------------------------------------------- |
| TD-003     | Tech debt | Introduce reusable design tokens for all shared style values              | P1       | Done    | SHOP-002                 | `docs/tasks/TD-003-reusable-design-tokens.md`       |
| TD-004     | Tech debt | Enforce architecture boundaries with a tested static import guard          | P2       | Done    | TD-001                   | `docs/tasks/TD-004-architecture-import-guard.md`    |
| HARNESS-002 | Task     | Keep backlog and task statuses continuously synchronized                   | P2       | Done    | HARNESS-001                | `docs/tasks/HARNESS-002-live-backlog-status.md`     |
| HARNESS-003 | Task     | Enforce Angular composition and reusable capability boundaries             | P1       | Done    | HARNESS-001, TD-004      | `docs/tasks/HARNESS-003-angular-composition-and-capability-rules.md` |
| TD-005     | Tech debt | Refactor the project to comply with Angular composition and capability rules | P1    | Backlog | SHOP-003, HARNESS-003, TD-004 | `docs/tasks/TD-005-project-wide-angular-architecture-refactor.md` |
| SHOP-003   | Story     | Implement the approved storefront layout and backend-owned product groups | P1       | Done    | SHOP-002, TD-001, TD-003, DESIGN-003 | `docs/tasks/SHOP-003-approved-storefront-and-product-groups.md` |
| DESIGN-003 | Design    | Design loading, error, empty, focus, selected, and refetch states         | P1       | Done    | SHOP-002                 | `docs/tasks/DESIGN-003-storefront-states-and-interactions.md` |
| DEVOPS-001 | DevOps    | Publish the frontend to GitHub and add Actions quality gates              | P2       | Done    | HARNESS-001              | `docs/tasks/DEVOPS-001-github-repository-and-ci.md` |
| SHOP-004   | Story     | Add products to the cart                                                  | P2       | Backlog | SHOP-003                 | To create                                           |
| SHOP-005   | Story     | Change quantities, remove lines, and restore the cart                     | P2       | Backlog | SHOP-004                 | To create                                           |
| SHOP-006   | Story     | Submit checkout exactly once                                              | P2       | Backlog | SHOP-005                 | To create                                           |

## Completed

| Key         | Type      | Summary                                        | Status     | Specification                                                   |
| ----------- | --------- | ---------------------------------------------- | ---------- | --------------------------------------------------------------- |
| HARNESS-001 | Task      | Full analyst-to-delivery multi-agent harness   | Done       | `docs/tasks/HARNESS-001-multi-agent-quality-roles.md`           |
| SHOP-001    | Story     | Product catalog vertical slice                 | Done       | `docs/tasks/001-product-catalog.md`                             |
| SHOP-002    | Design    | Storefront layout and product-group navigation | Done       | `docs/tasks/002-storefront-layout-and-product-groups-design.md` |
| TD-001      | Tech debt | Introduce the catalog domain boundary          | Done       | `docs/tasks/TD-001-catalog-domain-boundary.md`                  |
| TD-002      | Tech debt | Approve the original catalog design            | Superseded | `docs/tasks/TD-002-catalog-design-approval.md`                  |

## Working rules

1. New work receives a key and backlog row before implementation begins.
2. `Ready` means acceptance criteria, dependencies, exclusions, verification,
   and any required design approval are present.
3. Only one status is recorded for a task.
4. An agent updates the row when work starts, becomes blocked, enters review, or
   completes.
5. `Done` requires the task's own definition of done and quality gate.
6. Finding severity is separate from task priority: P0 is critical, P1 is
   blocking/high, P2 is material/normal, and P3 is minor/follow-up. Open P0/P1
   findings prevent `Done`; P2 requires a fix or explicit human risk acceptance;
   P3 may become a linked backlog item.
7. Product and architecture decisions remain in their dedicated source-of-truth
   documents; this board links to them instead of duplicating them.
8. If Jira or another tracker is connected later, external issue keys are added
   without changing these stable repository keys.
9. This board is live operational state. Update a task row immediately when the
   actual work stage changes; never wait until the end of a turn, handoff, or PR.
10. Apply every status transition to this board and the detailed task
    specification in the same commit or pull-request update that establishes
    the transition.
11. Before each specialist handoff and human progress report, reconcile the
    board, task specification, quality evidence, branch/PR state, and actual
    delivery stage. Stale status is a process defect and is corrected before
    further work.
