# Norvi Storefront

Small Angular storefront for practising harness-driven development with explicit
domain boundaries, human-approved UI, independent agent roles, and enforced
quality gates.

## Requirements

- Node.js 24.14.0
- npm 11.11.0
- Chromium for Playwright

## Setup

```bash
npm ci
npx playwright install chromium
npm start
```

The local application runs at `http://localhost:4200`.

## Quality gates

```bash
npm run lint
npm run test
npm run build
npm run e2e
npm run verify
```

Unit tests enforce at least 99% statements, branches, functions, and lines over
all production TypeScript under `src/`. `npm run verify` runs lint, coverage
tests, production build, and Playwright E2E.

GitHub Actions runs the same gate for every pull request targeting `main` and
after every merge to `main`. Direct pushes to `main` are prohibited; changes
arrive through pull requests with the required `quality-gate` check.

## Project map

- Product scope: [`docs/product/storefront.md`](docs/product/storefront.md)
- Task board: [`docs/BACKLOG.md`](docs/BACKLOG.md)
- Architecture: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Agent workflow: [`AGENTS.md`](AGENTS.md)
- Task specifications: [`docs/tasks/`](docs/tasks/)
- Design process: [`docs/design/README.md`](docs/design/README.md)
- Approved storefront design:
  [`docs/design/storefront-layout/approval.md`](docs/design/storefront-layout/approval.md)
- Application context: [`src/app/CONTEXT.md`](src/app/CONTEXT.md)
- Catalog context:
  [`src/app/features/catalog/CONTEXT.md`](src/app/features/catalog/CONTEXT.md)

## Architecture boundary

```text
Presentation
→ Domain service
→ Domain port
← Repository adapter
→ HTTP transport / DTO
```

Components communicate through domain services and domain models. DTOs,
repository adapters, transports, and `HttpClient` stay behind the data-access
boundary.

## Delivery workflow

```text
Analyst
→ Designer when UI changes
→ Human approval
→ Orchestrator
→ Architect / Developer / Tester / Reviewer / Documentation steward
→ Complete
```

See the role contracts in [`docs/agents/`](docs/agents/).
