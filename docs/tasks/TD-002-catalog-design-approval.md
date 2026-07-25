# Technical debt 002: Approve the catalog design

## Status

Superseded by `002-storefront-layout-and-product-groups-design.md`.

## Problem

The catalog UI was implemented before the project introduced a design gate. Its
behaviour is tested, but its visual hierarchy and direction were never reviewed
against alternative mockups or explicitly approved.

The replacement task expands the design scope to the complete storefront layout
and backend-driven product-group navigation, so this narrower task must not be
implemented independently.

## Design record

- Brief: `docs/design/catalog/brief.md`
- Approval: `docs/design/catalog/approval.md`

## Required work

1. Designer agent inspects the current desktop and mobile catalog.
2. Designer agent produces 2–3 distinct variants covering all required states.
3. Human reviewer selects a variant or requests changes.
4. Approval record is updated only after explicit human approval.
5. Implementation is aligned to the approved design.
6. Desktop and mobile screenshots are compared with approved artifacts.

## Constraints

- Behaviour and domain architecture must remain unchanged.
- Do not combine this task with cart implementation.
- Current UI is a reference, not an automatically approved variant.
- The designer agent cannot approve its own proposal.

## Definition of done

- Catalog design record has status `Approved`.
- Approved artifacts cover desktop, mobile, loading, empty, error, and success.
- Human approval is recorded.
- Implementation matches the approved direction.
- `npm run verify` passes.
- Post-implementation screenshots and intentional differences are recorded.
