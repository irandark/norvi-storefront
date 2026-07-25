# DEVOPS-001: Publish the frontend to GitHub and add CI

## Status

In progress — remote bootstrap protected; initial-import PR in preparation.

## Outcome

The complete frontend project is versioned in a GitHub repository and every
push or pull request is protected by the same quality gates used locally.

## Confirmed context

- GitHub account: `irandark`.
- The project is not currently a Git repository.
- GitHub is the selected hosting provider.
- `.gitignore` already excludes dependencies, build output, coverage output,
  Angular cache, temporary files, and system files.
- Local source of truth remains `docs/BACKLOG.md`.
- Current full gate: `npm run verify`.
- Current tests enforce at least 99% statements, branches, functions, and lines.

## Proposed scope

- Initialize Git in the `shop/` directory.
- Use `main` as the default branch.
- Create the GitHub repository under the human-selected owner and name.
- Commit the current project as the intentional initial baseline.
- Push `main` to GitHub.
- Add GitHub Actions for:
  - deterministic `npm ci`;
  - lint;
  - 99% unit coverage gate;
  - production build;
  - Playwright E2E with cached browser dependencies where safe.
- Add concurrency cancellation for superseded runs on the same branch/PR.
- Upload Playwright diagnostics only on failure.
- Document local and CI commands in the repository context.

## CI contract

- Workflow: `.github/workflows/quality-gate.yml`.
- Events: pull requests targeting `main` and pushes to `main`.
- Permissions: `contents: read`.
- Required job/check: `quality-gate`.
- Runner: `ubuntu-24.04`.
- Runtime: Node.js `24.14.0`, npm `11.11.0`.
- Install: `npm ci`.
- Browser: lockfile-matched Playwright CLI installs Chromium with system
  dependencies.
- Gate: `npm run verify`.
- Timeout: 20 minutes.
- Concurrency: one active run per PR or ref; newer runs cancel older ones.
- Diagnostics: Playwright report/results uploaded only on failure for 7 days.
- Actions are pinned to immutable commit SHAs.

## Branch protection contract

- One explicitly documented minimal bootstrap commit creates `main`.
- Protection is enabled immediately after that bootstrap push.
- The complete project is imported through `agent/initial-import`.
- Pull requests and the `quality-gate` check are mandatory.
- Direct push, force push, and branch deletion are prohibited after bootstrap.
- Required approvals: zero initially because this is a single-maintainer
  learning repository; the PR itself and green CI remain mandatory.
- Required branch freshness: enabled.
- Administrator bypass: disabled where the GitHub plan/API permits.
- Local `main` tracks `origin/main` only after the protected initial PR is
  merged.

## Decisions requiring human input

Resolved on 2026-07-25:

- Owner/name: `irandark/norvi-storefront`.
- Visibility: public.
- Delivery policy: changes reach `main` only through pull requests.
- Task isolation: every backlog task uses its own branch and pull request;
  unrelated task keys are never combined.
- Merge policy: required CI must pass before merge.
- Bootstrap strategy: GitHub creates the initial remote `main`; the complete
  local project is introduced from `agent/initial-import` through the first PR,
  avoiding a direct project push to `main`.

## Acceptance criteria

- Git repository root is exactly `shop/`.
- Default branch is `main`.
- No ignored dependency, build, coverage, cache, or secret file is committed.
- Repository exists under the approved GitHub owner/name/visibility.
- Local `main` tracks the GitHub remote.
- The agent role contract requires one dedicated branch and pull request per
  backlog task.
- CI uses the committed lockfile with `npm ci`.
- CI runs lint, unit coverage, build, and Playwright.
- Coverage below 99% in any required metric fails CI.
- A failing stage makes the workflow fail.
- Successful and failed workflow behaviour is verified on GitHub.
- README documents setup, local gates, CI, architecture, backlog, and approved
  design entry points.

## Edge cases and safeguards

- Repository creation must not generate a competing remote README or `.gitignore`.
- Secrets, tokens, environment files, and local IDE state must be checked before
  the initial commit.
- GitHub Actions permissions use least privilege.
- E2E server port and browser installation are deterministic in CI.
- Concurrent pushes must not leave an older run as the authoritative result.
- Native Angular build cache remains disabled until its documented LMDB crash is
  resolved.
- The sole direct-main exception is the minimal bootstrap commit required to
  create the base branch; it contains no application code.

## Design applicability

`Design: Not applicable` — repository and CI work has no product UI effect.

## Required verification

- Analyst verdict: Complete.
- Architect reviews CI boundaries, permissions, and reproducibility.
- Developer prepares Git/Actions/documentation changes.
- Tester runs the full local gate and verifies the first Actions run.
- Reviewer inspects the exact initial commit and workflow.
- Documentation steward verifies README, backlog, task status, and context.
- Orchestrator loops until local and remote gates pass.

## Explicit exclusions

- Deploying the application to production hosting.
- GitHub Issues/Projects synchronization with `BACKLOG.md`.
- Dependabot or automated dependency-update policy.
- Release tags and semantic-release.
- Environment-specific deployment secrets.
