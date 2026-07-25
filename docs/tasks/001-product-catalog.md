# Task 001: Product catalog

## Status

Completed on 2026-07-25.

## User-visible outcome

As a shopper, I can open the storefront and see the available products with
enough information to decide what to explore next.

This is the first vertical product slice. It establishes the HTTP boundary and
the standard UI states that later features will reuse.

## Scope

Build the catalog route at `/` and load its data through HTTP from the local
fixture `/data/products.json`.

Each product contains:

```text
id            stable non-empty string
name          non-empty display name
description   short display description
priceInCents  positive integer
imageUrl      local image path
stock         non-negative integer
```

Provide six realistic fixture products. Product images must be local assets so
the baseline remains deterministic and does not depend on an external service.

## Acceptance criteria

### Loading

- A visible loading status appears while the request is unresolved.
- The loading status is accessible to assistive technology.
- Product cards and the empty state are not shown while loading.

### Loaded catalog

- Every returned product is rendered exactly once.
- Each card shows its image, name, description, formatted ruble price, and
  availability.
- Prices are derived from `priceInCents`; floating-point money is not introduced
  into the domain model.
- A product with zero stock is visibly marked as unavailable.
- Product images have meaningful alternative text.

### Empty catalog

- A successful response containing an empty array shows a dedicated empty state.
- Loading, error, and product cards are not shown in the empty state.

### Failure and retry

- A failed request shows a clear error message without exposing a raw technical
  exception.
- The error state contains a `Попробовать снова` button.
- Retry starts a new request, returns the UI to loading, and can recover to the
  loaded state.
- Previous error content does not remain visible after a successful retry.

### Responsive behaviour

- Cards form a single column on a narrow mobile viewport.
- Cards use available space in multiple columns on a desktop viewport.
- The page does not create horizontal scrolling at 375 CSS pixels.

## Architecture constraints

- HTTP access belongs to a catalog data-access boundary, not to a component.
- Components consume explicit loading, success, empty, and error state.
- External JSON is treated as runtime data and validated before entering domain
  logic.
- Invalid product data fails the catalog load as a controlled error.
- UI code does not perform monetary arithmetic with floating-point values.
- Catalog code lives under `src/app/features/catalog/`.
- Reusable currency formatting may live under `src/app/shared/`.
- Do not create empty placeholder directories.

The implementation may choose the Angular reactive primitive that best expresses
these states, but it must keep the HTTP boundary independently testable.

## Test-first scenarios

Add the following checks before completing the implementation and observe them
fail for the expected missing behaviour.

### Unit tests

1. Valid runtime data is converted to catalog products.
2. A fractional, negative, or missing `priceInCents` is rejected.
3. A negative or fractional stock value is rejected.
4. The catalog renders every supplied product.
5. Zero stock renders the unavailable state.
6. An empty result renders only the empty state.
7. A failed load renders the friendly error and retry action.
8. Retry performs a new load and can recover successfully.

Prefer behaviour assertions over private implementation details. Do not test
Angular or RxJS themselves.

### Browser tests

1. Intercept `/data/products.json`, return known products, and verify the catalog.
2. Delay the intercepted response and verify loading is visible first.
3. Return an empty array and verify the empty state.
4. Fail the first request, verify the error, then allow retry to succeed.
5. Check the main journey at desktop and 375-pixel mobile widths.

## Explicit exclusions

- Adding products to a cart
- Product details navigation
- Search, filtering, sorting, or pagination
- A real backend or database
- Server-side rendering
- Authentication
- Third-party UI, state-management, or validation libraries
- Snapshot-only tests

## Definition of done

- All acceptance criteria have executable coverage at the appropriate level.
- The new tests were observed failing for the intended reason before the
  implementation was completed.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run build` passes.
- `npm run e2e` passes in Chromium.
- The catalog is manually inspected at desktop and mobile widths.
- The implementation does not weaken or remove an existing check.

## Open product decisions

These are intentionally deferred until a later task:

- Whether unavailable products can be added to a wishlist
- Whether prices include tax
- Whether the catalog order is editorial or server-defined
- Whether product descriptions need truncation rules

## Verification record

- Parser red stage: 6 tests failed against the intentional unimplemented boundary.
- HTTP red stage: 1 test failed against the intentional unimplemented loader.
- UI red stage: 5 tests failed against the generated placeholder component.
- Unit suite: 14 tests passed across 4 files.
- Browser suite: 5 Chromium scenarios passed.
- Production build: passed.
- ESLint: passed.
- Manual browser inspection: desktop and 375-pixel mobile layouts checked.
- Browser console: zero errors and zero warnings.
