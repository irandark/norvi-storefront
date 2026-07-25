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
| SHOP-003   | Story     | Implement the approved storefront layout and backend-owned product groups | P1       | Backlog | SHOP-002, TD-001, TD-003 | To create before implementation                     |
| DESIGN-003 | Design    | Design loading, error, empty, focus, selected, and refetch states         | P1       | Backlog | SHOP-002                 | To create before presentation work                  |
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
