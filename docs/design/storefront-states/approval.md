# Storefront states design approval

## Status

Approved

The product owner explicitly approved Variant A and its complete desktop/mobile
state and interaction contract on 2026-07-26.

## Review candidates

- Variant A — Context shield (**designer recommendation**)
- Variant B — Confirmed transition

The complete decision record and artifact index are in `brief.md`.

## Human approval

Approval request presented to the product owner:

> Утверждаете Variant A целиком для desktop и mobile, включая loading/refetch,
> ошибки, empty states, selected/focus, поведение панели, retry и
> accessibility?

Product-owner response:

> пойдет, продолжаем

This explicit response approves Variant A — Context shield and all listed
surfaces and behaviour in the request.

## Approval fields

- Approved variant: Variant A — Context shield
- Approving human: product owner
- Approval date: 2026-07-26
- Approved artifacts:
  - `approved/desktop-overview.png`
  - `approved/mobile-overview.png`
  - `approved/desktop-matrix.png`
  - `approved/mobile-matrix.png`
  - `approved/desktop-interactions.png`
  - `approved/mobile-interactions.png`
- Explicit requested changes: None recorded
- Details intentionally delegated to implementation: None; implementation must
  follow the decisions and copy in `brief.md` and the approved artifacts.

## Approval boundary

Approval covers Variant A in full at 1440 × 1000 desktop and 375 × 812 mobile:
initial loading and skeleton-based refetch, group/product/combined failures,
all-products and selected-group empty states, recovery, selected/hover/focus
treatments, non-modal desktop panel, modal mobile sheet, all recorded close
events and focus lifecycle, retry placement/copy, screen-reader announcements,
long-list scrolling, and reduced-motion behaviour.

The immutable approved PNGs are copied from the reviewed Variant A exploration.
The Variant B exploration remains unapproved reference material. A material
departure from Variant A requires a new human review.
