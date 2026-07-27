# Module context: shared presentation

## Responsibility

Owns reusable, business-agnostic UI interaction behaviour. It contains no
catalog, product, routing, repository, transport, or HTTP concepts.

## Public surface

Consumers import only the standalone directive they use:

- `FocusTrapRestoreDirective` — initial focus, optional Tab containment, and
  asynchronous focus restoration after an overlay closes;
- `RovingFocusDirective` — Arrow/Home/End movement among host-scoped options;
- `OutsideClickDirective` — explicitly enabled document pointer boundary with
  anchor exclusions;
- `BodyScrollLockDirective` — explicitly enabled, reference-counted body lock.

## Data and control flow

Signal inputs explicitly enable each behaviour. Directives acquire Angular and
DOM dependencies during construction but register listeners or mutate/focus DOM
only while enabled. Disable and destroy release every owned listener or body
state. Catalog navigation composes the directives but does not move catalog
business language into them.

## Invariants

- Standalone and business-agnostic.
- Host-scoped queries except for inherently global document/body boundaries.
- Idempotent activation and cleanup.
- Host bindings instead of `@HostListener`.
- No Router, domain, repository, transport, or `HttpClient` dependencies.
- Overlapping scroll locks cannot release one another.

## Verification

`ui-interaction-directives.spec.ts` covers focus, keyboard, outside-click,
reference counting, disabled behaviour, repeated activation, and cleanup.
Run `npm test`, `npm run lint`, and the browser navigation journeys.
